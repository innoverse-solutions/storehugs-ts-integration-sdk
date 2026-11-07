// Generated from the Integration API OpenAPI file (components.schemas).
// Regenerate with `npm run generate` rather than editing it.

export interface ErrorBody {
    message: string;
    /** A stable code to tell refusals apart. Absent on framework refusals (404 routes, 429, a suspended or closed shop). */
    code?: string;
}

export interface ValidationError {
    message: string;
    /** Messages by field (dot notation for nested fields, e.g. `items.0.product_id`). */
    errors: Record<string, Array<string>>;
}

export interface OAuthError {
    error: string;
    error_description?: string;
    hint?: string;
    message?: string;
}

export interface Money {
    /** Rounded to the shop's decimals. */
    amount: number;
    /** The shop's base currency (ISO 4217). */
    currency: string;
    formatted: string;
}

/** The record's `updated_at` as you read it; a newer record gets 409 `edit_conflict`. */
export type UpdatedAtGuard = string | null;

export interface CursorPageEnvelope {
    links: {
        first: unknown | null;
        last: unknown | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        path: string;
        per_page: number;
        next_cursor: string | null;
        prev_cursor: string | null;
    };
}

export interface NumberedPageEnvelope {
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            page?: number | null;
            active: boolean;
        }>;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export type OrderStatus =
    | 'unconfirmed'
    | 'pending'
    | 'processing'
    | 'ready_to_ship'
    | 'shipped'
    | 'completed'
    | 'cancelled';

export type PaymentStatus =
    'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'disputed';

export type OrderSource = 'checkout' | 'whatsapp' | 'quotation' | 'enquiry';

export type QuotationStatus =
    'draft' | 'published' | 'agreed' | 'superseded' | 'cancelled';

export type EnquiryStatus =
    'new' | 'quoted' | 'agreed' | 'completed' | 'cancelled';

export type ReviewStatus =
    'pending_approval' | 'published' | 'rejected' | 'flagged';

export type AdminApiScope =
    | 'shop:read'
    | 'keys:read'
    | 'keys:write'
    | 'products:read'
    | 'products:write'
    | 'inventory:write'
    | 'orders:read'
    | 'orders:write'
    | 'customers:read'
    | 'customers:write'
    | 'marketing:read'
    | 'marketing:write'
    | 'reviews:read'
    | 'reviews:write'
    | 'quotations:read'
    | 'quotations:write'
    | 'webhooks:read'
    | 'webhooks:write';

export type SubscribableWebhookEvent =
    | 'order.created'
    | 'order.status_changed'
    | 'order.payment_status_changed'
    | 'order.refunded'
    | 'product.created'
    | 'product.updated'
    | 'product.deleted'
    | 'product.stock_changed'
    | 'catalog.changed'
    | 'customer.created'
    | 'customer.updated'
    | 'quotation.created'
    | 'quotation.status_changed'
    | 'enquiry.created'
    | 'enquiry.status_changed';

export type WebhookEvent =
    | 'order.created'
    | 'order.status_changed'
    | 'order.payment_status_changed'
    | 'order.refunded'
    | 'product.created'
    | 'product.updated'
    | 'product.deleted'
    | 'product.stock_changed'
    | 'catalog.changed'
    | 'customer.created'
    | 'customer.updated'
    | 'quotation.created'
    | 'quotation.status_changed'
    | 'enquiry.created'
    | 'enquiry.status_changed'
    | 'ping';

export interface StorefrontShop {
    name: string;
    logo: string | null;
    /** The language this response is in. */
    locale: string;
    default_language: string;
    languages: Array<string>;
    currency: string;
    prices_include_tax: boolean;
    payment_methods: Array<{
        id: string;
        label: string;
    }>;
    /** False when the shop takes no orders through a cart (cart endpoints answer 409 `cart_disabled`). */
    cart_available: boolean;
    /** Whether `POST /api/v1/cart/shipping-estimate` is available. */
    shipping_estimates: boolean;
    /** The merchant's own site, where checkout sends shoppers back to. */
    site_url: string | null;
}

