import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { POST as signupPost } from "@/app/api/auth/signup/route";

const TEST_EMAIL = `signin-test-${Date.now()}@test.local`;
const TEST_PASSWORD = "test-password-123";

describe("sign-in flow", () => {
  beforeAll(async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Signin Test",
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
    const res = await signupPost(req);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`Signup failed: ${res.status} ${JSON.stringify(body)}`);
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  });

  it("signup creates user that can be found with case-insensitive email and correct password", async () => {
    const emailLower = TEST_EMAIL.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailLower, mode: "insensitive" } },
    });
    expect(user).toBeTruthy();
    expect(user?.passwordHash).toBeTruthy();
    const ok = await compare(TEST_PASSWORD, user!.passwordHash);
    expect(ok).toBe(true);
  });

  it("wrong password does not match stored hash", async () => {
    const user = await prisma.user.findFirst({
      where: { email: { equals: TEST_EMAIL.toLowerCase(), mode: "insensitive" } },
    });
    expect(user).toBeTruthy();
    const ok = await compare("wrong-password", user!.passwordHash);
    expect(ok).toBe(false);
  });
});
