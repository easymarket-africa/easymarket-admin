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
import { VendorDetails } from "@/types/api";

interface ConfirmOrderVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  vendors: VendorDetails[];
  selectedVendorId: number | null;
  onVendorChange: (vendorId: number | null) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmOrderVendorDialog({
  open,
  onOpenChange,
  orderNumber,
  vendors,
  selectedVendorId,
  onVendorChange,
  onConfirm,
  isPending = false,
}: ConfirmOrderVendorDialogProps) {
  const activeVendors = vendors.filter((vendor) => vendor.isActive);

  const handleConfirm = () => {
    if (!selectedVendorId) {
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Order & Select Pickup Vendor</DialogTitle>
          <DialogDescription>
            To confirm order {orderNumber}, you must select which vendor this
            order will be picked up from.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pick the vendor closest to the customer&apos;s delivery
              address. This vendor&apos;s address and phone number are sent
              to the delivery partner as the pickup point.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="vendor-select">Select Pickup Vendor *</Label>
            <Select
              value={selectedVendorId?.toString() || ""}
              onValueChange={(value) =>
                onVendorChange(value ? parseInt(value) : null)
              }
              disabled={isPending}
            >
              <SelectTrigger id="vendor-select">
                <SelectValue placeholder="Choose a vendor..." />
              </SelectTrigger>
              <SelectContent>
                {activeVendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.businessName}
                    {vendor.address && ` — ${vendor.address}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeVendors.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No active vendors found. Add one under Vendors first.
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
                !selectedVendorId || isPending || activeVendors.length === 0
              }
            >
              {isPending ? "Confirming..." : "Confirm Order & Select Vendor"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
