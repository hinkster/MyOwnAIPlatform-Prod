import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@makemyownmodel.ai" },
    update: {},
    create: {
      email: "demo@makemyownmodel.ai",
      passwordHash: await hash("demo-password", 10),
      name: "Demo User",
    },
  });

  const demoOrg = await prisma.organization.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organizationId: { userId: demoUser.id, organizationId: demoOrg.id },
    },
    update: {},
    create: {
      userId: demoUser.id,
      organizationId: demoOrg.id,
      role: "OWNER",
    },
  });

  await prisma.tenantConfig.upsert({
    where: { organizationId: demoOrg.id },
    update: {},
    create: {
      organizationId: demoOrg.id,
      useCase: "Demo",
      providerOrder: ["OPENAI", "ANTHROPIC", "GEMINI"],
      allowOllamaFallback: false,
    },
  });

  console.log("Seeded demo org and user.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
