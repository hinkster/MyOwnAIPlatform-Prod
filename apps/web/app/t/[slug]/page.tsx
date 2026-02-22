import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantFromSlug } from "@makemyownmodel/tenant-context";
import { tenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TenantHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const org = await getTenantFromSlug(tenantDb, slug);
  if (!org) return null;

  if (slug === "demo") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Demo tenant</h1>
        <p className="text-muted-foreground mb-6">
          This is the locked demo organization. You can view the dashboard but cannot change provider keys.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-accent">Try it</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Sign in as demo@makemyownmodel.ai / demo-password to explore the app with the demo org.
          </CardContent>
        </Card>
        <div className="mt-6 flex gap-4">
          <Button asChild>
            <Link href="/signin?callbackUrl=/t/demo/dashboard">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white">{org.name}</h1>
        <p className="text-muted-foreground mt-2">Sign in to access this organization.</p>
        <Button asChild className="mt-4">
          <Link href={`/signin?callbackUrl=/t/${slug}/dashboard`}>Sign in</Link>
        </Button>
      </div>
    );
  }

  const config = await prisma.tenantConfig.findUnique({
    where: { organizationId: org.id },
  });
  const next = config?.useCase ? `/t/${slug}/dashboard` : `/t/${slug}/onboarding`;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">{org.name}</h1>
      <p className="text-muted-foreground mt-2 mb-6">Welcome. Continue to your workspace.</p>
      <Button asChild>
        <Link href={next}>{config?.useCase ? "Go to Dashboard" : "Complete onboarding"}</Link>
      </Button>
    </div>
  );
}
