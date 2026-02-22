import { describe, it, expect, vi } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

describe("demo tenant lock", () => {
  it("demo org exists and has slug demo", async () => {
    const demo = await prisma.organization.findUnique({
      where: { slug: "demo" },
    });
    expect(demo).toBeTruthy();
    expect(demo?.slug).toBe("demo");
  });

  it("updating provider keys for demo returns 403", async () => {
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@makemyownmodel.ai" },
    });
    if (!demoUser) {
      console.warn("Demo user not found; run seed first");
      return;
    }
    const { getServerSession } = await import("next-auth");
    (getServerSession as any).mockResolvedValue({
      user: { id: demoUser.id },
    });
    const { POST } = await import("@/app/api/t/[slug]/provider-keys/route");
    const req = new Request("http://localhost/api/t/demo/provider-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "OPENAI", key: "sk-test" }),
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "demo" }) });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Demo tenant");
  });
});
