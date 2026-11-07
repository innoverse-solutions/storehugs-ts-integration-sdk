# Changelog

## 0.1.0 — unreleased

- First release: `StorefrontClient` and `CartSession` for the Storefront API, `AdminClient` for the Admin API.
- Writes carry an `Idempotency-Key`, kept across retries after 429 and 503 answers. A retry that finds the first attempt still running waits for it.
- Cursor iteration with `all()`, typed errors (`IntegrationApiError`), PKCE helpers, and webhook signature checks (`verifyWebhookSignature`).
