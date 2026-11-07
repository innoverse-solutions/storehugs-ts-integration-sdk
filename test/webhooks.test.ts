import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { test } from 'node:test';
import { createPkcePair } from '../src/pkce.ts';
import { verifyWebhookSignature } from '../src/webhooks.ts';

const body = '{"id":"e1","type":"order.created","data":{}}';
const sign = (secret: string, t: number) =>
    createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');

test('a delivery signed with the secret, recently, is genuine', async () => {
    const t = 1_800_000_000;

    assert.equal(
        await verifyWebhookSignature(
            body,
            `t=${t},v1=${sign('whsec_a', t)}`,
            'whsec_a',
            { now: t + 10 },
        ),
        true,
    );
    assert.equal(
        await verifyWebhookSignature(
            body,
            `t=${t},v1=${sign('whsec_a', t)}`,
            'whsec_b',
            { now: t + 10 },
        ),
        false,
    );
    assert.equal(
        await verifyWebhookSignature(
            `${body} `,
            `t=${t},v1=${sign('whsec_a', t)}`,
            'whsec_a',
            { now: t + 10 },
        ),
        false,
    );
    assert.equal(await verifyWebhookSignature(body, null, 'whsec_a'), false);
});

test('an old timestamp is refused, and either of two signatures passes while a secret is replaced', async () => {
    const t = 1_800_000_000;

    assert.equal(
        await verifyWebhookSignature(
            body,
            `t=${t},v1=${sign('whsec_a', t)}`,
            'whsec_a',
            { now: t + 301 },
        ),
        false,
    );
    assert.equal(
        await verifyWebhookSignature(
            body,
            `t=${t},v1=${sign('whsec_new', t)},v1=${sign('whsec_old', t)}`,
            'whsec_old',
            { now: t },
        ),
        true,
    );
});

test('a PKCE pair is a verifier and its S256 challenge', async () => {
    const { verifier, challenge } = await createPkcePair();

    assert.match(verifier, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(
        challenge,
        createHash('sha256').update(verifier).digest('base64url'),
    );
});
