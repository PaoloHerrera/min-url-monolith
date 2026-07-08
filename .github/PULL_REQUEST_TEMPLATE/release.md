## Release v<!-- x.y.z -->: Develop ➔ Master

> Stable version ready for production. Everything is tested manually before merging.

---

### Goal

<!-- What does this release accomplish? What capabilities become available in production? -->

---

### Changelog

#### ✨ Features

-

#### 🐛 Fixes

-

#### ♻️ Refactors & internal improvements

-

#### 📦 Dependencies

-

---

### Visual

<!-- Screenshots or recordings of the main flows tested. Remove this section if there are no visible changes. -->

---

### Verification

#### Automated

- [ ] CI on `develop` is green (GitHub Actions)
- [ ] `bun run test` passing (Vitest)
- [ ] `bun run test:e2e` passing (Playwright)
- [ ] `bun run build` with no errors

#### Manual

- [ ] Main flow tested locally: create short URL and redirect
- [ ] Docker: `docker compose up --build` starts without errors and the app responds
- [ ] Environment variables verified (`.env` up to date, no exposed secrets)
- [ ] <!-- Add any release-specific flow you tested manually -->

---

### Production notes

<!-- Pending migrations, new env vars, config changes, or any other special instructions. Remove if not applicable. -->
