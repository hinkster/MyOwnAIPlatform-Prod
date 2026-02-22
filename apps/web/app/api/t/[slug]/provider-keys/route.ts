import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantIdForRequest } from "@makemyownmodel/tenant-context";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@makemyownmodel/encryption";
import { z } from "zod";

const bodySchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI"]),
  key: z.string().min(1),
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
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, organizationId: org.id },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (org.slug === "demo") {
    return NextResponse.json(
      { error: "Demo tenant cannot modify provider keys" },
      { status: 403 }
    );
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
