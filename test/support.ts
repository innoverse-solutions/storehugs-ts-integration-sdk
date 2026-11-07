import type { FetchLike } from '../src/http.ts';

export interface RecordedRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
}

/** A fetch that answers from a queue and records each request. */
export function fakeFetch(...responses: Array<Response | (() => Response)>): {
    fetch: FetchLike;
    requests: RecordedRequest[];
} {
    const requests: RecordedRequest[] = [];

    const fetch: FetchLike = async (url, init) => {
        requests.push({
            url,
            method: init.method ?? 'GET',
            headers: { ...(init.headers as Record<string, string>) },
            body:
                typeof init.body === 'string'
                    ? JSON.parse(init.body)
                    : undefined,
        });

        const next = responses.shift();

        if (next === undefined) {
            throw new Error(`Unexpected request: ${init.method} ${url}`);
        }

        return typeof next === 'function' ? next() : next;
    };

    return { fetch, requests };
}

export function json(
    body: unknown,
    status = 200,
    headers: Record<string, string> = {},
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers },
    });
}
