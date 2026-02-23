import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let postgres: "connected" | "error" = "error";
  try {
    await prisma.$queryRaw`SELECT 1`;
    postgres = "connected";
  } catch {
    postgres = "error";
  }
  const status = postgres === "connected" ? "ok" : "degraded";
  return NextResponse.json({ status, postgres }, { status: 200 });
}
