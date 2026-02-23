"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = 6;
const USE_CASES = ["Support", "Content", "Code", "Other"];
const PROVIDERS = ["OPENAI", "ANTHROPIC", "GEMINI"] as const;

export function OnboardingWizard({
  slug,
  orgName,
  orgSlug,
}: {
  slug: string;
  orgName: string;
  orgSlug: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [organizationName, setOrganizationName] = useState(orgName);
  const [slugValue, setSlugValue] = useState(orgSlug);
  const [useCase, setUseCase] = useState("");
  const [useCaseOther, setUseCaseOther] = useState("");
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({});
  const [providerOrder, setProviderOrder] = useState<string[]>([...PROVIDERS]);
  const [allowOllamaFallback, setAllowOllamaFallback] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#1A2A6C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function saveStep(stepData: Record<string, unknown>) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/t/${slug}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stepData),
      });
      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError(res.ok ? "Request failed" : text || `Error ${res.status}`);
        return false;
      }
      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
        return false;
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    if (step === 1) {
      const ok = await saveStep({
        step: 1,
        organizationName: organizationName.trim(),
        slug: slugValue.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      if (!ok) return;
    }
    if (step === 2) {
      const ok = await saveStep({
        step: 2,
        useCase: useCase === "Other" ? useCaseOther : useCase,
      });
      if (!ok) return;
    }
    if (step === 3) {
      const keys: Record<string, string> = {};
      for (const p of PROVIDERS) {
        if (providerKeys[p]?.trim()) keys[p] = providerKeys[p].trim();
      }
      const ok = await saveStep({ step: 3, providerKeys: keys });
      if (!ok) return;
    }
    if (step === 4) {
      const ok = await saveStep({ step: 4, providerOrder });
      if (!ok) return;
    }
    if (step === 5) {
      const ok = await saveStep({ step: 5, allowOllamaFallback });
      if (!ok) return;
    }
    if (step === 6) {
      const ok = await saveStep({
        step: 6,
        branding: { primaryColor },
      });
      if (!ok) return;
      const finalSlug = slugValue.trim().toLowerCase().replace(/\s+/g, "-") || slug;
      router.push(`/t/${finalSlug}/dashboard`);
      router.refresh();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${i + 1 <= step ? "bg-accent" : "bg-muted"}`}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Organization name
                  </label>
                  <Input
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Acme Inc"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Tenant slug (URL)
                  </label>
                  <Input
                    value={slugValue}
                    onChange={(e) =>
                      setSlugValue(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())
                    }
                    placeholder="acme"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Primary use case</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-foreground"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                >
                  <option value="">Select…</option>
                  {USE_CASES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {useCase === "Other" && (
                  <Input
                    placeholder="Describe your use case"
                    value={useCaseOther}
                    onChange={(e) => setUseCaseOther(e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Provider API keys</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Stored encrypted. Enter at least one.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {PROVIDERS.map((p) => (
                  <div key={p}>
                    <label className="block text-sm text-muted-foreground mb-1">{p}</label>
                    <Input
                      type="password"
                      placeholder={`${p} API key`}
                      value={providerKeys[p] ?? ""}
                      onChange={(e) =>
                        setProviderKeys((prev) => ({ ...prev, [p]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Provider order</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Default: OpenAI → Anthropic → Gemini
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {providerOrder.map((p, i) => (
                  <div key={p} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-6">{i + 1}.</span>
                    <span className="text-white">{p}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Ollama fallback</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowOllamaFallback}
                    onChange={(e) => setAllowOllamaFallback(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-muted-foreground">
                    Allow fallback to local Ollama (default off)
                  </span>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Branding (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Primary color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div
                  className="rounded-lg p-4 border border-border"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="text-white/90 text-sm">Preview: your primary color</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || loading}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={loading}>
          {step === STEPS ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
