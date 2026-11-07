/**
 * PKCE (RFC 7636) for the two sign-in flows: shoppers signing in to the
 * merchant's site, and merchants approving an app for an Admin key. Both
 * require S256.
 */
export interface PkcePair {
    verifier: string;
    challenge: string;
}

export async function createPkcePair(): Promise<PkcePair> {
    const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier),
    );

    return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

/** A random `state` to send with the redirect and check on the way back. */
export function createState(): string {
    return base64Url(crypto.getRandomValues(new Uint8Array(16)));
}

function base64Url(bytes: Uint8Array): string {
    let binary = '';

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
