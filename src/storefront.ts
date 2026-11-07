import { Transport } from './http.ts';
import type { FetchLike, Query, RequestOptions } from './http.ts';
import type {
    Cart,
    CategoryType,
    CheckoutLink,
    CheckoutOptions,
    Customer,
    CustomerAddress,
    CustomerAddressInput,
    LengthAwarePage,
    Order,
    Product,
    ProductDetail,
    ShippingDestination,
    ShippingEstimate,
    StorefrontPage,
    StorefrontShop,
    TokenSet,
} from './types.ts';

export interface StorefrontClientOptions {
    /** The shop's storefront host or custom domain, e.g. `acme.storehugs.com`. */
    host: string;
    /** A publishable key (browsers on the sites it lists) or a secret key (servers only). */
    key: string;
    /** With a secret key: the shopper your server calls for, so limits count per shopper. */
    shopperIp?: string;
    /** A signed-in shopper's access token (see `signIn`). */
    accessToken?: string;
    /** The language of names and descriptions; the shop's default otherwise. */
    locale?: string;
    fetch?: FetchLike;
    maxRetries?: number;
    /** How long to wait while a retried write still runs on the server, in milliseconds (default 30000). */
    inProgressTimeoutMs?: number;
}

export interface ProductQuery extends Query {
    search?: string;
    /** Category term ids. */
    category?: number[];
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    featured?: boolean;
    sort?: string;
    page?: number;
    /** Up to 50. */
    per_page?: number;
}

interface Single<T> {
    data: T;
}

/**
 * The Storefront API (`/api/v1` on the shop's host), for a merchant's own
 * storefront: the catalog, carts with checkout on the shop's checkout page,
 * and signed-in shoppers.
 */
export class StorefrontClient {
    private readonly options: StorefrontClientOptions;
    private readonly transport: Transport;

    readonly products;
    readonly customer;

    constructor(options: StorefrontClientOptions) {
        this.options = options;
        this.transport = new Transport({
            baseUrl: `${origin(options.host)}/api/v1`,
            headers: () => ({
                'X-Storehugs-Key': options.key,
                'X-Shopper-Ip': options.shopperIp,
                Authorization:
                    options.accessToken === undefined
                        ? undefined
                        : `Bearer ${options.accessToken}`,
                'Accept-Language': options.locale,
            }),
            fetch: options.fetch,
            maxRetries: options.maxRetries,
            inProgressTimeoutMs: options.inProgressTimeoutMs,
        });

        this.products = {
            list: (query: ProductQuery = {}) =>
                this.transport.request<LengthAwarePage<Product>>(
                    'GET',
                    '/products',
                    { query },
                ),
            get: (slug: string) =>
                this.unwrap<ProductDetail>(
                    'GET',
                    `/products/${encodeURIComponent(slug)}`,
                ),
        };

        /** The signed-in shopper's own data; needs `accessToken`. */
        this.customer = {
            get: () => this.unwrap<Customer>('GET', '/customer'),
            /** Ends the access token and its refresh token. */
            logout: () =>
                this.transport.request<void>('POST', '/customer/logout'),
            orders: {
                list: (query: { page?: number } = {}) =>
                    this.transport.request<LengthAwarePage<Order>>(
                        'GET',
                        '/customer/orders',
                        { query },
                    ),
                get: (id: number) =>
                    this.unwrap<Order>('GET', `/customer/orders/${id}`),
            },
            addresses: {
                list: () =>
                    this.unwrap<CustomerAddress[]>(
                        'GET',
                        '/customer/addresses',
                    ),
                create: (input: CustomerAddressInput) =>
                    this.unwrap<CustomerAddress>(
                        'POST',
                        '/customer/addresses',
                        { body: input },
                    ),
                update: (id: number, changes: Partial<CustomerAddressInput>) =>
                    this.unwrap<CustomerAddress>(
                        'PATCH',
                        `/customer/addresses/${id}`,
                        { body: changes },
                    ),
                delete: (id: number) =>
                    this.transport.request<void>(
                        'DELETE',
                        `/customer/addresses/${id}`,
                    ),
                makeDefault: (id: number) =>
                    this.unwrap<CustomerAddress>(
                        'POST',
                        `/customer/addresses/${id}/default`,
                    ),
            },
            wishlist: {
                list: () => this.unwrap<Product[]>('GET', '/customer/wishlist'),
                /** Answers with the whole wishlist. */
                add: (productId: number) =>
                    this.unwrap<Product[]>('POST', '/customer/wishlist', {
                        body: { product_id: productId },
                    }),
                /** Answers with the whole wishlist. */
                remove: (productId: number) =>
                    this.unwrap<Product[]>(
                        'DELETE',
                        `/customer/wishlist/${productId}`,
                    ),
            },
        };
    }

    shop(): Promise<StorefrontShop> {
        return this.unwrap<StorefrontShop>('GET', '/shop');
    }

    categories(): Promise<CategoryType[]> {
        return this.unwrap<CategoryType[]>('GET', '/categories');
    }

