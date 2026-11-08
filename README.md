# @storehugs/integration

[![npm](https://img.shields.io/npm/v/@storehugs/integration)](https://www.npmjs.com/package/@storehugs/integration)
[![CI](https://github.com/innoverse-solutions/storehugs-ts-integration-sdk/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/innoverse-solutions/storehugs-ts-integration-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A TypeScript client for the Store Hugs Integration API. It has no dependencies and runs on Node 22+, browsers, Deno and Bun.

- **Storefront API:** the catalog, carts and checkout links, and signed-in shoppers on the shop's host. Use a publishable key in browsers on the sites it lists, or a secret key on your server.
- **Admin API:** the merchant's own systems and connected apps. Use an Admin key (`sa_live_…`) on your server only.

Field names are camelCase in queries, request bodies, answers and webhook payloads (`perPage`, `cartToken`, `updatedAt`). The OAuth token answers are the exception: they keep the standard `access_token`, `refresh_token`, `expires_in` and, for apps, `api_key`.

The full reference is at https://developers.storehugs.com (`/openapi.yaml`). Report issues and send changes at https://github.com/innoverse-solutions/storehugs-ts-integration-sdk.

## Storefront

```ts
import { StorefrontClient } from '@storehugs/integration';

const storefront = new StorefrontClient({
    host: 'acme.storehugs.com',
    key: 'pk_live_…',
});

const { data: products } = await storefront.products.list({
    search: 'mug',
    perPage: 12,
});
const cart = await storefront.createCart();
await storefront.cart(cart.cartToken).addItem(products[0].id, 2);
const { checkoutUrl } = await storefront
    .cart(cart.cartToken)
    .checkout({ returnPath: '/thanks' });
// Open checkoutUrl in the shopper's browser.
```

**Shopper sign-in** uses OAuth with PKCE on the shop's own page:

1. Call `createPkcePair()` and `createState()`.
2. Send the shopper to `storefront.signIn.authorizeUrl(…)`.
3. Exchange the code with `storefront.signIn.exchangeCode(…)`.
4. Call `storefront.withAccessToken(tokens.access_token)` to act as the shopper.

## Admin

```ts
import { AdminClient } from '@storehugs/integration';

const admin = new AdminClient({ apiKey: process.env.STOREHUGS_ADMIN_KEY! });

for await (const order of admin.orders.all({
    updatedSince: '2026-11-01T00:00:00Z',
})) {
    // Every page is fetched as you read.
}

await admin.setInventory([{ sku: 'MUG-01', stockQuantity: 40 }]);
const product = await admin.products.get(12);
await admin.products.update(
    12,
    { price: 19.5 },
    { unmodifiedSince: product.updatedAt ?? undefined },
); // 409 edit_conflict if it changed
```

**Apps** get an Admin key, not an OAuth token:

1. Send the merchant to `AdminClient.authorizeAppUrl({ clientId, redirectUri, scopes, state, codeChallenge })`.
2. On your server, call `AdminClient.exchangeAppCode(…)` within 10 minutes. It returns `{ api_key, scopes, shop }`, and the key is shown only that once.

## Behaviour

- **Writes are safe to retry.** Every POST, PUT, PATCH and DELETE gets an `Idempotency-Key`. Pass `idempotencyKey` to keep one across processes, or `false` to send none.
- **Retries:** answers 429 and 503, and network errors, are retried up to `maxRetries` times (default 2), following `Retry-After`, with the same key. If a retry reaches the server while the first attempt is still running (409 `idempotency_in_progress`), the client waits for it under the same key for up to `inProgressTimeoutMs` (default 30 seconds) and returns its answer.
- **Errors:** a refusal throws `IntegrationApiError`, with `status`, the API's `code` (`insufficient_scope`, `edit_conflict`, …) and, on a 422, `errors` per field.
- **Webhooks:** `verifyWebhookSignature(rawBody, request.headers.get('Storehugs-Signature'), secret)` checks the HMAC and that the delivery is recent. Skip any `Storehugs-Event-Id` you have already handled.

## Install

```bash
npm install @storehugs/integration
```

## Development

```bash
npm ci
npm run types:check
npm test
npm run build
```

`src/schemas.ts` is generated from the Integration API's OpenAPI file. Don't edit it by hand: run `npm run generate`, which reads the published spec at `https://developers.storehugs.com/openapi.yaml`. To read another copy, pass a URL or a file path in `SPEC`, for example `SPEC=../matajer/documentation/openapi/integration-api.yaml npm run generate`.

A weekly workflow regenerates the types from the published spec and fails when they change, which signals that the client needs a release.

## Releasing

1. Update `version` in `package.json` and `CHANGELOG.md`, and commit to `master`.
2. Tag the commit and push the tag:

    ```bash
    git tag v0.1.0 && git push origin v0.1.0
    ```

    The **Publish** workflow then tests and builds on Node 22, 24 and 26 and publishes to npm with provenance. It refuses a tag that doesn't match `package.json`. It publishes through npm trusted publishing, so no npm token is stored in the repository.

CI on pushes and pull requests checks formatting, types and tests only. It doesn't build or publish.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities privately, as [SECURITY.md](SECURITY.md) describes.

## License

MIT
