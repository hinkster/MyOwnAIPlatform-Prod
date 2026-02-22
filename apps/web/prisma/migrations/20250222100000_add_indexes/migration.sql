-- Add indexes for tenant-scoped queries and time-based lookups
CREATE INDEX IF NOT EXISTS "ProviderKey_organizationId_idx" ON "ProviderKey"("organization_id");
CREATE INDEX IF NOT EXISTS "ProviderKey_createdAt_idx" ON "ProviderKey"("created_at");
CREATE INDEX IF NOT EXISTS "AuditLog_organizationId_idx" ON "AuditLog"("organization_id");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("created_at");
