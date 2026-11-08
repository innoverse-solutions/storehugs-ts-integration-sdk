import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StorefrontClient } from '../src/storefront.ts';
import { fakeFetch, json } from './support.ts';

test('catalog calls send the key, locale and Laravel-style arrays', async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: [], links: {}, meta: {} }),
    );
    const storefront = new StorefrontClient({
        host: 'acme.storehugs.com',
        key: 'pk_live_x',
        locale: 'ar',
        fetch,
    });

    await storefront.products.list({
        taxonomy: [3, 4],
        inStock: true,
        perPage: 20,
    });

    assert.equal(
        requests[0]?.url,
        'https://acme.storehugs.com/api/v1/products?taxonomy%5B%5D=3&taxonomy%5B%5D=4&inStock=1&perPage=20',
    );
    assert.equal(requests[0]?.headers['X-Storehugs-Key'], 'pk_live_x');
    assert.equal(requests[0]?.headers['Accept-Language'], 'ar');
    assert.equal(requests[0]?.headers.Authorization, undefined);
});

test('a cart session sends its token, and a secret key names the shopper', async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: { cartToken: 't1' } }, 201),
        json({ data: { cartToken: 't1' } }),
    );
    const storefront = new StorefrontClient({
        host: 'https://shop.example.com',
        key: 'sk_live_x',
        shopperIp: '203.0.113.7',
        fetch,
    });

    const cart = await storefront.createCart();
    await storefront.cart(cart.cartToken).addItem(12, 2);

    assert.equal(
        requests[1]?.url,
        'https://shop.example.com/api/v1/cart/items',
    );
    assert.equal(requests[1]?.headers['X-Cart-Token'], 't1');
    assert.equal(requests[1]?.headers['X-Shopper-Ip'], '203.0.113.7');
    assert.deepEqual(requests[1]?.body, { productId: 12, quantity: 2 });
});

test("a signed-in shopper's calls carry their token", async () => {
    const { fetch, requests } = fakeFetch(json({ data: { id: 4 } }));
    const storefront = new StorefrontClient({
        host: 'acme.storehugs.com',
        key: 'pk_live_x',
        fetch,
    }).withAccessToken('at');

    await storefront.customer.get();

    assert.equal(requests[0]?.headers.Authorization, 'Bearer at');
});

test("sign-in sends the shopper to the shop's page and trades the code for tokens", async () => {
    const { fetch, requests } = fakeFetch(
        json({
            access_token: 'at',
            refresh_token: 'rt',
            expires_in: 3600,
            token_type: 'Bearer',
        }),
    );
    const storefront = new StorefrontClient({
        host: 'acme.storehugs.com',
        key: 'pk_live_x',
        fetch,
    });

    const url = new URL(
        storefront.signIn.authorizeUrl({
            clientId: 'c1',
            redirectUri: 'https://www.brand.com/cb',
            state: 's',
            codeChallenge: 'ch',
        }),
    );
    const tokens = await storefront.signIn.exchangeCode({
        code: 'code',
        clientId: 'c1',
        redirectUri: 'https://www.brand.com/cb',
        codeVerifier: 'v',
    });

    assert.equal(
        url.origin + url.pathname,
        'https://acme.storehugs.com/account/authorize',
    );
    assert.equal(url.searchParams.get('scope'), 'storefront:customer');
    assert.equal(tokens.access_token, 'at');
    assert.equal(
        requests[0]?.url,
        'https://acme.storehugs.com/api/v1/oauth/token',
    );
});

test('removing from the wishlist answers with the whole wishlist', async () => {
    const { fetch, requests } = fakeFetch(json({ data: [{ id: 3 }] }));
    const storefront = new StorefrontClient({
        host: 'acme.storehugs.com',
        key: 'pk_live_x',
        fetch,
    }).withAccessToken('at');

    const wishlist = await storefront.customer.wishlist.remove(9);

    assert.equal(requests[0]?.method, 'DELETE');
    assert.equal(
        requests[0]?.url,
        'https://acme.storehugs.com/api/v1/customer/wishlist/9',
    );
    assert.deepEqual(
        wishlist.map((product) => product.id),
        [3],
    );
});

test('classifications are listed, and a classification names its terms by slug', async () => {
    const { fetch, requests } = fakeFetch(
        json({
            data: [
                {
                    id: 1,
                    slug: 'brand',
                    name: 'Brand',
                    isTree: false,
                    isMultiple: false,
                },
            ],
        }),
        json({ data: [{ id: 7, slug: 'acme', name: 'Acme', children: [] }] }),
    );
    const storefront = new StorefrontClient({
        host: 'acme.storehugs.com',
        key: 'pk_live_x',
        fetch,
    });

    const [brand] = await storefront.taxonomies.list();
    const terms = await storefront.taxonomies.terms(brand!.slug);

    assert.equal(
        requests[0]?.url,
        'https://acme.storehugs.com/api/v1/taxonomies',
    );
    assert.equal(
        requests[1]?.url,
        'https://acme.storehugs.com/api/v1/taxonomies/brand/terms',
    );
    assert.equal(terms[0]?.id, 7);
});
