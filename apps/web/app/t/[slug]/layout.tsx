import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { requireTenant } from "@makemyownmodel/tenant-context";
import { prisma } from "@/lib/prisma";
import { TenantSidebar } from "@/components/tenant-sidebar";
import Link from "next/link";
import Image from "next/image";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=" + encodeURIComponent(`/t/${slug}`));
  }
  let org;
  try {
    org = await requireTenant(prisma as any, slug, session.user.id);
  } catch {
    notFound();
  }
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <aside className="w-56 border-r border-[#7D939F]/30 flex flex-col">
        <div className="p-4 border-b border-[#7D939F]/30">
          <Link href={`/t/${slug}`} className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-semibold text-[#7D939F]">{org.name}</span>
          </Link>
        </div>
        <TenantSidebar slug={slug} />
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
