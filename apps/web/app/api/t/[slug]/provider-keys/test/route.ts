import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantIdForRequest } from "@makemyownmodel/tenant-context";
import { tenantDb } from "@/lib/tenant-db";
import { z } from "zod";

const bodySchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI"]),
  key: z.string().min(1),
});

async function testOpenAI(key: string): Promise<boolean> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  return res.ok;
}

async function testAnthropic(key: string): Promise<boolean> {
  const res = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      }),
    }
  );
  return res.status !== 401 && res.status !== 403;
}

async function testGemini(key: string): Promise<boolean> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  );
  return res.ok;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  const { slug } = params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await getTenantIdForRequest(tenantDb, slug, session.user.id);
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { provider, key } = parsed.data;
  let ok = false;
  try {
    if (provider === "OPENAI") ok = await testOpenAI(key);
    else if (provider === "ANTHROPIC") ok = await testAnthropic(key);
    else if (provider === "GEMINI") ok = await testGemini(key);
  } catch {
    ok = false;
  }
  return NextResponse.json({ ok });
}
