import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantIdForRequest } from "@makemyownmodel/tenant-context";
import { tenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default async function OnboardingPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const { slug } = params;
  if (!session?.user?.id) return null;
  const tenantId = await getTenantIdForRequest(tenantDb, slug, session.user.id);
  const config = await prisma.tenantConfig.findUnique({
    where: { organizationId: tenantId },
  });
  const org = await prisma.organization.findUnique({
    where: { id: tenantId },
  });
  if (org?.slug === "demo") {
    redirect(`/t/${slug}/dashboard`);
  }
  if (config?.useCase) {
    redirect(`/t/${slug}/dashboard`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Onboarding</h1>
      <OnboardingWizard slug={slug} orgName={org?.name ?? ""} orgSlug={org?.slug ?? slug} />
    </div>
  );
}
