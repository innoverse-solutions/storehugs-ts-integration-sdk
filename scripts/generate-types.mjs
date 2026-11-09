// Writes src/schemas.ts from the Integration API's OpenAPI file: its
// components.schemas, plus a few request and response bodies the spec writes
// inline. Run `npm run generate` (it formats the result with Prettier).
//
// The spec is read from SPEC (a URL or a file path), by default the published
// one at https://developers.storehugs.com/openapi.yaml.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const SPEC =
    process.env.SPEC ?? 'https://developers.storehugs.com/openapi.yaml';
const OUTPUT = fileURLToPath(new URL('../src/schemas.ts', import.meta.url));

/** Schema names that would clash with globals or the client's own types. */
const RENAMES = {
    Error: 'ErrorBody',
    Page: 'StorefrontPage',
    CursorPage: 'CursorPageEnvelope',
    NumberedPage: 'NumberedPageEnvelope',
};

/** Inline request bodies worth a name, by operationId. */
const BODIES = {
    addCartItem: 'CartItemInput',
    checkoutCart: 'CheckoutOptions',
    adminUpdateOrderStatus: 'OrderStatusInput',
    adminCreateOrderShipment: 'OrderShipmentInput',
    adminCreateCustomer: 'AdminCustomerInput',
    adminCreateWebhook: 'WebhookEndpointInput',
    adminSendQuotation: 'QuotationSendInput',
};

/** Inline responses worth a name, by operationId: [status, name]. */
const RESPONSES = {
    adminCreateKey: ['201', 'CreatedApiKey'],
    adminCreateWebhook: ['201', 'CreatedWebhookEndpoint'],
};

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

async function loadSpec(source) {
    if (/^https?:\/\//.test(source)) {
        const response = await fetch(source);

        if (!response.ok) {
            throw new Error(`Fetching ${source} answered ${response.status}.`);
        }

        return load(await response.text());
    }

    return load(await readFile(source, 'utf8'));
}

const nameOf = (ref) => {
    const name = ref.slice(ref.lastIndexOf('/') + 1);

    return RENAMES[name] ?? name;
};

const literal = (value) => JSON.stringify(value);

const isEmptyObject = (value) =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0;

function ts(schema, indent = 0) {
    if (
        schema === undefined ||
        schema === null ||
        schema === true ||
        isEmptyObject(schema)
    ) {
        return 'unknown';
    }

    if ('$ref' in schema) {
        return nameOf(schema.$ref);
    }

    if ('allOf' in schema) {
        const parts = schema.allOf
            .map((part) => ts(part, indent))
            .filter((part) => part !== '{}');

        return (
            parts
                .map((part) => (part.includes('|') ? `(${part})` : part))
                .join(' & ') || 'unknown'
        );
    }

    for (const key of ['oneOf', 'anyOf']) {
        if (key in schema) {
            return schema[key].map((part) => ts(part, indent)).join(' | ');
        }
    }

    if ('const' in schema) {
        return literal(schema.const);
    }

    let types = Array.isArray(schema.type)
        ? schema.type
        : schema.type
          ? [schema.type]
          : [];
    const nullable = types.includes('null');
    types = types.filter((type) => type !== 'null');

    if ('enum' in schema) {
        const values = schema.enum.filter((value) => value !== null);
        let out = values.length > 0 ? values.map(literal).join(' | ') : 'never';

        if (nullable || schema.enum.includes(null)) {
            out += ' | null';
        }

        return out;
    }

    if (types.length === 0) {
        if (nullable && !('properties' in schema)) {
            // `{ type: "null" }`, as in `oneOf: [X, { type: "null" }]`.
            return 'null';
        }

        if ('properties' in schema || 'required' in schema) {
            types = ['object'];
        } else {
            return 'unknown' + (nullable ? ' | null' : '');
        }
    }

    const outs = types.map((type) => {
        switch (type) {
            case 'integer':
            case 'number':
                return 'number';
            case 'string':
                return 'string';
            case 'boolean':
                return 'boolean';
            case 'array':
                return `Array<${ts(schema.items, indent)}>`;
            case 'object':
                return object(schema, indent);
            default:
                return 'unknown';
        }
    });

    return outs.join(' | ') + (nullable ? ' | null' : '');
}

function object(schema, indent) {
    const properties = schema.properties ?? {};
    const required = new Set(schema.required ?? []);
    const additional = schema.additionalProperties;
    const additionalIsSchema =
        typeof additional === 'object' && additional !== null;
    // `additionalProperties: true` beside named properties: other keys are allowed too.
    const additionalIsOpen = additional === true || additionalIsSchema;

    if (Object.keys(properties).length === 0) {
        if (additionalIsSchema) {
            return `Record<string, ${ts(additional, indent)}>`;
        }

        return additional === false ? '{}' : 'Record<string, unknown>';
    }

    const pad = '    '.repeat(indent + 1);
    const lines = ['{'];

    for (const [key, value] of Object.entries(properties)) {
        const description =
            typeof value === 'object' && value !== null
                ? String(value.description ?? '')
                      .trim()
                      .replaceAll('*/', '* /')
                : '';

        if (description !== '') {
            lines.push(`${pad}/** ${description.split(/\r?\n/)[0]} */`);
        }

        const name = IDENTIFIER.test(key) ? key : literal(key);
        lines.push(
            `${pad}${name}${required.has(key) ? '' : '?'}: ${ts(value, indent + 1)};`,
        );
    }

    if (additionalIsOpen) {
        lines.push(`${pad}[key: string]: unknown;`);
    }

    lines.push('    '.repeat(indent) + '}');

    return lines.join('\n');
}

const spec = await loadSpec(SPEC);
const schemas = { ...spec.components.schemas };

for (const item of Object.values(spec.paths)) {
    for (const operation of Object.values(item)) {
        if (
            typeof operation !== 'object' ||
            operation === null ||
            !operation.operationId
        ) {
            continue;
        }

        const id = operation.operationId;

        if (id in BODIES) {
            schemas[BODIES[id]] =
                operation.requestBody.content['application/json'].schema;
        }

        if (id in RESPONSES) {
            const [status, name] = RESPONSES[id];
            schemas[name] =
                operation.responses[status].content['application/json'].schema;
        }
    }
}

const out = [
    '// Generated from the Integration API OpenAPI file (components.schemas).',
    '// Regenerate with `npm run generate` rather than editing it.',
    '',
];

for (const [rawName, schema] of Object.entries(schemas)) {
    const name = RENAMES[rawName] ?? rawName;
    const description = String(schema.description ?? '').trim();

    if (description !== '') {
        out.push(
            '/** ' +
                description.split(/\s+/).join(' ').replaceAll('*/', '* /') +
                ' */',
        );
    }

    const body = ts(schema);
    const single =
        (schema.type ?? 'object') === 'object' &&
        'properties' in schema &&
        !['oneOf', 'anyOf', 'allOf', 'enum'].some((key) => key in schema);

    out.push(
        single
            ? `export interface ${name} ${body}`
            : `export type ${name} = ${body};`,
    );
    out.push('');
}

await writeFile(OUTPUT, out.join('\n'));
console.log(`Wrote ${OUTPUT} from ${SPEC}.`);