    page(
        page: 'about' | 'contact-us' | 'terms-conditions' | 'privacy-policy',
    ): Promise<StorefrontPage> {
        return this.unwrap<StorefrontPage>('GET', `/pages/${page}`);
    }

    /** A new cart; keep its `cart_token` (with a shopper's token, the cart is theirs). */
    createCart(options?: RequestOptions): Promise<Cart> {
        return this.unwrap<Cart>('POST', '/carts', options);
    }

    /** The cart a token names. */
    cart(cartToken: string): CartSession {
        return new CartSession(this, cartToken);
    }

    /** The same client acting for a signed-in shopper. */
    withAccessToken(accessToken: string): StorefrontClient {
        return new StorefrontClient({ ...this.options, accessToken });
    }

    /** Shopper sign-in on the shop's own page (OAuth authorization code with S256 PKCE, client per publishable key). */
    get signIn() {
        const host = origin(this.options.host);
        const token = (body: Record<string, string>) =>
            this.transport.request<TokenSet>('POST', '/oauth/token', {
                body,
                idempotencyKey: false,
                headers: { Authorization: undefined },
            });

        return {
            /** The page to send the shopper to. */
            authorizeUrl: (params: {
                clientId: string;
                redirectUri: string;
                state: string;
                codeChallenge: string;
            }) =>
                `${host}/account/authorize?${new URLSearchParams({
                    client_id: params.clientId,
                    redirect_uri: params.redirectUri,
                    response_type: 'code',
                    scope: 'storefront:customer',
                    state: params.state,
                    code_challenge: params.codeChallenge,
                    code_challenge_method: 'S256',
                }).toString()}`,
            exchangeCode: (params: {
                code: string;
                clientId: string;
                redirectUri: string;
                codeVerifier: string;
            }) =>
                token({
                    grant_type: 'authorization_code',
                    code: params.code,
                    client_id: params.clientId,
                    redirect_uri: params.redirectUri,
                    code_verifier: params.codeVerifier,
                }),
            refresh: (params: { refreshToken: string; clientId: string }) =>
                token({
                    grant_type: 'refresh_token',
                    refresh_token: params.refreshToken,
                    client_id: params.clientId,
                }),
        };
    }

    /** @internal */
    requestCart<T>(
        method: string,
        path: string,
        cartToken: string,
        options: RequestOptions = {},
    ): Promise<T> {
        return this.unwrap<T>(method, path, {
            ...options,
            headers: { ...options.headers, 'X-Cart-Token': cartToken },
        });
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

/** One cart, by its token: every change answers with the whole cart. */
export class CartSession {
    private readonly client: StorefrontClient;
    readonly token: string;

    constructor(client: StorefrontClient, token: string) {
        this.client = client;
        this.token = token;
    }

    get(): Promise<Cart> {
        return this.client.requestCart<Cart>('GET', '/cart', this.token);
    }

    addItem(
        productId: number,
        quantity = 1,
        options?: RequestOptions,
    ): Promise<Cart> {
        return this.client.requestCart<Cart>(
            'POST',
            '/cart/items',
            this.token,
            { ...options, body: { product_id: productId, quantity } },
        );
    }

    /** 0 removes the line. */
    updateItem(
        itemId: number,
        quantity: number,
        options?: RequestOptions,
    ): Promise<Cart> {
        return this.client.requestCart<Cart>(
            'PATCH',
            `/cart/items/${itemId}`,
            this.token,
            { ...options, body: { quantity } },
        );
    }

    removeItem(itemId: number, options?: RequestOptions): Promise<Cart> {
        return this.client.requestCart<Cart>(
            'DELETE',
            `/cart/items/${itemId}`,
            this.token,
            options,
        );
    }

    applyCoupon(code: string, options?: RequestOptions): Promise<Cart> {
        return this.client.requestCart<Cart>(
            'POST',
            '/cart/coupon',
            this.token,
            { ...options, body: { code } },
        );
    }

    removeCoupon(options?: RequestOptions): Promise<Cart> {
        return this.client.requestCart<Cart>(
            'DELETE',
            '/cart/coupon',
            this.token,
            options,
        );
    }

    /** Only when the shop's shipping calculator is on. */
    estimateShipping(
        destination: ShippingDestination,
        options?: RequestOptions,
    ): Promise<ShippingEstimate> {
        return this.client.requestCart<ShippingEstimate>(
            'POST',
            '/cart/shipping-estimate',
            this.token,
            { ...options, body: destination },
        );
    }

    /** A single-use link to the shop's checkout (30 minutes), opened in the shopper's browser. */
    checkout(
        options: CheckoutOptions = {},
        request?: RequestOptions,
    ): Promise<CheckoutLink> {
        return this.client.requestCart<CheckoutLink>(
            'POST',
            '/cart/checkout',
            this.token,
            { ...request, body: options },
        );
    }
}

function origin(host: string): string {
    return (/^https?:\/\//.test(host) ? host : `https://${host}`).replace(
        /\/+$/,
        '',
    );
}
