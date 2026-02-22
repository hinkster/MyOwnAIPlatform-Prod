import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantIdForRequest } from "@makemyownmodel/tenant-context";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  if (!session?.user?.id) return null;
  const tenantId = await getTenantIdForRequest(prisma as any, slug, session.user.id);
  const config = await prisma.tenantConfig.findUnique({
    where: { organizationId: tenantId },
  });
  const org = await prisma.organization.findUnique({
    where: { id: tenantId },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        Dashboard
        {org && <span className="text-muted-foreground font-normal"> · {org.name}</span>}
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-accent">Getting started</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {config
              ? "Your organization is set up. Adjust provider keys and branding in Settings."
              : "Complete onboarding to configure your organization."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-accent">Use case</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {config?.useCase ?? "Not set"}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
