// Generated from the Integration API OpenAPI file (components.schemas).
// Regenerate with `npm run generate` rather than editing it.

export interface ErrorBody {
    message: string;
    /** A stable code to tell refusals apart. Absent on framework refusals (404 routes, 429, a suspended or closed shop). */
    code?: string;
}

export interface ValidationError {
    message: string;
    /** Messages by field (dot notation for nested fields, e.g. `items.0.productId`). */
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

/** The record's `updatedAt` as you read it; a newer record gets 409 `edit_conflict`. */
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
        perPage: number;
        nextCursor: string | null;
        prevCursor: string | null;
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
        currentPage: number;
        from: number | null;
        lastPage: number;
        links: Array<{
            url: string | null;
            label: string;
            page?: number | null;
            active: boolean;
        }>;
        path: string;
        perPage: number;
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
    defaultLanguage: string;
    languages: Array<string>;
    currency: string;
    pricesIncludeTax: boolean;
    paymentMethods: Array<{
        id: string;
        label: string;
    }>;
    /** False when the shop takes no orders through a cart (cart endpoints answer 409 `cart_disabled`). */
    cartAvailable: boolean;
    /** Whether `POST /api/v1/cart/shipping-estimate` is available. */
    shippingEstimates: boolean;
    /** The merchant's own site, where checkout sends shoppers back to. */
    siteUrl: string | null;
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
    regularPrice: Money;
    onSale: boolean;
    inStock: boolean;
    rating: Rating;
    image: string | null;
}

export type ProductDetail = ProductSummary & {
    /** Purified HTML. */
    description: string | null;
    /** Purified HTML. */
    shortDescription: string | null;
    partNumber: string | null;
    unit: string | null;
    /** Null when the product doesn't track stock. */
    stockQuantity: number | null;
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
        averageRating: number;
        totalReviews: number;
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
        productId: number;
        slug: string;
        isThisProduct: boolean;
        options: Array<{
            type: string | null;
            value: string | null;
        }>;
        price: Money;
        inStock: boolean;
    }>;
};

export interface Taxonomy {
    id: number;
    /** Names the classification in `/api/v1/taxonomies/{taxonomy}/terms`. */
    slug: string;
    name: string | null;
    /** Its terms have levels (a term under another). */
    isTree: boolean;
    /** A product may have more than one of its terms. */
    isMultiple: boolean;
}

export interface TaxonomyTerm {
    /** Filters the product list (`taxonomy[]`). */
    id: number;
    slug: string;
    name: string | null;
    children: Array<TaxonomyTerm>;
}

export interface StorefrontPage {
    slug: 'about' | 'contact-us' | 'terms-conditions' | 'privacy-policy';
    title: string | null;
    /** Purified HTML. */
    content: string | null;
}

export interface Cart {
    /** Send it as `X-Cart-Token`. */
    cartToken: string;
    /** `enquiry`: a wholesale member's cart, sent to the shop as a quotation request. */
    mode: 'checkout' | 'enquiry';
    /** The shopper the cart belongs to; null for a guest cart. */
    customerId: number | null;
    items: Array<CartItem>;
    totalQuantity: number;
    subtotal: Money;
    discount: Money;
    coupon: {
        code: string;
        autoApplied: boolean;
    } | null;
    /** Why the coupon on the cart doesn't apply now. */
    couponError: string | null;
    /** Labels of the offers applied. */
    offers: Array<string>;
    taxAdded: Money;
    taxIncluded: Money;
    totalBeforeShipping: Money;
}

export interface CartItem {
    id: number;
    productId: number;
    slug: string | null;
    title: string | null;
    image: string | null;
    quantity: number;
    unitPrice: Money;
    lineTotal: Money;
}

/** For countries with listed locations, pick the state, city and neighbourhood by id (`/shipping-locations` lookups), or set `shippingLocationUnlisted`. */
export interface ShippingDestination {
    /** ISO 3166-1 alpha-3. */
    shippingCountryCode: string;
    shippingCity?: string | null;
    shippingState?: string | null;
    shippingPostalCode?: string | null;
    shippingAddressLine1?: string | null;
    shippingStateId?: number | null;
    shippingCityId?: number | null;
    shippingNeighbourhoodId?: number | null;
    shippingLocationUnlisted?: boolean | null;
}

