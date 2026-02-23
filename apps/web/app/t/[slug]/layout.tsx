import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { requireTenant, TenantNotFoundError } from "@makemyownmodel/tenant-context";
import { tenantDb } from "@/lib/tenant-db";
import { prisma } from "@/lib/prisma";
import { TenantSidebar } from "@/components/tenant-sidebar";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const { slug } = params;
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=" + encodeURIComponent(`/t/${slug}`));
  }
  let org;
  try {
    org = await requireTenant(tenantDb, slug, session.user.id);
  } catch (err) {
    if (err instanceof TenantNotFoundError) {
      const memberships = await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { createdAt: "asc" },
      });
      const firstOrg = memberships[0]?.organization;
      if (firstOrg) {
        redirect(`/t/${firstOrg.slug}`);
      }
    }
    notFound();
  }
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <aside className="w-56 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href={`/t/${slug}`} className="flex items-center gap-2">
            <Image src="/brand/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-semibold text-brand-steel">{org.name}</span>
          </Link>
        </div>
        <TenantSidebar slug={slug} />
      </aside>
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
