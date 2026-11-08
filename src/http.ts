import { IntegrationApiError } from './errors.ts';

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export type QueryValue =
    string | number | boolean | null | undefined | Array<string | number>;

export type Query = Record<string, QueryValue>;

export interface TransportOptions {
    /** Origin and prefix, e.g. `https://my.storehugs.com/api/admin/v1`. */
    baseUrl: string;
    /** Headers sent with every request (keys, tokens). */
    headers: () => Record<string, string | undefined>;
    /** Defaults to the global `fetch`. */
    fetch?: FetchLike;
    /** Retries after 429 and 503 answers and network errors (default 2). Writes are retried with the same `Idempotency-Key`. */
    maxRetries?: number;
    /** How long to keep waiting, in milliseconds, while a retried write still runs on the server (409 `idempotency_in_progress`; default 30000). */
    inProgressTimeoutMs?: number;
}

export interface RequestOptions {
    query?: Query;
    body?: unknown;
    headers?: Record<string, string | undefined>;
    /** Set for writes automatically; pass your own to retry across processes, or `false` to send none. */
    idempotencyKey?: string | false;
    signal?: AbortSignal;
}

/** A Laravel cursor page, as every Admin API list returns. */
export interface CursorPage<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        path: string;
        perPage: number;
        nextCursor: string | null;
        prevCursor: string | null;
    };
}

const RETRIED_STATUSES = new Set([429, 503]);
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_RETRY_AFTER_SECONDS = 60;
const IN_PROGRESS_DELAY_MS = 1000;

/**
 * The HTTP layer both clients share: JSON in and out, an `Idempotency-Key`
 * on every write (kept across retries, so a retried write never runs twice),
 * retries after rate limits, and coded errors.
 */
export class Transport {
    private readonly options: TransportOptions;

    constructor(options: TransportOptions) {
        this.options = options;
    }

    async request<T>(
        method: string,
        path: string,
        options: RequestOptions = {},
    ): Promise<T> {
        const fetcher = this.options.fetch ?? globalThis.fetch;
        const maxRetries = this.options.maxRetries ?? 2;
        const isWrite = WRITE_METHODS.has(method);
        const idempotencyKey =
            options.idempotencyKey === false
                ? undefined
                : (options.idempotencyKey ??
                  (isWrite ? crypto.randomUUID() : undefined));

        const headers: Record<string, string> = { Accept: 'application/json' };

        for (const [name, value] of Object.entries({
            ...this.options.headers(),
            ...options.headers,
        })) {
            if (value !== undefined) {
                headers[name] = value;
            }
        }

        if (idempotencyKey !== undefined) {
            headers['Idempotency-Key'] = idempotencyKey;
        }

        if (options.body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }

        const url = this.url(path, options.query);
        const init: RequestInit = {
            method,
            headers,
            body:
                options.body === undefined
                    ? undefined
                    : JSON.stringify(options.body),
            signal: options.signal,
        };
        const retriable = !isWrite || idempotencyKey !== undefined;
        const inProgressTimeout = this.options.inProgressTimeoutMs ?? 30_000;
        const startedAt = Date.now();

        for (let attempt = 0; ; attempt++) {
            let response: Response;

            try {
                response = await fetcher(url, init);
            } catch (error) {
                if (
                    !retriable ||
                    attempt >= maxRetries ||
                    options.signal?.aborted
                ) {
                    throw error;
                }

                await sleep(backoff(attempt));
                continue;
            }

            if (
                RETRIED_STATUSES.has(response.status) &&
                retriable &&
                attempt < maxRetries
            ) {
                await sleep(retryAfter(response) ?? backoff(attempt));
                continue;
            }

            // A retry reached the server while the first attempt still runs:
            // wait for it under the same key, whose answer is then replayed.
            if (
                idempotencyKey !== undefined &&
                response.status === 409 &&
                Date.now() - startedAt < inProgressTimeout &&
                (await isInProgress(response))
            ) {
                attempt--;
                await sleep(retryAfter(response) ?? IN_PROGRESS_DELAY_MS);
                continue;
            }

            return (await this.parse(response)) as T;
        }
    }

    /** Every item of a cursor-paged list, fetching pages as they are read. */
    async *paginate<T>(
        path: string,
        query: Query = {},
    ): AsyncGenerator<T, void, undefined> {
        let cursor: string | null = null;

        do {
            const page: CursorPage<T> = await this.request<CursorPage<T>>(
                'GET',
                path,
                {
                    query: cursor === null ? query : { ...query, cursor },
                },
            );

            yield* page.data;
            cursor = page.meta.nextCursor;
        } while (cursor !== null);
    }

    private url(path: string, query?: Query): string {
        const params = new URLSearchParams();

        for (const [name, value] of Object.entries(query ?? {})) {
            if (value === undefined || value === null) {
                continue;
            }

            if (Array.isArray(value)) {
                value.forEach((item) =>
                    params.append(`${name}[]`, String(item)),
                );
            } else {
                params.append(
                    name,
                    typeof value === 'boolean'
                        ? value
                            ? '1'
                            : '0'
                        : String(value),
                );
            }
        }

        const search = params.toString();

        return `${this.options.baseUrl.replace(/\/+$/, '')}${path}${search === '' ? '' : `?${search}`}`;
    }

    private async parse(response: Response): Promise<unknown> {
        const text = response.status === 204 ? '' : await response.text();
        let body: unknown = undefined;

        if (text !== '') {
            try {
                body = JSON.parse(text);
            } catch {
                body = text;
            }
        }

        if (!response.ok) {
            throw new IntegrationApiError(response, body);
        }

        return body;
    }
}

/** Whether a 409 says the same key's first request still runs. Reads a clone, so the body stays readable. */
async function isInProgress(response: Response): Promise<boolean> {
    try {
        const body = (await response.clone().json()) as { code?: unknown };

        return body.code === 'idempotency_in_progress';
    } catch {
        return false;
    }
}

function retryAfter(response: Response): number | null {
    const header = response.headers.get('Retry-After');
    const seconds = header === null ? NaN : Number(header);

    return Number.isFinite(seconds) && seconds >= 0
        ? Math.min(seconds, MAX_RETRY_AFTER_SECONDS) * 1000
        : null;
}

function backoff(attempt: number): number {
    return 500 * 2 ** attempt;
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
