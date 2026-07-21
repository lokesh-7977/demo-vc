import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useOrg,
  useProviders,
  useUpdateOrganization,
  useUsage,
} from "@/lib/queries";
import { handleError, handleSuccess } from "@/components/ui/toast";

export function SettingsView() {
  return (
    <div className="max-w-3xl space-y-6">
      <OrgCard />
      <ProvidersCard />
      <PlanCard />
    </div>
  );
}

function OrgCard() {
  const { data: org, isLoading } = useOrg();
  const updateOrg = useUpdateOrganization();
  const [form, setForm] = useState({ name: "", website: "", timezone: "" });

  useEffect(() => {
    if (org) {
      setForm({
        name: (org.name as string) ?? "",
        website: (org.website as string) ?? "",
        timezone: (org.timezone as string) ?? "Asia/Kolkata",
      });
    }
  }, [org]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrg.mutateAsync(form);
      handleSuccess("Organization updated", "Your business profile is saved.");
    } catch (err) {
      handleError(err, "Save failed");
    }
  };
  const saving = updateOrg.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">Organization</CardTitle>
        <CardDescription>
          Business profile used across calls and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="animate-spin text-text-faint" />
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Input
                  value={form.timezone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timezone: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Save size={14} className="mr-1" />
              )}
              Save
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function ProvidersCard() {
  const { data: providers, isLoading } = useProviders();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">
          AI & phone providers
        </CardTitle>
        <CardDescription>
          Managed by Lokvera by default — bring your own keys per provider on
          the Numbers page (telephony) or via the API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="animate-spin text-text-faint" />
        ) : (providers ?? []).length === 0 ? (
          <p className="text-sm text-text-faint">
            No BYOK providers configured — using Lokvera Managed AI (Sarvam
            STT/TTS/LLM).
          </p>
        ) : (
          <div className="space-y-2">
            {(providers ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5"
              >
                {p.verificationStatus === "verified" ? (
                  <ShieldCheck size={15} className="text-brand-cyan" />
                ) : (
                  <ShieldX size={15} className="text-destructive" />
                )}
                <span className="text-sm font-medium capitalize text-text-strong">
                  {p.providerName}
                </span>
                <span className="rounded bg-surface-strong px-1.5 py-0.5 text-[10px] uppercase text-text-faint">
                  {p.providerType}
                </span>
                <span className="ml-auto text-xs text-text-faint">
                  {p.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanCard() {
  const { data: usage, isLoading } = useUsage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">
          Usage this period
        </CardTitle>
        <CardDescription>
          {usage
            ? `${usage.periodStart} → ${usage.periodEnd}`
            : "Current billing period"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !usage ? (
          <Loader2 className="animate-spin text-text-faint" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Call minutes" value={usage.callMinutes.toFixed(1)} />
            <Stat label="Calls" value={String(usage.callsCount)} />
            <Stat
              label="TTS characters"
              value={usage.ttsCharacters.toLocaleString()}
            />
            <Stat
              label="LLM tokens"
              value={usage.llmTokens.toLocaleString()}
            />
          </div>
        )}
        {usage && usage.amountDue > 0 && (
          <p className="mt-4 text-sm text-destructive">
            Overage this period: ₹{usage.amountDue.toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-text-faint">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold text-text-strong">
        {value}
      </p>
    </div>
  );
}
