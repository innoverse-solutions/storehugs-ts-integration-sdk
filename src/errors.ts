/**
 * A refusal from the Integration API: the HTTP status, the API's `code`
 * (`invalid_api_key`, `insufficient_scope`, `edit_conflict`, …) and, for a
 * 422 validation error, the messages per field.
 */
export class IntegrationApiError extends Error {
    readonly status: number;
    readonly code: string | null;
    readonly errors: Record<string, string[]>;
    readonly body: unknown;
    readonly response: Response;

    constructor(response: Response, body: unknown) {
        const payload = (
            typeof body === 'object' && body !== null ? body : {}
        ) as {
            message?: unknown;
            code?: unknown;
            errors?: unknown;
        };

        super(
            typeof payload.message === 'string'
                ? payload.message
                : `Request failed with status ${response.status}`,
        );
        this.name = 'IntegrationApiError';
        this.status = response.status;
        this.code = typeof payload.code === 'string' ? payload.code : null;
        this.errors =
            typeof payload.errors === 'object' && payload.errors !== null
                ? (payload.errors as Record<string, string[]>)
                : {};
        this.body = body;
        this.response = response;
    }

    /** Whether it is a 422 with messages per field. */
    get isValidationError(): boolean {
        return this.status === 422 && Object.keys(this.errors).length > 0;
    }
}
