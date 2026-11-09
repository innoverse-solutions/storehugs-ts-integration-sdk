import type {
    AdminProduct,
    AdminQuotation,
    AdminTaxonomyTerm,
    AppTokenResponse,
    CouponInput,
    InventoryItemInput,
    NumberedPageEnvelope,
    OfferInput,
    ProductInput,
    ProductSummary,
    QuotationInput,
    ShopperTokenResponse,
    StorefrontCustomer,
    TaxonomyTermInput,
    UnitInput,
} from './schemas.ts';

export type * from './schemas.ts';

/** A product as catalog lists show it. */
export type Product = ProductSummary;

/** The signed-in shopper. */
export type Customer = StorefrontCustomer;

/** A shopper's access and refresh tokens. */
export type TokenSet = ShopperTokenResponse;

/** An approved app's Admin key, shown once. */
export type AppKeyGrant = AppTokenResponse;

/** A numbered page, as Storefront API lists return. */
export type LengthAwarePage<T> = NumberedPageEnvelope & { data: T[] };

export type AdminProductInput = ProductInput & {
    imageMode?: 'add' | 'replace' | null;
};
export type AdminCouponInput = CouponInput;
export type AdminOfferInput = OfferInput;
export type AdminQuotationInput = QuotationInput;
export type InventoryItem = InventoryItemInput;
export type AdminUnitInput = UnitInput & { name: string };
export type AdminTaxonomyTermInput = TaxonomyTermInput & { title: string };
export type AdminTaxonomyTermChanges = Partial<AdminTaxonomyTermInput> & {
    /** Removes the term's image. */
    removeImage?: boolean | null;
};

/** A term saved, with the reason an image couldn't be stored. */
export interface TaxonomyTermWriteResult {
    data: AdminTaxonomyTerm;
    warnings: string[];
}

/** A product saved, with the images that couldn't be stored. */
export interface ProductWriteResult {
    data: AdminProduct;
    warnings: string[];
}

/** A quotation's pipeline moves. */
export type QuotationAction =
    | 'publish'
    | 'revise'
    | 'agree'
    | 'agree_and_order'
    | 'create_order'
    | 'cancel';

export interface QuotationActionResult {
    /** The quotation; for `revise`, the new draft. */
    data: AdminQuotation;
    /** The order made by `agree_and_order` or `create_order`. */
    order: { id: number; orderNumber: string } | null;
}
