# Changelog

## Unreleased

- `admin.units`: list, read, create, update and delete the units products are sold in, such as piece or kilogram (`list()` and `all()` take `search`). A unit products still use can't be deleted (422).
- `admin.taxonomies`: `list()` the shop's taxonomies (`AdminTaxonomy`), and `terms(taxonomyId)` to list, read, create, update and delete one taxonomy's terms (`AdminTaxonomyTerm`; lists take `search` and `parentId`). Creating and updating answer `{ data, warnings }`, as products do, when an image can't be stored; `removeImage` removes it.
- `admin.variantOptions`: `list()` the options variable products are sold in with their values (`AdminVariantOption`), `create()` and `update()` an option (name, translations, `displayMode`), and `createValue()` and `updateValue()` its values (name, translations, swatch `color`). Each answers with the whole option. Variable products need a plan that includes them (else 403 `plan_required`).
- `admin.variableProducts`: list (`search`), read, `create()` with 2 to 50 variants, and `addVariants()` to an existing one (`AdminVariableProduct`). Each variant's `options` is a list of `{ name, value }`, and writes answer `{ data, warnings }`. Each variant is a product of its own, changed with `admin.products`.
- Types regenerated from the current spec. `AdminProduct` gains `relatedProductIds` and `recommendedProductIds` (the product page's You May Also Like picks), which `AdminProductInput` also takes; descriptions follow the reference's new wording.

## 0.2.0 — 2026-11-08

- **Breaking:** `storefront.categories()` is gone, with the API's `/categories`. `storefront.taxonomies.list()` lists the shop's classifications (`Taxonomy`, without terms), and `storefront.taxonomies.terms(slug)` reads one classification's terms as a tree (`TaxonomyTerm`). `CategoryType` and `CategoryTerm` are removed.
- **Breaking:** field names are camelCase everywhere, following the API: queries (`perPage`, `updatedSince`, `minPrice`, `inStock`…), request bodies, answers (`cartToken`, `checkoutUrl`, `updatedAt`, `meta.nextCursor`, `line1`) and webhook payloads (`createdAt`). The OAuth token answers are the exception and keep `access_token`, `refresh_token`, `expires_in`, `token_type` and the app grant's `api_key`. `ProductQuery.category` is now `taxonomy`, taking term ids from any classifications. `AdminProductInput.image_mode` is now `imageMode`.

## 0.1.0 — 2026-11-07

- First release: `StorefrontClient` and `CartSession` for the Storefront API, `AdminClient` for the Admin API.
- Writes carry an `Idempotency-Key`, kept across retries after 429 and 503 answers. A retry that finds the first attempt still running waits for it.
- Cursor iteration with `all()`, typed errors (`IntegrationApiError`), PKCE helpers, and webhook signature checks (`verifyWebhookSignature`).
- Supports Node 22 and later.