export interface ShippingEstimate {
    /** Whether the shop ships to the country. */
    shipsTo: boolean;
    /** True for a shop without shipping zones (ships anywhere, free). */
    shipsFree: boolean;
    /** Empty for an empty or digital-only cart. */
    quotes: Array<{
        methodId: number;
        name: string;
        /** A plain amount in the shop's base currency (not a Money object). */
        cost: number;
        isLiveRate: boolean;
        isCarrierPrice: boolean;
    }>;
}

export interface CheckoutLink {
    /** Open it in the shopper's browser. Single use. */
    checkoutUrl: string;
    expiresAt: string;
    mode: 'checkout' | 'enquiry';
    /** The browser must be signed in on the checkout host as the cart's owner. */
    requiresSignIn: boolean;
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
    emailVerified: boolean;
    phone: string | null;
    wholesale: {
        name: string;
    } | null;
    /** The shopper's account page on the shop's host. */
    accountUrl: string;
}

export interface CustomerAddress {
    id: number;
    label: string | null;
    name: string;
    phone: string;
    countryCode: string;
    state: string | null;
    stateId: number | null;
    city: string | null;
    cityId: number | null;
    neighbourhood: string | null;
    neighbourhoodId: number | null;
    addressLine1: string;
    addressLine2: string | null;
    postalCode: string | null;
    isDefault: boolean;
}

/** For countries with listed locations, `shippingStateId` is required, then `shippingCityId` and `shippingNeighbourhoodId` where the picked place has them; or set `shippingLocationUnlisted` and type the city. */
export interface CustomerAddressInput {
    label?: string | null;
    name: string;
    phone: string;
    /** ISO 3166-1 alpha-3, one the shop ships to. */
    countryCode: string;
    city: string;
    state?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    postalCode?: string | null;
    isDefault?: boolean;
    shippingStateId?: number | null;
    shippingCityId?: number | null;
    shippingNeighbourhoodId?: number | null;
    shippingLocationUnlisted?: boolean | null;
}

export interface Order {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus | unknown | null;
    paymentMethod: string | null;
    /** checkout, whatsapp, quotation or enquiry. */
    source: string;
    placedAt: string | null;
    paidAt: string | null;
    customer: {
        id: number | null;
        name: string | null;
        email: string | null;
        phone: string | null;
    };
    shippingAddress: {
        line1: string | null;
        line2: string | null;
        neighbourhood: string | null;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        countryCode: string | null;
    };
    /** Null when billing is the shipping address. */
    billingAddress: {
        name: string | null;
        phone: string | null;
        line1: string | null;
        line2: string | null;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        countryCode: string | null;
    } | null;
    shippingMethod: string | null;
    notes: string | null;
    items: Array<{
        productId: number | null;
        title: string | null;
        sku: string | null;
        quantity: number;
        unitPrice: Money;
        total: Money;
    }>;
    subtotal: Money;
    discount: Money;
    couponCode: string | null;
    shippingFee: Money;
    tax: Money;
    total: Money;
    refunded: Money;
    shipment: {
        carrier: string | null;
        trackingNumber: string | null;
        /** The shipment status's label, in the response language. */
        status: string | null;
    } | null;
    receiptUrl: string;
    updatedAt: string | null;
}

