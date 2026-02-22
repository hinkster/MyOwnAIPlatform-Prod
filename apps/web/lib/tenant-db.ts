import type { TenantContextDb } from "@makemyownmodel/tenant-context";
import { prisma } from "./prisma";

/**
 * Prisma client cast to TenantContextDb for use with tenant-context helpers.
 * Prisma's Organization and Membership shapes satisfy the interface.
 */
export const tenantDb: TenantContextDb = prisma as unknown as TenantContextDb;
