"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AgentDetails } from "@/types/api";

interface ConfirmOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  agents: AgentDetails[];
  selectedAgentId: number | null;
  onAgentChange: (agentId: number | null) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  agents,
  selectedAgentId,
  onAgentChange,
  onConfirm,
  isPending = false,
}: ConfirmOrderDialogProps) {
  const availableAgents = agents.filter((agent) => agent.isAvailable);

  const handleConfirm = () => {
    if (!selectedAgentId) {
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Order & Assign Agent</DialogTitle>
          <DialogDescription>
            To confirm order {orderNumber}, you must assign a delivery agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              An agent must be assigned before an order can be confirmed. This
              ensures proper delivery tracking and customer communication.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="agent-select">Select Delivery Agent *</Label>
            <Select
              value={selectedAgentId?.toString() || ""}
              onValueChange={(value) =>
                onAgentChange(value ? parseInt(value) : null)
              }
              disabled={isPending}
            >
              <SelectTrigger id="agent-select">
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.length === 0 ? (
                  <SelectItem value="" disabled>
                    No available agents
                  </SelectItem>
                ) : (
                  availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.fullName}{" "}
                      {agent.phoneNumber && `(${agent.phoneNumber})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {availableAgents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No agents are currently available. Please add agents or wait for
                agents to become available.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                !selectedAgentId || isPending || availableAgents.length === 0
              }
            >
              {isPending ? "Confirming..." : "Confirm Order & Assign Agent"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
