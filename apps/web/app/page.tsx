import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1A2A6C] text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <Image
            src="/logo.svg"
            alt="My Own AI Model"
            width={180}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#7D939F]">
          MY OWN AI MODEL
        </h1>
        <p className="text-lg text-[#7D939F]/90">
          Build and personalize your AI. One platform, your data, your rules.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signin"
            className="px-6 py-3 rounded-lg bg-[#FBC549] text-[#1A2A6C] font-semibold hover:opacity-90 transition"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border-2 border-[#FBC549] text-[#FBC549] font-semibold hover:bg-[#FBC549]/10 transition"
          >
            Sign up
          </Link>
          <Link
            href="/t/demo"
            className="px-6 py-3 rounded-lg border border-[#7D939F] text-[#7D939F] font-medium hover:bg-white/5 transition"
          >
            View demo
          </Link>
        </div>
      </div>
    </div>
  );
}
