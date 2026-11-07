import { Transport } from './http.ts';
import type { CursorPage, FetchLike, Query, RequestOptions } from './http.ts';
import type {
    AdminCoupon,
    AdminCouponInput,
    AdminCustomer,
    AdminCustomerInput,
    AdminOffer,
    AdminOfferInput,
    AdminProduct,
    AdminProductInput,
    AdminQuotation,
    AdminQuotationInput,
    AdminReview,
    AdminShop,
    ApiKey,
    ApiKeyInput,
    AppKeyGrant,
    CreatedApiKey,
    CreatedWebhookEndpoint,
    InventoryItem,
    InventoryResult,
    Order,
    OrderShipmentInput,
    OrderStatusInput,
    ProductWriteResult,
    QuotationAction,
    QuotationActionResult,
    QuotationSendInput,
    WebhookEndpoint,
    WebhookEndpointInput,
} from './types.ts';

export const ADMIN_API_URL = 'https://my.storehugs.com';

export interface AdminClientOptions {
    /** An Admin key, `sa_live_…`: made in the panel, or issued to your app. Keep it on your server. */
    apiKey: string;
    /** The panel's origin (default `https://my.storehugs.com`). */
    baseUrl?: string;
    fetch?: FetchLike;
    maxRetries?: number;
    /** How long to wait while a retried write still runs on the server, in milliseconds (default 30000). */
    inProgressTimeoutMs?: number;
}

/** A change sent only if the record is unchanged since you read it (else 409 `edit_conflict`). */
export interface UpdateOptions {
    /** The record's `updated_at` as you read it. */
    unmodifiedSince?: string;
    idempotencyKey?: string;
}

export interface ListQuery extends Query {
    limit?: number;
    cursor?: string;
    /** ISO 8601: changes since then, oldest first, for incremental sync. */
    updated_since?: string;
}

interface Single<T> {
    data: T;
}

/**
 * The Admin API (`/api/admin/v1` on the panel host), for the merchant's own
 * systems and apps they connect. The key's scopes decide what each call may
 * do; a missing scope is 403 `insufficient_scope`.
 */
export class AdminClient {
    private readonly transport: Transport;

    readonly keys;
    readonly products;
    readonly orders;
    readonly customers;
    readonly coupons;
    readonly offers;
    readonly reviews;
    readonly quotations;
    readonly webhooks;