export type Rating = {
    average: number;
    count: number;
} | null;

export interface ProductSummary {
    id: number;
    slug: string;
    title: string | null;
    sku: string | null;
    price: Money;
    regular_price: Money;
    on_sale: boolean;
    in_stock: boolean;
    rating: Rating;
    image: string | null;
}

export type ProductDetail = ProductSummary & {
    /** Purified HTML. */
    description: string | null;
    /** Purified HTML. */
    short_description: string | null;
    part_number: string | null;
    unit: string | null;
    /** Null when the product doesn't track stock. */
    stock_quantity: number | null;
    images: Array<string>;
    categories: Array<{
        id: number;
        slug: string;
        name: string | null;
        type: string | null;
    }>;
    specifications: Array<{
        group: string | null;
        rows: Array<{
            name: string;
            value: string;
            unit: string | null;
        }>;
    }>;
    /** Null when the shop has reviews off. */
    reviews: {
        average_rating: number;
        total_reviews: number;
        /** Review counts by star rating. */
        distribution: {
            '1': number;
            '2': number;
            '3': number;
            '4': number;
            '5': number;
        };
    } | null;
    /** The product's siblings in its variable product group that this storefront sells, this product included. */
    variants: Array<{
        product_id: number;
        slug: string;
        is_this_product: boolean;
        options: Array<{
            type: string | null;
            value: string | null;
        }>;
        price: Money;
        in_stock: boolean;
    }>;
};

export interface CategoryType {
    id: number;
    slug: string;
    name: string | null;
    terms: Array<CategoryTerm>;
}

export interface CategoryTerm {
    id: number;
    slug: string;
    name: string | null;
    children: Array<CategoryTerm>;
}

export interface StorefrontPage {
    slug: 'about' | 'contact-us' | 'terms-conditions' | 'privacy-policy';
    title: string | null;
    /** Purified HTML. */
    content: string | null;
}

export interface Cart {
    /** Send it as `X-Cart-Token`. */
    cart_token: string;
    /** `enquiry`: a wholesale member's cart, sent to the shop as a quotation request. */
    mode: 'checkout' | 'enquiry';
    /** The shopper the cart belongs to; null for a guest cart. */
    customer_id: number | null;
    items: Array<CartItem>;
    total_quantity: number;
    subtotal: Money;
    discount: Money;
    coupon: {
        code: string;
        auto_applied: boolean;
    } | null;
    /** Why the coupon on the cart doesn't apply now. */
    coupon_error: string | null;
    /** Labels of the offers applied. */
    offers: Array<string>;
    tax_added: Money;
    tax_included: Money;
    total_before_shipping: Money;
}

export interface CartItem {
    id: number;
    product_id: number;
    slug: string | null;
    title: string | null;
    image: string | null;
    quantity: number;
    unit_price: Money;
    line_total: Money;
}

/** For countries with listed locations, pick the state, city and neighbourhood by id (`/shipping-locations` lookups), or set `shipping_location_unlisted`. */
export interface ShippingDestination {
    /** ISO 3166-1 alpha-3. */
    shipping_country_code: string;
    shipping_city?: string | null;
    shipping_state?: string | null;
    shipping_postal_code?: string | null;
    shipping_address_line_1?: string | null;
    shipping_state_id?: number | null;
    shipping_city_id?: number | null;
    shipping_neighbourhood_id?: number | null;
    shipping_location_unlisted?: boolean | null;
}

export interface ShippingEstimate {
    /** Whether the shop ships to the country. */
    ships_to: boolean;
    /** True for a shop without shipping zones (ships anywhere, free). */
    ships_free: boolean;
    /** Empty for an empty or digital-only cart. */
    quotes: Array<{
        method_id: number;
        name: string;
        /** A plain amount in the shop's base currency (not a Money object). */
        cost: number;
        is_live_rate: boolean;
        is_carrier_price: boolean;
    }>;
}

