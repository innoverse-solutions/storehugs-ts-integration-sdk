# Security policy

## Reporting a vulnerability

Please don't report security problems in public issues, pull requests or discussions.

Report them privately through GitHub instead:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the problem, how to reproduce it, and what an attacker could do with it.

Only the maintainers can see the report. We'll confirm we received it, keep you updated while we work on a fix, and credit you in the release notes unless you'd rather stay anonymous.

This covers:

- **This client:** for example, a flaw in webhook signature checks, PKCE, request signing or the handling of keys and tokens.
- **The Store Hugs Integration API it talks to:** report those through the same channel and we'll pass them to the platform team.

## Supported versions

Security fixes go into the latest release. Upgrade to the newest version of `@storehugs/integration` to get them.

## Keeping your keys safe

- **Admin keys (`sa_live_…`) and secret keys (`sk_live_…`):** use them only on your server. Never ship them in a browser, mobile app or public repository.
- **Publishable keys (`pk_live_…`):** these may appear in web pages. They only work from the sites listed on the key.
- **If a key leaks:** revoke it in the Store Hugs panel under **Shop Settings → Integration API**, and make a new one.
