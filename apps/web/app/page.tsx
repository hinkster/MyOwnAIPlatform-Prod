import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-primary text-white flex flex-col items-center justify-center p-8">
      <motion.div
        className="max-w-2xl text-center space-y-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center">
          <Image
            src="/brand/logo.svg"
            alt="My Own AI Model"
            width={180}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-brand-steel">
          MY OWN AI MODEL
        </h1>
        <p className="text-lg text-brand-steel/90">
          Build and personalize your AI. One platform, your data, your rules.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signin"
            className="px-6 py-3 rounded-lg bg-brand-accent text-brand-primary font-semibold hover:opacity-90 transition"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border-2 border-brand-accent text-brand-accent font-semibold hover:bg-brand-accent/10 transition"
          >
            Sign up
          </Link>
          <Link
            href="/t/demo"
            className="px-6 py-3 rounded-lg border border-brand-steel text-brand-steel font-medium hover:bg-white/5 transition"
          >
            View demo
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