    constructor(options: AdminClientOptions) {
        this.transport = new Transport({
            baseUrl: `${(options.baseUrl ?? ADMIN_API_URL).replace(/\/+$/, '')}/api/admin/v1`,
            headers: () => ({ Authorization: `Bearer ${options.apiKey}` }),
            fetch: options.fetch,
            maxRetries: options.maxRetries,
            inProgressTimeoutMs: options.inProgressTimeoutMs,
        });

        const t = this.transport;

        this.keys = {
            ...this.listing<ApiKey>('/keys'),
            /** A Storefront key, with its `value`: a secret key's is shown this once. */
            create: (input: ApiKeyInput, options?: RequestOptions) =>
                t.request<CreatedApiKey>('POST', '/keys', {
                    ...options,
                    body: input,
                }),
            revoke: (id: number) => t.request<void>('DELETE', `/keys/${id}`),
        };

        this.products = {
            ...this.listing<
                AdminProduct,
                ListQuery & { search?: string; sku?: string; status?: string }
            >('/products'),
            get: (id: number) =>
                this.unwrap<AdminProduct>('GET', `/products/${id}`),
            /** Images that couldn't be stored are skipped and listed in `warnings`. */
            create: (input: AdminProductInput, options?: RequestOptions) =>
                t.request<ProductWriteResult>('POST', '/products', {
                    ...options,
                    body: input,
                }),
            /** Changes only the fields sent; images are added unless `image_mode` is `replace`. */
            update: (
                id: number,
                changes: Partial<AdminProductInput>,
                options: UpdateOptions = {},
            ) =>
                t.request<ProductWriteResult>(
                    'PATCH',
                    `/products/${id}`,
                    this.update(changes, options),
                ),
            delete: (id: number) =>
                t.request<void>('DELETE', `/products/${id}`),
        };

        this.orders = {
            ...this.listing<
                Order,
                ListQuery & {
                    status?: string;
                    payment_status?: string;
                    source?: string;
                }
            >('/orders'),
            get: (id: number) => this.unwrap<Order>('GET', `/orders/${id}`),
            updateStatus: (
                id: number,
                input: OrderStatusInput,
                options?: RequestOptions,
            ) =>
                this.unwrap<Order>('POST', `/orders/${id}/status`, {
                    ...options,
                    body: input,
                }),
            recordShipment: (
                id: number,
                input: OrderShipmentInput,
                options?: RequestOptions,
            ) =>
                this.unwrap<Order>('POST', `/orders/${id}/shipment`, {
                    ...options,
                    body: input,
                }),
        };

        this.customers = {
            ...this.listing<
                AdminCustomer,
                ListQuery & { search?: string; email?: string }
            >('/customers'),
            get: (id: number) =>
                this.unwrap<AdminCustomer>('GET', `/customers/${id}`),
            /** The customer is emailed at once to choose a password. */
            create: (input: AdminCustomerInput, options?: RequestOptions) =>
                this.unwrap<AdminCustomer>('POST', '/customers', {
                    ...options,
                    body: input,
                }),
            /** A wholesale membership, or null for retail (Business plan). */
            setMembership: (
                id: number,
                wholesaleMembershipId: number | null,
                options: UpdateOptions = {},
            ) =>
                this.unwrap<AdminCustomer>(
                    'PUT',
                    `/customers/${id}/membership`,
                    this.update(
                        { wholesale_membership_id: wholesaleMembershipId },
                        options,
                    ),
                ),
        };

        this.coupons = {
            ...this.listing<AdminCoupon, ListQuery & { code?: string }>(
                '/coupons',
            ),
            ...this.crud<AdminCoupon, AdminCouponInput>('/coupons'),
        };

        this.offers = {
            ...this.listing<AdminOffer>('/offers'),
            ...this.crud<AdminOffer, AdminOfferInput>('/offers'),
        };

        this.reviews = {
            ...this.listing<
                AdminReview,
                ListQuery & {
                    status?: string;
                    rating?: number;
                    product_id?: number;
                }
            >('/reviews'),
            get: (id: number) =>
                this.unwrap<AdminReview>('GET', `/reviews/${id}`),
            setStatus: (
                id: number,
                status: AdminReview['status'],
                options?: RequestOptions,
            ) =>
                this.unwrap<AdminReview>('POST', `/reviews/${id}/status`, {
                    ...options,
                    body: { status },
                }),
            reply: (id: number, body: string, options?: RequestOptions) =>
                this.unwrap<AdminReview>('PUT', `/reviews/${id}/reply`, {
                    ...options,
                    body: { body },
                }),
            deleteReply: (id: number) =>
                this.unwrap<AdminReview>('DELETE', `/reviews/${id}/reply`),
            delete: (id: number) => t.request<void>('DELETE', `/reviews/${id}`),
        };

        this.quotations = {
            ...this.listing<
                AdminQuotation,
                ListQuery & {
                    status?: string;
                    customer_id?: number;
                    quotation_number?: string;
                }
            >('/quotations'),
            get: (id: number) =>
                this.unwrap<AdminQuotation>('GET', `/quotations/${id}`),
            /** A draft; nothing is emailed. */
            create: (input: AdminQuotationInput, options?: RequestOptions) =>
                this.unwrap<AdminQuotation>('POST', '/quotations', {
                    ...options,
                    body: input,
                }),
            /** A draft only; `items` replaces every line. */
            update: (
                id: number,
                changes: Partial<AdminQuotationInput>,
                options: UpdateOptions = {},
            ) =>
                this.unwrap<AdminQuotation>(
                    'PATCH',
                    `/quotations/${id}`,
                    this.update(changes, options),
                ),
            /** Emails the PDF; a draft is published first. */
            send: (
                id: number,
                input: QuotationSendInput = {},
                options?: RequestOptions,
            ) =>
                this.unwrap<AdminQuotation>('POST', `/quotations/${id}/send`, {
                    ...options,
                    body: input,
                }),
            /** `revise` answers with the new draft; `agree_and_order` and `create_order` with the order made. */
            perform: async (
                id: number,
                action: QuotationAction,
                note?: string,
                options?: RequestOptions,
            ): Promise<QuotationActionResult> =>
                t.request<QuotationActionResult>(
                    'POST',
                    `/quotations/${id}/${action}`,
                    { ...options, body: note === undefined ? {} : { note } },
                ),
        };

        this.webhooks = {
            ...this.listing<WebhookEndpoint>('/webhooks'),
            ...this.crud<WebhookEndpoint, WebhookEndpointInput>('/webhooks'),
            /** The answer's `secret` (`whsec_…`) is shown this once. */
            create: (input: WebhookEndpointInput, options?: RequestOptions) =>
                t.request<CreatedWebhookEndpoint>('POST', '/webhooks', {
                    ...options,
                    body: input,
                }),
        };
    }

