import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  requireTenant,
  assertNotDemoTenant,
  DemoTenantLockedError,
} from "@makemyownmodel/tenant-context";
import { tenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@makemyownmodel/encryption";
import { z } from "zod";

const bodySchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI"]),
  key: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const { slug } = params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let org;
  try {
    org = await requireTenant(tenantDb, slug, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    assertNotDemoTenant(org.slug);
  } catch (e) {
    if (e instanceof DemoTenantLockedError) {
      return NextResponse.json(
        { error: "Demo tenant cannot modify provider keys" },
        { status: 403 }
      );
    }
    throw e;
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { provider, key } = parsed.data;
  const encryptedKey = encrypt(key);
  await prisma.providerKey.upsert({
    where: {
      organizationId_provider: { organizationId: org.id, provider },
    },
    update: { encryptedKey },
    create: {
      organizationId: org.id,
      provider,
      encryptedKey,
    },
  });
  return NextResponse.json({ ok: true });
}
