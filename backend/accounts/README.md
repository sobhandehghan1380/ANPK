# Accounts boundary

`accounts` owns authentication, organization membership selection, and member
management. Public API paths intentionally remain under `/api/v1/portal/` so
existing clients do not need to change.

## Model ownership

`UserProfile`, `Organization`, `OrganizationMembership`, and `SMSOTPCode` are
owned by `accounts.models`. Their historical `portal_*` database table names
are intentionally preserved, so this boundary change does not copy or drop
customer data. Django content types and permissions are migrated to the new
app label while preserving their primary keys.

The active `OWNER` membership is the single source of truth for organization
ownership. The former `Organization.owner_user` compatibility column was
removed only after a guarded migration verified that every organization had
exactly one active owner membership.