export interface CheckoutLink {
    /** Open it in the shopper's browser. Single use. */
    checkout_url: string;
    expires_at: string;
    mode: 'checkout' | 'enquiry';
    /** The browser must be signed in on the checkout host as the cart's owner. */
    requires_sign_in: boolean;
}

export type ShopperTokenRequest =
    | {
          grant_type: 'authorization_code';
          /** The publishable key's client id. */
          client_id: string;
          redirect_uri: string;
          code_verifier: string;
          code: string;
      }
    | {
          grant_type: 'refresh_token';
          client_id: string;
          refresh_token: string;
      };

export interface ShopperTokenResponse {
    token_type: 'Bearer';
    /** Seconds (3600). */
    expires_in: number;
    access_token: string;
    refresh_token: string;
}

export interface StorefrontCustomer {
    id: number;
    name: string;
    email: string | null;
    email_verified: boolean;
    phone: string | null;
    wholesale: {
        name: string;
    } | null;
    /** The shopper's account page on the shop's host. */
    account_url: string;
}

export interface CustomerAddress {
    id: number;
    label: string | null;
    name: string;
    phone: string;
    country_code: string;
    state: string | null;
    state_id: number | null;
    city: string | null;
    city_id: number | null;
    neighbourhood: string | null;
    neighbourhood_id: number | null;
    address_line_1: string;
    address_line_2: string | null;
    postal_code: string | null;
    is_default: boolean;
}

/** For countries with listed locations, `shipping_state_id` is required, then `shipping_city_id` and `shipping_neighbourhood_id` where the picked place has them; or set `shipping_location_unlisted` and type the city. */
export interface CustomerAddressInput {
    label?: string | null;
    name: string;
    phone: string;
    /** ISO 3166-1 alpha-3, one the shop ships to. */
    country_code: string;
    city: string;
    state?: string | null;
    address_line_1: string;
    address_line_2?: string | null;
    postal_code?: string | null;
    is_default?: boolean;
    shipping_state_id?: number | null;
    shipping_city_id?: number | null;
    shipping_neighbourhood_id?: number | null;
    shipping_location_unlisted?: boolean | null;
}

export interface Order {
    id: number;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus | unknown | null;
    payment_method: string | null;
    /** checkout, whatsapp, quotation or enquiry. */
    source: string;
    placed_at: string | null;
    paid_at: string | null;
    customer: {
        id: number | null;
        name: string | null;
        email: string | null;
        phone: string | null;
    };
    shipping_address: {
        line_1: string | null;
        line_2: string | null;
        neighbourhood: string | null;
        city: string | null;
        state: string | null;
        postal_code: string | null;
        country_code: string | null;
    };
    /** Null when billing is the shipping address. */
    billing_address: {
        name: string | null;
        phone: string | null;
        line_1: string | null;
        line_2: string | null;
        city: string | null;
        state: string | null;
        postal_code: string | null;
        country_code: string | null;
    } | null;
    shipping_method: string | null;
    notes: string | null;
    items: Array<{
        product_id: number | null;
        title: string | null;
        sku: string | null;
        quantity: number;
        unit_price: Money;
        total: Money;
    }>;
    subtotal: Money;
    discount: Money;
    coupon_code: string | null;
    shipping_fee: Money;
    tax: Money;
    total: Money;
    refunded: Money;
    shipment: {
        carrier: string | null;
        tracking_number: string | null;
        /** The shipment status's label, in the response language. */
        status: string | null;
    } | null;
    receipt_url: string;
    updated_at: string | null;
}

export interface AdminShop {
    id: number;
    name: string;
    storefront_url: string;
    is_live: boolean;
    currency: string;
    default_language: string;
    languages: Array<string>;
    timezone: string | null;
    prices_include_tax: boolean;
    plan: 'freemium' | 'basic' | 'pro' | 'business';
    /** Whether the hosted storefront redirects to the merchant's site. */
    headless: boolean;
}

