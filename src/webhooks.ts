/** The headers every delivery carries. */
export const WEBHOOK_HEADERS = {
    eventId: 'Storehugs-Event-Id',
    eventType: 'Storehugs-Event-Type',
    signature: 'Storehugs-Signature',
} as const;

export interface VerifyWebhookOptions {
    /** How far the signed time may be from now, in seconds (default 300). */
    toleranceSeconds?: number;
    /** The current time in seconds, for tests. */
    now?: number;
}

/**
 * Whether a delivery is genuine: an HMAC-SHA256 of `"{t}.{raw body}"` with
 * the endpoint's `whsec_…` secret matches one of the header's `v1` values
 * (two while a replaced secret still signs), and `t` is recent. Pass the
 * raw body exactly as received; re-encoded JSON won't match. Still skip an
 * `Storehugs-Event-Id` you already handled: retries reuse it.
 */
export async function verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null | undefined,
    secret: string,
    options: VerifyWebhookOptions = {},
): Promise<boolean> {
    if (!signatureHeader) {
        return false;
    }

    let timestamp: number | null = null;
    const signatures: string[] = [];

    for (const part of signatureHeader.split(',')) {
        const [key, value = ''] = part.trim().split('=', 2);

        if (key === 't') {
            timestamp = Number(value);
        } else if (key === 'v1' && value !== '') {
            signatures.push(value.toLowerCase());
        }
    }

    const now = options.now ?? Math.floor(Date.now() / 1000);

    if (
        timestamp === null ||
        !Number.isInteger(timestamp) ||
        Math.abs(now - timestamp) > (options.toleranceSeconds ?? 300)
    ) {
        return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const expected = toHex(
        new Uint8Array(
            await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(`${timestamp}.${rawBody}`),
            ),
        ),
    );

    return signatures.some((signature) =>
        constantTimeEqual(signature, expected),
    );
}

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
        '',
    );
}

function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let difference = 0;

    for (let index = 0; index < a.length; index++) {
        difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
    }

    return difference === 0;
}