export interface AdminShop {
    id: number;
    name: string;
    storefrontUrl: string;
    isLive: boolean;
    currency: string;
    defaultLanguage: string;
    languages: Array<string>;
    timezone: string | null;
    pricesIncludeTax: boolean;
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
    allowedOrigins: Array<string> | null;
    /** The publishable key's sign-in client id. */
    oauthClientId: string | null;
    redirectUris: Array<string>;
    /** The name of the app that made the key. */
    createdByApp: string | null;
    lastUsedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ApiKeyInput {
    name: string;
    type: 'publishable' | 'secret';
    /** Required for a publishable key, prohibited for a secret one. Site origins, such as `https://www.example.com`. */
    allowedOrigins?: Array<string>;
    /** Publishable keys only. Sign-in return addresses on the allowed sites. */
    redirectUris?: Array<string> | null;
}

/** Text by language code. An empty value is returned as an empty array `[]`. */
export type LocalizedText = Record<string, string | null> | Array<unknown>;

export interface AdminProduct {
    id: number;
    slug: string;
    title: LocalizedText;
    shortDescription: LocalizedText;
    description: LocalizedText;
    sku: string | null;
    partNumber: string | null;
    type: 'physical' | 'digital';
    downloadLimit: number | null;
    documentUrl: string | null;
    /** True when published. */
    status: boolean;
    isFeatured: boolean | null;
    noindex: boolean | null;
    price: number | null;
    salePrice: number | null;
    isSaleScheduled: boolean | null;
    saleStartsAt: string | null;
    saleEndsAt: string | null;
    wholesalePrice: number | null;
    manageStock: boolean | null;
    stockQuantity: number | null;
    lowStockAmount: number | null;
    stockStatus: 'in_stock' | 'out_of_stock' | null;
    unitId: number | null;
    taxClassId: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    taxonomyTermIds: Array<number>;
    specTemplateId: number | null;
    variableProductId: number | null;
    thumbnail: string | null;
    gallery: Array<string>;
    createdAt: string | null;
    updatedAt: string | null;
}

/** The panel's product rules apply (e.g. `stockQuantity` when `manageStock`, `stockStatus` otherwise; `digitalUrl` for a digital product). */
export interface ProductInput {
    /** The title in the shop's default language. */
    title?: string;
    /** Titles in the shop's other languages. */
    translations?: Record<string, string | null> | null;
    /** In the default language. Bold, underline, strikethrough, overline and lists are kept. */
    shortDescription?: string | null;
    shortDescriptionTranslations?: Record<string, string | null> | null;
    /** In the default language. HTML is kept; plain text becomes paragraphs. */
    description?: string | null;
    descriptionTranslations?: Record<string, string | null> | null;
    taxonomyTermIds?: Array<number> | null;
    /** The first is the thumbnail. */
    images?: Array<{
        /** An https URL. Required without `data`. */
        url?: string | null;
        /** The image in base64, at most 5 MB. */
        data?: string | null;
    }> | null;
    /** Older form of `images`. */
    imageUrls?: Array<string> | null;
    sku?: string | null;
    partNumber?: string | null;
    price?: number | null;
    salePrice?: number | null;
    isSaleScheduled?: boolean | null;
    saleStartsAt?: string | null;
    saleEndsAt?: string | null;
    wholesalePrice?: number | null;
    manageStock?: boolean | null;
    stockQuantity?: number | null;
    stockStatus?: 'in_stock' | 'out_of_stock' | null;
    lowStockAmount?: number | null;
    unitId?: number | null;
    taxClassId?: number | null;
    type?: 'physical' | 'digital';
    /** Required for a digital product; a public https file URL. */
    digitalUrl?: string | null;
    downloadLimit?: number | null;
    documentUrl?: string | null;
    /** Published. Defaults to false (hidden) when creating. */
    status?: boolean;
    isFeatured?: boolean | null;
    noindex?: boolean | null;
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    /** Plans with specification templates only. */
    specTemplateId?: number | null;
    /** Specification values by property id; a text property's string is its default-language value. */
    specs?: Record<string, unknown> | null;
    relatedProductIds?: Array<number> | null;
    /** B2B plans only. */
    wholesalePrices?: Array<{
        wholesaleMembershipId: number;
        price?: number | null;
    }> | null;
    /** B2B plans only. */
    quantityTiers?: Array<{
        minQuantity: number;
        price: number;
    }> | null;
}

/** Name the product by `productId` or `sku`, and set `stockQuantity` or `stockStatus`. */
export interface InventoryItemInput {
    productId?: number | null;
    sku?: string | null;
    /** Turns stock tracking on. */
    stockQuantity?: number | null;
    /** Turns stock tracking off. */
    stockStatus?: 'in_stock' | 'out_of_stock' | null;
}

export interface InventoryResult {
    id: number;
    sku: string | null;
    manageStock: boolean;
    stockQuantity: number | null;
    stockStatus: string | null;
    updatedAt: string | null;
}

export interface AdminCustomer {
    id: number;
    name: string;
    email: string | null;
    emailVerified: boolean;
    phone: string | null;
    phoneVerified: boolean;
    wholesale: boolean;
    wholesaleMembershipId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface AdminCoupon {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    usageLimitPerCustomer: number | null;
    usedCount: number | null;
    autoApply: boolean;
    firstOrderOnly: boolean;
    combinableWithOffers: boolean;
    startsAt: string | null;
    endsAt: string | null;
    status: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CouponInput {
    /** Unique in the shop; stored in upper case. */
    code?: string;
    type?: 'percentage' | 'fixed';
    /** At most 100 for a percentage. */
    value?: number;
    minOrderValue?: number | null;
    maxDiscountAmount?: number | null;
    usageLimit?: number | null;
    usageLimitPerCustomer?: number | null;
    autoApply?: boolean | null;
    firstOrderOnly?: boolean | null;
    combinableWithOffers?: boolean | null;
    startsAt?: string | null;
    endsAt?: string | null;
    /** Limits the coupon to term ids, by taxonomy type id. Not returned in responses. */
    taxonomyFilters?: Record<string, Array<number> | null> | null;
    /** Not returned in responses. */
    taxonomyLabels?: Record<string, string | null> | null;
    status?: boolean | null;
}

export interface AdminOffer {
    id: number;
    name: string;
    type: 'buy_x_get_y' | 'quantity_discount' | 'amount_discount';
    config: OfferConfig;
    status: boolean;
    combinableWithCoupons: boolean;
    priority: number | null;
    usageLimit: number | null;
    usedCount: number | null;
    startsAt: string | null;
    endsAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface OfferInput {
    name?: string;
    type?: 'buy_x_get_y' | 'quantity_discount' | 'amount_discount';
    config?: OfferConfig;
    combinableWithCoupons?: boolean | null;
    priority?: number | null;
    usageLimit?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    status?: boolean | null;
}

/** `buy_x_get_y` takes `buy` and `reward`; `quantity_discount` and `amount_discount` take `tiers`. */
export type OfferConfig = BuyXGetYConfig | TieredOfferConfig;

/** Narrows the products the offer counts; null is the whole catalog. */
export type OfferScope = {
    taxonomyFilters?: Record<string, Array<number> | null> | null;
    taxonomyLabels?: Record<string, string | null> | null;
    productIds?: Array<number> | null;
    productLabels?: Record<string, string | null> | null;
    excludeProductIds?: Array<number> | null;
    excludeProductLabels?: Record<string, string | null> | null;
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
        getScope?: OfferScope;
        valueType: 'percentage' | 'fixed';
        /** At most 100 for a percentage. */
        value: number;
        /** Required for `discount`. */
        appliesTo?: 'buy_items' | 'order' | null;
    };
    maxApplications?: number | null;
}

export interface TieredOfferConfig {
    /** `minQty` for `quantity_discount`, `minSubtotal` for `amount_discount`; thresholds must differ. */
    tiers: Array<{
        minQty?: number;
        minSubtotal?: number;
        valueType: 'percentage' | 'fixed';
        value: number;
    }>;
    /** `amount_discount` only. */
    maxDiscountAmount?: number | null;
    scope?: OfferScope;
}

export interface AdminQuotation {
    id: number;
    quotationNumber: string;
    status: QuotationStatus;
    enquiryId: number | null;
    orderId: number | null;
    previousQuotationId: number | null;
    customerId: number | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    shippingCountryCode: string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingAddressLine1: string | null;
    shippingAddressLine2: string | null;
    shippingPostalCode: string | null;
    billingDifferent: boolean;
    billingName: string | null;
    billingPhone: string | null;
    billingCountryCode: string | null;
    billingCity: string | null;
    billingState: string | null;
    billingAddressLine1: string | null;
    billingAddressLine2: string | null;
    billingPostalCode: string | null;
    notes: string | null;
    currency: string | null;
    items: Array<{
        productId: number | null;
        title: string | null;
        sku: string | null;
        quantity: number;
        price: number;
        total: number;
        note: string | null;
    }>;
    subtotal: number;
    shippingFee: number;
    tax: number;
    total: number;
    /** The moves the quotation allows now. */
    allowedActions: Array<
        | 'update'
        | 'send'
        | 'publish'
        | 'revise'
        | 'agree'
        | 'agree_and_order'
        | 'create_order'
        | 'cancel'
    >;
    sentAt: string | null;
    agreedAt: string | null;
    cancelledAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

/** A shop customer (`customerId`), or without one a `customerName`. */
export interface QuotationInput {
    customerId?: number | null;
    /** Required without `customerId`. */
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    /** Replaces every line when updating. */
    items?: Array<{
        /** One of the shop's products, each once. */
        productId: number;
        quantity: number;
        price: number;
        note?: string | null;
    }>;
    shippingFee?: number;
    shippingCountryCode?: string | null;
    shippingCity?: string | null;
    shippingState?: string | null;
    shippingAddressLine1?: string | null;
    shippingAddressLine2?: string | null;
    shippingPostalCode?: string | null;
    /** Unset or false bills the shipping address and ignores the billing fields. */
    billingDifferent?: boolean | null;
    billingName?: string | null;
    billingPhone?: string | null;
    billingCountryCode?: string | null;
    billingCity?: string | null;
    billingState?: string | null;
    billingAddressLine1?: string | null;
    billingAddressLine2?: string | null;
    billingPostalCode?: string | null;
    notes?: string | null;
    /** Rich text before the products, sanitized on save. Not returned in responses. */
    intro?: string | null;
    /** The PDF layout; empty uses the shop's default. Not returned in responses. */
    pdfTemplateId?: number | null;
}

export interface AdminReview {
    id: number;
    productId: number | null;
    customerId: number | null;
    orderId: number | null;
    rating: number;
    title: string | null;
    body: string | null;
    authorName: string | null;
    verifiedBuyer: boolean;
    locale: string | null;
    status: ReviewStatus;
    reply: {
        body: string;
        updatedAt: string | null;
    } | null;
    publishedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

/** An https address on the public internet. */
export type WebhookUrl = string;

export interface WebhookEndpoint {
    id: number;
    url: string;
    events: Array<SubscribableWebhookEvent>;
    active: boolean;
    /** When it was turned off after 20 failed deliveries in a row. */
    disabledAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface Enquiry {
    id: number;
    enquiryNumber: string;
    status: EnquiryStatus;
    paymentStatus: PaymentStatus;
    revision: number | null;
    customerId: number | null;
    wholesaleMembershipId: number | null;
    orderId: number | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    shippingCountryCode: string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingAddressLine1: string | null;
    shippingAddressLine2: string | null;
    shippingPostalCode: string | null;
    notes: string | null;
    currency: string | null;
    items: Array<{
        productId: number | null;
        title: string | null;
        sku: string | null;
        requestedQuantity: number | null;
        requestedPrice: number;
        quotedQuantity: number | null;
        quotedPrice: number | null;
        total: number;
        note: string | null;
    }>;
    subtotal: number;
    shippingFee: number;
    tax: number;
    total: number;
    quotedAt: string | null;
    agreedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface WebhookEnvelope {
    /** The event's id, also in `Storehugs-Event-Id`. */
    id: string;
    type: WebhookEvent;
    createdAt: string;
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
    productId: number;
    quantity?: number | null;
}

export interface CheckoutOptions {
    /** Path on the shop's site (Settings → Integration API) the receipt's "Continue shopping" links to. Starts with a single `/`. */
    returnPath?: string | null;
    /** Path on the shop's site checkout's back link leads to. Starts with a single `/`. */
    cartPath?: string | null;
    /** The visit's UTM tags and click ids, recorded when the link is opened. */
    attribution?: {
        utmSource?: string | null;
        utmMedium?: string | null;
        utmCampaign?: string | null;
        fbclid?: string | null;
        gclid?: string | null;
        gbraid?: string | null;
        wbraid?: string | null;
        dclid?: string | null;
        msclkid?: string | null;
        ttclid?: string | null;
        liFatId?: string | null;
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
    notifyCustomer?: boolean | null;
    updatedAt?: UpdatedAtGuard;
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
    carrierName?: string | null;
    trackingNumber: string;
    trackingUrl?: string | null;
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
