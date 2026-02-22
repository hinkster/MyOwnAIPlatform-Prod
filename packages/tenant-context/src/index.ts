export type Organization = { id: string; name: string; slug: string };
export type Membership = { userId: string; organizationId: string; role: string };

export interface TenantContextDb {
  organization: {
    findUnique: (args: { where: { slug: string } }) => Promise<Organization | null>;
  };
  membership: {
    findFirst: (args: {
      where: { userId: string; organizationId: string };
    }) => Promise<Membership | null>;
  };
}

export class TenantForbiddenError extends Error {
  constructor(message: string = "Tenant access forbidden") {
    super(message);
    this.name = "TenantForbiddenError";
  }
}

export class TenantNotFoundError extends Error {
  constructor(message: string = "Tenant not found") {
    super(message);
    this.name = "TenantNotFoundError";
  }
}

/**
 * Resolve organization by slug. Returns null if not found.
 */
export async function getTenantFromSlug(
  db: TenantContextDb,
  slug: string
): Promise<Organization | null> {
  return db.organization.findUnique({ where: { slug } });
}

/**
 * Resolve organization by slug and verify the user is a member. Throws if not found or not a member.
 */
export async function requireTenant(
  db: TenantContextDb,
  slug: string,
  userId: string
): Promise<Organization> {
  const org = await getTenantFromSlug(db, slug);
  if (!org) {
    throw new TenantNotFoundError(`Organization with slug '${slug}' not found`);
  }
  const membership = await db.membership.findFirst({
    where: { userId, organizationId: org.id },
  });
  if (!membership) {
    throw new TenantForbiddenError(`User is not a member of organization '${slug}'`);
  }
  return org;
}

/**
 * Returns organizationId for the given slug after verifying membership. Use in all server actions and API routes that touch tenant data.
 */
export async function getTenantIdForRequest(
  db: TenantContextDb,
  slug: string,
  userId: string
): Promise<string> {
  const org = await requireTenant(db, slug, userId);
  return org.id;
}
