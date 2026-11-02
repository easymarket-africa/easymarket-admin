"use client";

import { useState } from "react";
import { CreditCard, Info, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useConfirmPaymentProviderChange,
  usePaymentProviderSettings,
  useRequestPaymentProviderChange,
} from "@/hooks/use-settings";
import {
  PaymentProviderChangeRequest,
  PaymentProviderName,
} from "@/types/api";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const LABELS: Record<PaymentProviderName, string> = {
  paystack: "Paystack",
  monnify: "Monnify",
};

const SOURCE_NOTES: Record<string, string> = {
  override:
    "An environment override is forcing this provider. Remove PAYMENT_PROVIDER_OVERRIDE on the server to use the setting below.",
  default: "No provider has been selected yet; using the server default.",
};

/**
 * Settings → Payments. Switching the provider for new payments takes two
 * steps: request a change (a code is emailed to the approvers), then enter
 * the code. Payments already started keep using the provider that started
 * them.
 */
export function PaymentProviderSettings() {
  const { data, isLoading, error } = usePaymentProviderSettings();
  const requestChange = useRequestPaymentProviderChange();
  const confirmChange = useConfirmPaymentProviderChange();

  const [target, setTarget] = useState<PaymentProviderName | null>(null);
  const [reason, setReason] = useState("");
  const [request, setRequest] = useState<PaymentProviderChangeRequest | null>(
    null
  );
  const [code, setCode] = useState("");

  const closeDialog = () => {
    setTarget(null);
    setReason("");
    setRequest(null);
    setCode("");
  };

  const submitRequest = () => {
    if (!target) return;
    requestChange.mutate(
      { provider: target, reason: reason.trim() || undefined },
      { onSuccess: (res) => setRequest(res) }
    );
  };

  const submitCode = () => {
    if (!request) return;
    confirmChange.mutate(
      { requestId: request.requestId, code },
      { onSuccess: closeDialog }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Loading payment settings…
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-destructive">
          Could not load payment settings.
        </CardContent>
      </Card>
    );
  }

  const overrideActive = data.source === "override";
  const selected = data.selectedProvider ?? data.activeProvider;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Provider
          </CardTitle>
          <CardDescription>
            Choose which provider handles new checkouts. Payments already in
            progress always finish with the provider that started them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">New payments use</span>
            <Badge>{LABELS[data.activeProvider]}</Badge>
            {data.pilotUserCount > 0 && (
              <Badge variant="outline">
                {data.pilotUserCount} pilot user(s) on Monnify
              </Badge>
            )}
          </div>

          {SOURCE_NOTES[data.source] && (
            <div className="flex gap-2 rounded-md border p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{SOURCE_NOTES[data.source]}</span>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {data.providers.map((provider) => {
              const isSelected = provider.name === selected;
              return (
                <div
                  key={provider.name}
                  className={`flex items-center justify-between rounded-md border p-4 ${
                    isSelected ? "border-primary" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{LABELS[provider.name]}</p>
                    <p className="text-xs text-muted-foreground">
                      {!provider.configured
                        ? "Not configured on this server"
                        : !provider.selectable
                          ? "Disabled on this server"
                          : provider.environment
                            ? `${provider.environment} mode`
                            : "Ready"}
                    </p>
                  </div>
                  {isSelected ? (
                    <Badge variant="secondary">Selected</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!provider.selectable || overrideActive}
                      onClick={() => setTarget(provider.name)}
                    >
                      Switch
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Switching needs a code sent to {data.approverEmails.join(" and ")}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change history</CardTitle>
        </CardHeader>
        <CardContent>
          {data.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No changes yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                    <TableCell>
                      {entry.previousProvider
                        ? `${LABELS[entry.previousProvider] ?? entry.previousProvider} → `
                        : ""}
                      {LABELS[entry.activeProvider] ?? entry.activeProvider}
                    </TableCell>
                    <TableCell>
                      {entry.changedBy
                        ? entry.changedBy.name
                        : entry.confirmedVia === "seed"
                          ? "System"
                          : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.reason || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!target} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Switch to {target ? LABELS[target] : ""}
            </DialogTitle>
            <DialogDescription>
              {request
                ? `Enter the 6-digit code sent to ${request.sentTo.join(" and ")}. It expires in 10 minutes.`
                : "A confirmation code will be emailed to the approvers. The switch only happens once the code is entered."}
            </DialogDescription>
          </DialogHeader>

          {!request ? (
            <div className="space-y-2">
              <Label htmlFor="switch-reason">Reason (optional)</Label>
              <Textarea
                id="switch-reason"
                value={reason}
                maxLength={500}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Rolling out Monnify"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="switch-code">Confirmation code</Label>
              <Input
                id="switch-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            {!request ? (
              <Button
                onClick={submitRequest}
                disabled={requestChange.isPending}
              >
                {requestChange.isPending ? "Sending…" : "Send code"}
              </Button>
            ) : (
              <Button
                onClick={submitCode}
                disabled={code.length !== 6 || confirmChange.isPending}
              >
                {confirmChange.isPending ? "Confirming…" : "Confirm switch"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