export interface AppTokenRequest {
    grant_type: 'authorization_code';
    client_id: string;
    code: string;
    redirect_uri: string;
    code_verifier: string;
}

export interface AppTokenResponse {
    /** The Admin key (`sa_live_…`). */
    api_key: string;
    scopes: Array<AdminApiScope>;
    shop: {
        id: number;
        name: string;
    };
}

export interface ApiKey {
    id: number;
    name: string;
    type: 'publishable' | 'secret';
    /** A publishable key's full value; a secret key masked (`sk_live_…abcd`). */
    key: string;
    allowed_origins: Array<string> | null;
    /** The publishable key's sign-in client id. */
    oauth_client_id: string | null;
    redirect_uris: Array<string>;
    /** The name of the app that made the key. */
    created_by_app: string | null;
    last_used_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface ApiKeyInput {
    name: string;
    type: 'publishable' | 'secret';
    /** Required for a publishable key, prohibited for a secret one. Site origins, such as `https://www.example.com`. */
    allowed_origins?: Array<string>;
    /** Publishable keys only. Sign-in return addresses on the allowed sites. */
    redirect_uris?: Array<string> | null;
}

/** Text by language code. An empty value is returned as an empty array `[]`. */
export type LocalizedText = Record<string, string | null> | Array<unknown>;

export interface AdminProduct {
    id: number;
    slug: string;
    title: LocalizedText;
    short_description: LocalizedText;
    description: LocalizedText;
    sku: string | null;
    part_number: string | null;
    type: 'physical' | 'digital';
    download_limit: number | null;
    document_url: string | null;
    /** True when published. */
    status: boolean;
    is_featured: boolean | null;
    noindex: boolean | null;
    price: number | null;
    sale_price: number | null;
    is_sale_scheduled: boolean | null;
    sale_starts_at: string | null;
    sale_ends_at: string | null;
    wholesale_price: number | null;
    manage_stock: boolean | null;
    stock_quantity: number | null;
    low_stock_amount: number | null;
    stock_status: 'in_stock' | 'out_of_stock' | null;
    unit_id: number | null;
    tax_class_id: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    taxonomy_term_ids: Array<number>;
    spec_template_id: number | null;
    variable_product_id: number | null;
    thumbnail: string | null;
    gallery: Array<string>;
    created_at: string | null;
    updated_at: string | null;
}

/** The panel's product rules apply (e.g. `stock_quantity` when `manage_stock`, `stock_status` otherwise; `digital_url` for a digital product). */
export interface ProductInput {
    /** The title in the shop's default language. */
    title?: string;
    /** Titles in the shop's other languages. */
    translations?: Record<string, string | null> | null;
    /** In the default language. Bold, underline, strikethrough, overline and lists are kept. */
    short_description?: string | null;
    short_description_translations?: Record<string, string | null> | null;
    /** In the default language. HTML is kept; plain text becomes paragraphs. */
    description?: string | null;
    description_translations?: Record<string, string | null> | null;
    taxonomy_term_ids?: Array<number> | null;
    /** The first is the thumbnail. */
    images?: Array<{
        /** An https URL. Required without `data`. */
        url?: string | null;
        /** The image in base64, at most 5 MB. */
        data?: string | null;
    }> | null;
    /** Older form of `images`. */
    image_urls?: Array<string> | null;
    sku?: string | null;
    part_number?: string | null;
    price?: number | null;
    sale_price?: number | null;
    is_sale_scheduled?: boolean | null;
    sale_starts_at?: string | null;
    sale_ends_at?: string | null;
    wholesale_price?: number | null;
    manage_stock?: boolean | null;
    stock_quantity?: number | null;
    stock_status?: 'in_stock' | 'out_of_stock' | null;
    low_stock_amount?: number | null;
    unit_id?: number | null;
    tax_class_id?: number | null;
    type?: 'physical' | 'digital';
    /** Required for a digital product; a public https file URL. */
    digital_url?: string | null;
    download_limit?: number | null;
    document_url?: string | null;
    /** Published. Defaults to false (hidden) when creating. */
    status?: boolean;
    is_featured?: boolean | null;
    noindex?: boolean | null;
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    /** Plans with specification templates only. */
    spec_template_id?: number | null;
    /** Specification values by property id; a text property's string is its default-language value. */
    specs?: Record<string, unknown> | null;
    related_product_ids?: Array<number> | null;
    /** B2B plans only. */
    wholesale_prices?: Array<{
        wholesale_membership_id: number;
        price?: number | null;
    }> | null;
    /** B2B plans only. */
    quantity_tiers?: Array<{
        min_quantity: number;
        price: number;
    }> | null;
}

/** Name the product by `product_id` or `sku`, and set `stock_quantity` or `stock_status`. */
export interface InventoryItemInput {
    product_id?: number | null;
    sku?: string | null;
    /** Turns stock tracking on. */
    stock_quantity?: number | null;
    /** Turns stock tracking off. */
    stock_status?: 'in_stock' | 'out_of_stock' | null;
}

export interface InventoryResult {
    id: number;
    sku: string | null;
    manage_stock: boolean;
    stock_quantity: number | null;
    stock_status: string | null;
    updated_at: string | null;
}

export interface AdminCustomer {
    id: number;
    name: string;
    email: string | null;
    email_verified: boolean;
    phone: string | null;
    phone_verified: boolean;
    wholesale: boolean;
    wholesale_membership_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface AdminCoupon {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_value: number | null;
    max_discount_amount: number | null;
    usage_limit: number | null;
    usage_limit_per_customer: number | null;
    used_count: number | null;
    auto_apply: boolean;
    first_order_only: boolean;
    combinable_with_offers: boolean;
    starts_at: string | null;
    ends_at: string | null;
    status: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface CouponInput {
    /** Unique in the shop; stored in upper case. */
    code?: string;
    type?: 'percentage' | 'fixed';
    /** At most 100 for a percentage. */
    value?: number;
    min_order_value?: number | null;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    usage_limit_per_customer?: number | null;
    auto_apply?: boolean | null;
    first_order_only?: boolean | null;
    combinable_with_offers?: boolean | null;
    starts_at?: string | null;
    ends_at?: string | null;
    /** Limits the coupon to term ids, by taxonomy type id. Not returned in responses. */
    taxonomy_filters?: Record<string, Array<number> | null> | null;
    /** Not returned in responses. */
    taxonomy_labels?: Record<string, string | null> | null;
    status?: boolean | null;
}

export interface AdminOffer {
    id: number;
    name: string;
    type: 'buy_x_get_y' | 'quantity_discount' | 'amount_discount';
    config: OfferConfig;
    status: boolean;
    combinable_with_coupons: boolean;
    priority: number | null;
    usage_limit: number | null;
    used_count: number | null;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface OfferInput {
    name?: string;
    type?: 'buy_x_get_y' | 'quantity_discount' | 'amount_discount';
    config?: OfferConfig;
    combinable_with_coupons?: boolean | null;
    priority?: number | null;
    usage_limit?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: boolean | null;
}

/** `buy_x_get_y` takes `buy` and `reward`; `quantity_discount` and `amount_discount` take `tiers`. */
export type OfferConfig = BuyXGetYConfig | TieredOfferConfig;

/** Narrows the products the offer counts; null is the whole catalog. */
export type OfferScope = {
    taxonomy_filters?: Record<string, Array<number> | null> | null;
    taxonomy_labels?: Record<string, string | null> | null;
    product_ids?: Array<number> | null;
    product_labels?: Record<string, string | null> | null;
    exclude_product_ids?: Array<number> | null;
    exclude_product_labels?: Record<string, string | null> | null;
} | null;

export interface BuyXGetYConfig {
    buy: {
        qty: number;
        scope?: OfferScope;
    };
    reward: {
        kind: 'items' | 'discount';
        /** Required for `items`. */
        qty?: number | null;
        get_scope?: OfferScope;
        value_type: 'percentage' | 'fixed';
        /** At most 100 for a percentage. */
        value: number;
        /** Required for `discount`. */
        applies_to?: 'buy_items' | 'order' | null;
    };
    max_applications?: number | null;
}

export interface TieredOfferConfig {
    /** `min_qty` for `quantity_discount`, `min_subtotal` for `amount_discount`; thresholds must differ. */
    tiers: Array<{
        min_qty?: number;
        min_subtotal?: number;
        value_type: 'percentage' | 'fixed';
        value: number;
    }>;
    /** `amount_discount` only. */
    max_discount_amount?: number | null;
    scope?: OfferScope;
}

export interface AdminQuotation {
    id: number;
    quotation_number: string;
    status: QuotationStatus;
    enquiry_id: number | null;
    order_id: number | null;
    previous_quotation_id: number | null;
    customer_id: number | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    shipping_country_code: string | null;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_address_line_1: string | null;
    shipping_address_line_2: string | null;
    shipping_postal_code: string | null;
    billing_different: boolean;
    billing_name: string | null;
    billing_phone: string | null;
    billing_country_code: string | null;
    billing_city: string | null;
    billing_state: string | null;
    billing_address_line_1: string | null;
    billing_address_line_2: string | null;
    billing_postal_code: string | null;
    notes: string | null;
    currency: string | null;
    items: Array<{
        product_id: number | null;
        title: string | null;
        sku: string | null;
        quantity: number;
        price: number;
        total: number;
        note: string | null;
    }>;
    subtotal: number;
    shipping_fee: number;
    tax: number;
    total: number;
    /** The moves the quotation allows now. */
    allowed_actions: Array<
        | 'update'
        | 'send'
        | 'publish'
        | 'revise'
        | 'agree'
        | 'agree_and_order'
        | 'create_order'
        | 'cancel'
    >;
    sent_at: string | null;
    agreed_at: string | null;
    cancelled_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

/** A shop customer (`customer_id`), or without one a `customer_name`. */
export interface QuotationInput {
    customer_id?: number | null;
    /** Required without `customer_id`. */
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    /** Replaces every line when updating. */
    items?: Array<{
        /** One of the shop's products, each once. */
        product_id: number;
        quantity: number;
        price: number;
        note?: string | null;
    }>;
    shipping_fee?: number;
    shipping_country_code?: string | null;
    shipping_city?: string | null;
    shipping_state?: string | null;
    shipping_address_line_1?: string | null;
    shipping_address_line_2?: string | null;
    shipping_postal_code?: string | null;
    /** Unset or false bills the shipping address and ignores the billing fields. */
    billing_different?: boolean | null;
    billing_name?: string | null;
    billing_phone?: string | null;
    billing_country_code?: string | null;
    billing_city?: string | null;
    billing_state?: string | null;
    billing_address_line_1?: string | null;
    billing_address_line_2?: string | null;
    billing_postal_code?: string | null;
    notes?: string | null;
    /** Rich text before the products, sanitized on save. Not returned in responses. */
    intro?: string | null;
    /** The PDF layout; empty uses the shop's default. Not returned in responses. */
    pdf_template_id?: number | null;
}

export interface AdminReview {
    id: number;
    product_id: number | null;
    customer_id: number | null;
    order_id: number | null;
    rating: number;
    title: string | null;
    body: string | null;
    author_name: string | null;
    verified_buyer: boolean;
    locale: string | null;
    status: ReviewStatus;
    reply: {
        body: string;
        updated_at: string | null;
    } | null;
    published_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

/** An https address on the public internet. */
export type WebhookUrl = string;

export interface WebhookEndpoint {
    id: number;
    url: string;
    events: Array<SubscribableWebhookEvent>;
    active: boolean;
    /** When it was turned off after 20 failed deliveries in a row. */
    disabled_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Enquiry {
    id: number;
    enquiry_number: string;
    status: EnquiryStatus;
    payment_status: PaymentStatus;
    revision: number | null;
    customer_id: number | null;
    wholesale_membership_id: number | null;
    order_id: number | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    shipping_country_code: string | null;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_address_line_1: string | null;
    shipping_address_line_2: string | null;
    shipping_postal_code: string | null;
    notes: string | null;
    currency: string | null;
    items: Array<{
        product_id: number | null;
        title: string | null;
        sku: string | null;
        requested_quantity: number | null;
        requested_price: number;
        quoted_quantity: number | null;
        quoted_price: number | null;
        total: number;
        note: string | null;
    }>;
    subtotal: number;
    shipping_fee: number;
    tax: number;
    total: number;
    quoted_at: string | null;
    agreed_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface WebhookEnvelope {
    /** The event's id, also in `Storehugs-Event-Id`. */
    id: string;
    type: WebhookEvent;
    created_at: string;
    data: Record<string, unknown>;
}

export type ProductWebhookPayload = WebhookEnvelope & {
    type?:
        | 'product.created'
        | 'product.updated'
        | 'product.deleted'
        | 'product.stock_changed';
    data?: {
        product: {
            id: number;
            slug: string;
            changes: Array<'price' | 'stock' | 'content'>;
        };
    };
};

export type CustomerWebhookPayload = WebhookEnvelope & {
    type?: 'customer.created' | 'customer.updated';
    data?: {
        customer: AdminCustomer;
    };
};

export interface CartItemInput {
    product_id: number;
    quantity?: number | null;
}

export interface CheckoutOptions {
    /** Path on the shop's site (Settings → Integration API) the receipt's "Continue shopping" links to. Starts with a single `/`. */
    return_path?: string | null;
    /** Path on the shop's site checkout's back link leads to. Starts with a single `/`. */
    cart_path?: string | null;
    /** The visit's UTM tags and click ids, recorded when the link is opened. */
    attribution?: {
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
        fbclid?: string | null;
        gclid?: string | null;
        gbraid?: string | null;
        wbraid?: string | null;
        dclid?: string | null;
        msclkid?: string | null;
        ttclid?: string | null;
        li_fat_id?: string | null;
        twclid?: string | null;
    } | null;
}

export interface CreatedApiKey {
    data: ApiKey;
    /** The key's full value (`pk_live_…` or `sk_live_…`). */
    value: string;
}

export interface OrderStatusInput {
    status:
        | 'pending'
        | 'processing'
        | 'ready_to_ship'
        | 'shipped'
        | 'completed'
        | 'cancelled';
    note?: string | null;
    notify_customer?: boolean | null;
    updated_at?: UpdatedAtGuard;
}

export interface OrderShipmentInput {
    carrier:
        | 'dhl'
        | 'ups'
        | 'fedex'
        | 'aramex'
        | 'smsa'
        | 'dhl_ecommerce'
        | 'babel_express'
        | 'other';
    /** Required when `carrier` is `other`. */
    carrier_name?: string | null;
    tracking_number: string;
    tracking_url?: string | null;
}

export interface AdminCustomerInput {
    name: string;
    /** Unique in the shop. */
    email: string;
    /** Unique in the shop. */
    phone?: string | null;
}

export interface QuotationSendInput {
    recipient?: string | null;
    cc?: Array<string> | null;
    subject?: string | null;
    message?: string | null;
}

export interface WebhookEndpointInput {
    url: WebhookUrl;
    events: Array<SubscribableWebhookEvent>;
    /** Validated but ignored when creating; a new endpoint is on. */
    active?: boolean;
}

export interface CreatedWebhookEndpoint {
    data: WebhookEndpoint;
    /** The `whsec_…` signing secret. */
    secret: string;
}
