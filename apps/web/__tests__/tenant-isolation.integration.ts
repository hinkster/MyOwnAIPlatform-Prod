import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { requireTenant, getTenantIdForRequest, TenantForbiddenError } from "@makemyownmodel/tenant-context";
import { prisma } from "@/lib/prisma";

const SLUG_A = "test-iso-a-" + Date.now();
const SLUG_B = "test-iso-b-" + Date.now();

describe("tenant isolation", () => {
  let orgAId: string;
  let orgBId: string;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    const userA = await prisma.user.create({
      data: {
        email: `iso-a-${Date.now()}@test.local`,
        passwordHash: "hash",
        name: "User A",
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: `iso-b-${Date.now()}@test.local`,
        passwordHash: "hash",
        name: "User B",
      },
    });
    userAId = userA.id;
    userBId = userB.id;

    const orgA = await prisma.organization.create({
      data: { name: "Org A", slug: SLUG_A },
    });
    const orgB = await prisma.organization.create({
      data: { name: "Org B", slug: SLUG_B },
    });
    orgAId = orgA.id;
    orgBId = orgB.id;

    await prisma.membership.createMany({
      data: [
        { userId: userAId, organizationId: orgAId, role: "OWNER" },
        { userId: userBId, organizationId: orgBId, role: "OWNER" },
      ],
    });

    await prisma.tenantConfig.create({
      data: { organizationId: orgAId, useCase: "A use case" },
    });
    await prisma.tenantConfig.create({
      data: { organizationId: orgBId, useCase: "B use case" },
    });
  });

  afterAll(async () => {
    await prisma.tenantConfig.deleteMany({
      where: { organizationId: { in: [orgAId, orgBId] } },
    });
    await prisma.membership.deleteMany({
      where: { organizationId: { in: [orgAId, orgBId] } },
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
  });

  it("requireTenant(prisma, B.slug, userA.id) throws TenantForbiddenError", async () => {
    await expect(
      requireTenant(prisma as any, SLUG_B, userAId)
    ).rejects.toThrow(TenantForbiddenError);
  });

  it("getTenantIdForRequest(prisma, B.slug, userA.id) throws", async () => {
    await expect(
      getTenantIdForRequest(prisma as any, SLUG_B, userAId)
    ).rejects.toThrow();
  });

  it("getTenantIdForRequest(prisma, A.slug, userA.id) returns org A id", async () => {
    const tenantId = await getTenantIdForRequest(prisma as any, SLUG_A, userAId);
    expect(tenantId).toBe(orgAId);
  });

  it("user A cannot read tenant B config when scoped by tenantId", async () => {
    const tenantId = await getTenantIdForRequest(prisma as any, SLUG_A, userAId);
    const configs = await prisma.tenantConfig.findMany({
      where: { organizationId: tenantId },
    });
    expect(configs.every((c) => c.organizationId === orgAId)).toBe(true);
    expect(configs.some((c) => c.organizationId === orgBId)).toBe(false);
  });
});
