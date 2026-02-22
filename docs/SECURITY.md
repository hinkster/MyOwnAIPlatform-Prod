# Security

## Provider keys

- **Storage**: Keys are encrypted at rest using AES-256-GCM and `APP_ENCRYPTION_KEY`. Never log or return decrypted keys in API responses.
- **Test connection**: The test endpoint calls provider APIs (e.g. list models) with the key but does not persist it in logs. Only validation result is returned.
- **Demo tenant**: Org with slug `demo` cannot modify or add provider keys (enforced in API).

## Tenant isolation

- All tenant-scoped data is keyed by `organizationId`. Server actions and API routes must resolve the tenant via `getTenantIdForRequest(prisma, slug, userId)` (or `requireTenant`) and use that ID in every Prisma query. No API may return another tenant’s data.
- Path-based tenancy: `/t/{tenantSlug}/...`. The slug is resolved to an organization; membership is checked before any tenant data is read or written.

## Secrets

- **APP_ENCRYPTION_KEY**: Must be set in production; 32-byte value as 64-char hex or base64url. Used only for encrypting/decrypting provider keys.
- **NEXTAUTH_SECRET**: Required for NextAuth session signing. Use a long random value in production.

## Audit

- `AuditLog` exists for minimal audit (action, actorUserId, tenantId, metadata). Phase 1 does not yet write to it for every sensitive action; Phase 2 can expand usage.
