# Spec Delta: short-link

**Change:** add-short-link-redirect
**Format:** EARS (`WHEN <trigger> the system SHALL <response>`)

## ADDED Requirements

### Requirement: Redirect existing short code with 302

WHEN any visitor requests `GET /:shortCode` for a code that exists in `short_links`, the system SHALL respond with a `302` redirect whose `Location` header contains the absolute `originalUrl` (including `http://` or `https://`).

#### Scenario: Successful redirect returns 302 with absolute Location

- **WHEN** `GET /:shortCode` is received for an existing code
- **THEN** the system responds `302` with `Location` equal to the stored `originalUrl` (absolute, with scheme).

### Requirement: Record a click on redirect (event-sourced)

WHEN the system resolves an existing `shortCode` during `GET /:shortCode`, the system SHALL insert a row into `link_visits` with the `short_code` and an ISO `visited_at` timestamp, without modifying `short_links`.

#### Scenario: Click is counted on redirect

- **WHEN** a successful redirect occurs for an existing code
- **THEN** a new row exists in `link_visits` for that `short_code` and `countClicks(shortCode)` is at least `1`.

### Requirement: Return 404 for unknown short code

WHEN any visitor requests `GET /:shortCode` for a code not present in `short_links` (including malformed / non-base62 codes), the system SHALL respond with `404` and SHALL NOT insert any row into `link_visits`.

#### Scenario: Unknown code returns 404

- **WHEN** `GET /:shortCode` is received for a non-existent code
- **THEN** the system responds `404` and no `link_visits` row is created.

#### Scenario: Non-base62 code returns 404

- **WHEN** `GET /:shortCode` is received with a code containing characters outside the base62 alphabet
- **THEN** the system responds `404` and no `link_visits` row is created.

### Requirement: Count clicks by short code

WHEN the system needs the number of clicks for a `shortCode`, the system SHALL return `COUNT(*)` from `link_visits` where `short_code = ?`.

#### Scenario: Count increases per visit

- **WHEN** `recordVisit` is called N times for the same code
- **THEN** `countClicks(code)` returns N.

### Requirement: Persist visits in a separate table

WHEN the schema is created, the system SHALL create a `link_visits` table (id autoincrement, `short_code` TEXT NOT NULL, `visited_at` TEXT NOT NULL) alongside `short_links`, and SHALL NOT add a click-count column to `short_links`.

#### Scenario: Table created idempotently without altering short_links

- **WHEN** the Drizzle repository initializes
- **THEN** `link_visits` exists (created with `IF NOT EXISTS`) and `short_links` is unchanged.
