# Contributing

Thanks for helping improve `@storehugs/integration`. Bug reports, fixes and documentation changes are all welcome.

## Before you start

- **Bugs and ideas:** open an issue first for anything bigger than a small fix, so we can agree on the approach before you write code.
- **Security problems:** don't open a public issue. Follow [SECURITY.md](SECURITY.md).

## Setting up

You need Node 22 or later.

```bash
git clone git@github.com:innoverse-solutions/storehugs-ts-integration-sdk.git
cd storehugs-ts-integration-sdk
npm ci
```

## Making a change

1. Branch from `master`.
2. Make the change, with a test in `test/` for any change in behaviour.
3. Run the checks:

    ```bash
    npm run format
    npm run types:check
    npm test
    ```

4. Add a line to `CHANGELOG.md` under the next version.
5. Open a pull request against `master`. CI runs the same checks on Node 22, 24 and 26.

## Generated types

`src/schemas.ts` is generated from the Integration API's OpenAPI file. Don't edit it by hand. When the API changes, regenerate it:

```bash
npm run generate
```

This reads the published spec at `https://developers.storehugs.com/openapi.yaml`. To use a local copy, pass a path in `SPEC`, for example `SPEC=../openapi.yaml npm run generate`.

## Releases

Only maintainers publish. A release is a `v*.*.*` tag on `master`; the **Publish** workflow builds it and puts it on npm.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
