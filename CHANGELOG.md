# Changelog

## Unreleased

- **Breaking:** `storefront.categories()` is gone, with the API's `/categories`. `storefront.taxonomies.list()` lists the shop's classifications (`Taxonomy`, without terms), and `storefront.taxonomies.terms(slug)` reads one classification's terms as a tree (`TaxonomyTerm`). `CategoryType` and `CategoryTerm` are removed.
- **Breaking:** field names are camelCase everywhere, following the API: queries (`perPage`, `updatedSince`, `minPrice`, `inStock`…), request bodies, answers (`cartToken`, `checkoutUrl`, `updatedAt`, `meta.nextCursor`, `line1`) and webhook payloads (`createdAt`). The OAuth token answers are the exception and keep `access_token`, `refresh_token`, `expires_in`, `token_type` and the app grant's `api_key`. `ProductQuery.category` is now `taxonomy`, taking term ids from any classifications. `AdminProductInput.image_mode` is now `imageMode`.

## 0.1.0 — 2026-11-07

- First release: `StorefrontClient` and `CartSession` for the Storefront API, `AdminClient` for the Admin API.
- Writes carry an `Idempotency-Key`, kept across retries after 429 and 503 answers. A retry that finds the first attempt still running waits for it.
- Cursor iteration with `all()`, typed errors (`IntegrationApiError`), PKCE helpers, and webhook signature checks (`verifyWebhookSignature`).
- Supports Node 22 and later.
