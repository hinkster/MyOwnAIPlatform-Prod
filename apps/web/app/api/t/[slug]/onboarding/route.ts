import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantIdForRequest } from "@makemyownmodel/tenant-context";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@makemyownmodel/encryption";
import { z } from "zod";

const bodySchema = z.object({
  step: z.number().int().min(1).max(6),
  organizationName: z.string().optional(),
  slug: z.string().optional(),
  useCase: z.string().optional(),
  tone: z.string().optional(),
  providerOrder: z.array(z.enum(["OPENAI", "ANTHROPIC", "GEMINI"])).optional(),
  allowOllamaFallback: z.boolean().optional(),
  branding: z.object({ logoUrl: z.string().optional(), primaryColor: z.string().optional() }).optional(),
  providerKeys: z.record(z.enum(["OPENAI", "ANTHROPIC", "GEMINI"]), z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = await getTenantIdForRequest(prisma as any, slug, session.user.id);
  const org = await prisma.organization.findUnique({ where: { id: tenantId } });
  if (!org || org.slug === "demo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.organizationName !== undefined) {
    await prisma.organization.update({
      where: { id: tenantId },
      data: { name: data.organizationName },
    });
  }
  if (data.slug !== undefined && data.slug !== org.slug) {
    const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }
    await prisma.organization.update({
      where: { id: tenantId },
      data: { slug: data.slug },
    });
  }

  let config = await prisma.tenantConfig.findUnique({
    where: { organizationId: tenantId },
  });
  if (!config) {
    config = await prisma.tenantConfig.create({
      data: {
        organizationId: tenantId,
        providerOrder: ["OPENAI", "ANTHROPIC", "GEMINI"],
        allowOllamaFallback: false,
      },
    });
  }

  const updates: Parameters<typeof prisma.tenantConfig.update>[0]["data"] = {};
  if (data.useCase !== undefined) updates.useCase = data.useCase;
  if (data.tone !== undefined) updates.tone = data.tone;
  if (data.providerOrder !== undefined) updates.providerOrder = data.providerOrder;
  if (data.allowOllamaFallback !== undefined) updates.allowOllamaFallback = data.allowOllamaFallback;
  if (data.branding !== undefined) updates.branding = data.branding;
  if (Object.keys(updates).length > 0) {
    await prisma.tenantConfig.update({
      where: { organizationId: tenantId },
      data: updates,
    });
  }

  if (data.providerKeys) {
    for (const [provider, key] of Object.entries(data.providerKeys)) {
      if (!key) continue;
      const encryptedKey = encrypt(key);
      await prisma.providerKey.upsert({
        where: {
          organizationId_provider: { organizationId: tenantId, provider: provider as any },
        },
        update: { encryptedKey },
        create: {
          organizationId: tenantId,
          provider: provider as any,
          encryptedKey,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
