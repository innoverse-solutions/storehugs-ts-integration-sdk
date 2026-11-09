import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AdminClient } from '../src/admin.ts';
import { IntegrationApiError } from '../src/errors.ts';
import { fakeFetch, json } from './support.ts';

test('calls the panel host with the Admin key and unwraps data', async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: { id: 7, name: 'Acme' } }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const shop = await admin.shop();

    assert.equal(shop.name, 'Acme');
    assert.equal(
        requests[0]?.url,
        'https://my.storehugs.com/api/admin/v1/shop',
    );
    assert.equal(requests[0]?.headers.Authorization, 'Bearer sa_live_x');
    assert.equal(requests[0]?.headers['Idempotency-Key'], undefined);
});

test('every write carries an Idempotency-Key, kept across a retry after 429', async () => {
    const { fetch, requests } = fakeFetch(
        json({ message: 'Too many', code: 'too_many' }, 429, {
            'Retry-After': '0',
        }),
        json({ data: { id: 1 } }, 201),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    await admin.coupons.create({
        code: 'SUMMER',
        type: 'percentage',
        value: 10,
    });

    assert.equal(requests.length, 2);
    assert.match(
        requests[0]?.headers['Idempotency-Key'] ?? '',
        /^[0-9a-f-]{36}$/,
    );
    assert.equal(
        requests[1]?.headers['Idempotency-Key'],
        requests[0]?.headers['Idempotency-Key'],
    );
    assert.deepEqual(requests[0]?.body, {
        code: 'SUMMER',
        type: 'percentage',
        value: 10,
    });
});

test('an update names the version it changes', async () => {
    const { fetch, requests } = fakeFetch(json({ data: { id: 3 } }));
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    await admin.products.update(
        3,
        { title: 'Mug' },
        { unmodifiedSince: '2026-11-07T10:00:00+00:00' },
    );

    assert.equal(requests[0]?.method, 'PATCH');
    assert.equal(
        requests[0]?.headers['If-Unmodified-Since'],
        'Sat, 07 Nov 2026 10:00:00 GMT',
    );
});

test('all() follows cursors until the last page', async () => {
    const page = (ids: number[], next: string | null) =>
        json({
            data: ids.map((id) => ({ id })),
            links: {},
            meta: { nextCursor: next },
        });
    const { fetch, requests } = fakeFetch(page([1, 2], 'abc'), page([3], null));
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const ids: number[] = [];

    for await (const order of admin.orders.all({
        status: 'confirmed',
        limit: 2,
    })) {
        ids.push(order.id);
    }

    assert.deepEqual(ids, [1, 2, 3]);
    assert.equal(
        requests[1]?.url,
        'https://my.storehugs.com/api/admin/v1/orders?status=confirmed&limit=2&cursor=abc',
    );
});

test('a refusal becomes an IntegrationApiError with its code and field errors', async () => {
    const { fetch } = fakeFetch(
        json(
            {
                message: 'The value is invalid.',
                errors: { value: ['Too high.'] },
            },
            422,
        ),
    );
    const admin = new AdminClient({
        apiKey: 'sa_live_x',
        fetch,
        maxRetries: 0,
    });

    await assert.rejects(
        admin.coupons.update(1, { value: 150 }),
        (error: unknown) => {
            assert.ok(error instanceof IntegrationApiError);
            assert.equal(error.status, 422);
            assert.ok(error.isValidationError);
            assert.deepEqual(error.errors.value, ['Too high.']);

            return true;
        },
    );
});

test('a quotation action is posted to its own path, with the order made', async () => {
    const { fetch, requests } = fakeFetch(
        json({
            data: { id: 5, status: 'agreed' },
            order: { id: 9, orderNumber: 'A-9' },
        }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const result = await admin.quotations.perform(
        5,
        'agree_and_order',
        'By phone',
    );

    assert.equal(
        requests[0]?.url,
        'https://my.storehugs.com/api/admin/v1/quotations/5/agree_and_order',
    );
    assert.deepEqual(requests[0]?.body, { note: 'By phone' });
    assert.equal(result.order?.id, 9);
});

test('an app is sent to approve, then trades its code for an Admin key', async () => {
    const url = new URL(
        AdminClient.authorizeAppUrl({
            clientId: 'app-1',
            redirectUri: 'https://app.test/cb',
            scopes: ['orders:read', 'products:write'],
            state: 's',
            codeChallenge: 'c',
        }),
    );

    assert.equal(
        url.origin + url.pathname,
        'https://my.storehugs.com/integrations/authorize',
    );
    assert.equal(url.searchParams.get('scope'), 'orders:read products:write');
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');

    const { fetch, requests } = fakeFetch(
        json({
            api_key: 'sa_live_app',
            scopes: ['orders:read'],
            shop: { id: 1, name: 'Acme' },
        }),
    );
    const grant = await AdminClient.exchangeAppCode({
        code: 'code',
        clientId: 'app-1',
        redirectUri: 'https://app.test/cb',
        codeVerifier: 'v',
        fetch,
    });

    assert.equal(grant.api_key, 'sa_live_app');
    assert.equal(requests[0]?.headers['Idempotency-Key'], undefined);
    assert.equal(
        (requests[0]?.body as Record<string, string>).grant_type,
        'authorization_code',
    );
});

test('a retry that finds the first write still running waits for it under the same key', async () => {
    const { fetch, requests } = fakeFetch(
        json({ message: 'Unavailable' }, 503, { 'Retry-After': '0' }),
        json(
            { message: 'Still running', code: 'idempotency_in_progress' },
            409,
            { 'Retry-After': '0' },
        ),
        json({ data: { id: 8 } }, 201, { 'Idempotent-Replayed': 'true' }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const product = await admin.coupons.create({
        code: 'WAIT',
        type: 'fixed',
        value: 5,
    });

    assert.equal(product.id, 8);
    assert.equal(requests.length, 3);
    assert.equal(
        new Set(requests.map((request) => request.headers['Idempotency-Key']))
            .size,
        1,
    );
});

test('another 409 is thrown at once', async () => {
    const { fetch, requests } = fakeFetch(
        json({ message: 'Changed since read', code: 'edit_conflict' }, 409),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    await assert.rejects(
        admin.coupons.update(1, { value: 5 }),
        (error: unknown) =>
            error instanceof IntegrationApiError &&
            error.code === 'edit_conflict',
    );
    assert.equal(requests.length, 1);
});

test('units are listed by search and changed by id', async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: [{ id: 4 }], links: {}, meta: { nextCursor: null } }),
        json({ data: { id: 4, name: { en: 'Litre' } } }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    await admin.units.list({ search: 'lit' });
    const unit = await admin.units.update(
        4,
        { translations: { ar: 'لتر' } },
        { unmodifiedSince: '2026-11-08T10:00:00Z' },
    );

    assert.equal(
        requests[0]?.url,
        'https://my.storehugs.com/api/admin/v1/units?search=lit',
    );
    assert.equal(requests[1]?.method, 'PATCH');
    assert.equal(
        requests[1]?.url,
        'https://my.storehugs.com/api/admin/v1/units/4',
    );
    assert.deepEqual(requests[1]?.body, { translations: { ar: 'لتر' } });
    assert.equal(unit.id, 4);
});

test("a taxonomy's terms are reached under its id", async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: [{ id: 2, slug: 'categories', terms: 5 }] }),
        json({ data: { id: 30, parentId: null }, warnings: [] }),
        new Response(null, { status: 204 }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const [categories] = await admin.taxonomies.list();
    const terms = admin.taxonomies.terms(categories!.id);
    const result = await terms.update(30, {
        parentId: null,
        removeImage: true,
    });
    await terms.delete(30);

    assert.equal(
        requests[1]?.url,
        'https://my.storehugs.com/api/admin/v1/taxonomies/2/terms/30',
    );
    assert.deepEqual(requests[1]?.body, { parentId: null, removeImage: true });
    assert.deepEqual(result.warnings, []);
    assert.equal(requests[2]?.method, 'DELETE');
});

test("a variant option's value is changed under the option", async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: { id: 3, displayMode: 'color', values: [] } }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const option = await admin.variantOptions.updateValue(3, 11, {
        color: '#ff0000',
    });

    assert.equal(requests[0]?.method, 'PATCH');
    assert.equal(
        requests[0]?.url,
        'https://my.storehugs.com/api/admin/v1/variant-options/3/values/11',
    );
    assert.deepEqual(requests[0]?.body, { color: '#ff0000' });
    assert.equal(option.id, 3);
});

