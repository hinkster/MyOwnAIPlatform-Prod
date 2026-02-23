"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROVIDERS = ["OPENAI", "ANTHROPIC", "GEMINI"] as const;

export function ProviderSettings({
  slug,
  isDemo,
  providersWithKey,
}: {
  slug: string;
  isDemo: boolean;
  providersWithKey: string[];
}) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function testConnection(provider: string) {
    const key = keys[provider];
    if (!key?.trim()) {
      setMessage({ type: "err", text: "Enter a key first" });
      return;
    }
    setTesting(provider);
    setMessage(null);
    try {
      const res = await fetch(`/api/t/${slug}/provider-keys/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key: key.trim() }),
      });
      const data = await res.json();
      setMessage({
        type: data.ok ? "ok" : "err",
        text: data.ok ? "Connection successful" : "Invalid key or connection failed",
      });
    } catch {
      setMessage({ type: "err", text: "Request failed" });
    } finally {
      setTesting(null);
    }
  }

  async function saveKey(provider: string) {
    if (isDemo) {
      setMessage({ type: "err", text: "Demo tenant cannot modify provider keys" });
      return;
    }
    const key = keys[provider];
    if (!key?.trim()) {
      setMessage({ type: "err", text: "Enter a key" });
      return;
    }
    setSaving(provider);
    setMessage(null);
    try {
      const res = await fetch(`/api/t/${slug}/provider-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save" });
        return;
      }
      setMessage({ type: "ok", text: "Saved (key is stored encrypted)" });
      setKeys((prev) => ({ ...prev, [provider]: "" }));
    } catch {
      setMessage({ type: "err", text: "Request failed" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      {isDemo && (
        <Card className="border-amber-500/50">
          <CardContent className="pt-6 text-amber-200">
            Demo tenant: provider keys cannot be modified.
          </CardContent>
        </Card>
      )}
      {message && (
        <p className={message.type === "ok" ? "text-green-400" : "text-red-400"}>{message.text}</p>
      )}
      {PROVIDERS.map((provider) => (
        <Card key={provider}>
          <CardHeader>
            <CardTitle className="text-accent">{provider}</CardTitle>
            {providersWithKey.includes(provider) && (
              <p className="text-sm text-muted-foreground">Key configured (not shown)</p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              type="password"
              placeholder={
                providersWithKey.includes(provider) ? "Enter new key to replace" : "API key"
              }
              value={keys[provider] ?? ""}
              onChange={(e) => setKeys((prev) => ({ ...prev, [provider]: e.target.value }))}
              disabled={isDemo}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection(provider)}
                disabled={isDemo || !keys[provider]?.trim() || !!testing}
              >
                {testing === provider ? "Testing…" : "Test connection"}
              </Button>
              {!isDemo && (
                <Button
                  size="sm"
                  onClick={() => saveKey(provider)}
                  disabled={!keys[provider]?.trim() || !!saving}
                >
                  {saving === provider ? "Saving…" : "Save key"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
