import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name: name ?? null, passwordHash },
  });
  const baseSlug = email.replace(/@.*/, "").replace(/[^a-z0-9]/gi, "").toLowerCase() || "org";
  let slug = baseSlug;
  let n = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }
  const org = await prisma.organization.create({
    data: { name: name ?? email, slug },
  });
  await prisma.membership.create({
    data: { userId: user.id, organizationId: org.id, role: "OWNER" },
  });
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    slug: org.slug,
  });
}