test('variants are added to a variable product with their options as a list', async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: { id: 6, variants: [] }, warnings: [] }, 201),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    const result = await admin.variableProducts.addVariants(6, {
        variants: [{ options: [{ name: 'Size', value: 'XL' }], price: 20 }],
    });

    assert.equal(requests[0]?.method, 'POST');
    assert.equal(
        requests[0]?.url,
        'https://my.storehugs.com/api/admin/v1/variable-products/6/variants',
    );
    assert.deepEqual(requests[0]?.body, {
        variants: [{ options: [{ name: 'Size', value: 'XL' }], price: 20 }],
    });
    assert.equal(result.data.id, 6);
});

test('specification templates are listed by source and read with their properties', async () => {
    const { fetch, requests } = fakeFetch(
        json({ data: [], links: {}, meta: { nextCursor: null } }),
        json({
            data: { id: 9, groups: [], ungroupedProperties: [{ id: 1 }] },
        }),
    );
    const admin = new AdminClient({ apiKey: 'sa_live_x', fetch });

    await admin.specTemplates.list({
        source: 'public',
        category: 'electronics',
    });
    const template = await admin.specTemplates.get(9);

    assert.equal(
        requests[0]?.url,
        'https://my.storehugs.com/api/admin/v1/spec-templates?source=public&category=electronics',
    );
    assert.equal(
        requests[1]?.url,
        'https://my.storehugs.com/api/admin/v1/spec-templates/9',
    );
    assert.equal(template.ungroupedProperties[0]?.id, 1);
});
