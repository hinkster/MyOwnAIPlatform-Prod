import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireTenant } from "@makemyownmodel/tenant-context";
import { prisma } from "@/lib/prisma";
import { ProviderSettings } from "@/components/provider-settings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  if (!session?.user?.id) return null;
  const org = await requireTenant(prisma as any, slug, session.user.id);
  const config = await prisma.tenantConfig.findUnique({
    where: { organizationId: org.id },
  });
  const keys = await prisma.providerKey.findMany({
    where: { organizationId: org.id },
    select: { id: true, provider: true, createdAt: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      <ProviderSettings
        slug={slug}
        isDemo={org.slug === "demo"}
        providersWithKey={keys.map((k) => k.provider)}
      />
    </div>
  );
}