    shop(): Promise<AdminShop> {
        return this.unwrap<AdminShop>('GET', '/shop');
    }

    /** Sets stock for up to 100 products, by id or SKU; all or nothing. */
    setInventory(
        items: InventoryItem[],
        options?: RequestOptions,
    ): Promise<InventoryResult[]> {
        return this.unwrap<InventoryResult[]>('POST', '/inventory', {
            ...options,
            body: { items },
        });
    }

    /** The page to send a merchant to, to approve your app for an Admin key (OAuth authorization code with S256 PKCE). */
    static authorizeAppUrl(params: {
        clientId: string;
        redirectUri: string;
        scopes: string[];
        state: string;
        codeChallenge: string;
        baseUrl?: string;
    }): string {
        const query = new URLSearchParams({
            client_id: params.clientId,
            redirect_uri: params.redirectUri,
            response_type: 'code',
            scope: params.scopes.join(' '),
            state: params.state,
            code_challenge: params.codeChallenge,
            code_challenge_method: 'S256',
        });

        return `${(params.baseUrl ?? ADMIN_API_URL).replace(/\/+$/, '')}/integrations/authorize?${query.toString()}`;
    }

    /** Your server trades the one-time code (10 minutes, one try) and your PKCE verifier for the app's Admin key, shown this once. */
    static async exchangeAppCode(params: {
        code: string;
        clientId: string;
        redirectUri: string;
        codeVerifier: string;
        baseUrl?: string;
        fetch?: FetchLike;
    }): Promise<AppKeyGrant> {
        const transport = new Transport({
            baseUrl: `${(params.baseUrl ?? ADMIN_API_URL).replace(/\/+$/, '')}/api/admin/v1`,
            headers: () => ({}),
            fetch: params.fetch,
            maxRetries: 0,
        });

        return transport.request<AppKeyGrant>('POST', '/oauth/token', {
            idempotencyKey: false,
            body: {
                grant_type: 'authorization_code',
                code: params.code,
                client_id: params.clientId,
                redirect_uri: params.redirectUri,
                code_verifier: params.codeVerifier,
            },
        });
    }

    private listing<T, Q extends ListQuery = ListQuery>(path: string) {
        return {
            /** One page (cursor pages, `limit` up to 100). */
            list: (query: Q = {} as Q) =>
                this.transport.request<CursorPage<T>>('GET', path, { query }),
            /** Every record, fetching pages as you read. */
            all: (query: Q = {} as Q) =>
                this.transport.paginate<T>(path, query),
        };
    }

    private crud<T, I>(path: string) {
        return {
            get: (id: number) => this.unwrap<T>('GET', `${path}/${id}`),
            create: (input: I, options?: RequestOptions) =>
                this.unwrap<T>('POST', path, { ...options, body: input }),
            /** Changes only the fields sent. */
            update: (
                id: number,
                changes: Partial<I>,
                options: UpdateOptions = {},
            ) =>
                this.unwrap<T>(
                    'PATCH',
                    `${path}/${id}`,
                    this.update(changes, options),
                ),
            delete: (id: number) =>
                this.transport.request<void>('DELETE', `${path}/${id}`),
        };
    }

    private update(body: unknown, options: UpdateOptions): RequestOptions {
        return {
            body,
            idempotencyKey: options.idempotencyKey,
            headers:
                options.unmodifiedSince === undefined
                    ? undefined
                    : {
                          'If-Unmodified-Since': new Date(
                              options.unmodifiedSince,
                          ).toUTCString(),
                      },
        };
    }

    private async unwrap<T>(
        method: string,
        path: string,
        options?: RequestOptions,
    ): Promise<T> {
        return (await this.transport.request<Single<T>>(method, path, options))
            .data;
    }
}
