import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantIdForRequest } from "@makemyownmodel/tenant-context";
import { tenantDb } from "@/lib/tenant-db";
import { z } from "zod";

const TEST_TIMEOUT_MS = 6_000;

const bodySchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI"]),
  key: z.string().min(1),
});

function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = TEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...fetchOptions, signal: controller.signal }).finally(() => clearTimeout(id));
}

async function testOpenAI(key: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      timeout: TEST_TIMEOUT_MS,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function testAnthropic(key: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
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
      timeout: TEST_TIMEOUT_MS,
    });
    return res.status !== 401 && res.status !== 403;
  } catch {
    return false;
  }
}

async function testGemini(key: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { timeout: TEST_TIMEOUT_MS }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const { slug } = params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await getTenantIdForRequest(tenantDb, slug, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
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
