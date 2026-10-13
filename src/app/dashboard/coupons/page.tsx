"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Plus, Ticket, Trash2, Users as UsersIcon, Dices } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { UserSingleSelect } from "@/components/user-single-select";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useTerminateCoupon,
  useCouponRedemptions,
} from "@/hooks/use-coupons";
import {
  AdminUserListItem,
  Coupon,
  CouponAssignedUser,
  CouponStatus,
  CouponType,
  CreateCouponRequest,
} from "@/types/api";

const STATUS_BADGE: Record<
  CouponStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "outline",
  expired: "secondary",
  depleted: "destructive",
};

const TYPE_LABELS: Record<CouponType, string> = {
  percentage: "Percentage",
  fixed_amount: "Fixed Amount",
  free_delivery: "Free Delivery",
  automatic_percentage: "Automatic %",
  automatic_fixed: "Automatic Fixed",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatDate(value: string | null) {
  if (!value) return "Never expires";
  return new Date(value).toLocaleDateString();
}

export default function CouponsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [redemptionsCoupon, setRedemptionsCoupon] = useState<Coupon | null>(null);

  const { data: coupons, isLoading, error, refetch } = useCoupons(
    statusFilter === "all" ? {} : { status: statusFilter as CouponStatus }
  );
  const deleteMutation = useDeleteCoupon();
  const terminateMutation = useTerminateCoupon();

  const filtered = (coupons || []).filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetch()}
        title="Failed to load coupons"
        description="There was an error loading the coupons data. Please try again."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">
                      {coupon.code}
                    </TableCell>
                    <TableCell>{TYPE_LABELS[coupon.type]}</TableCell>
                    <TableCell>
                      {coupon.type === "percentage" ||
                      coupon.type === "automatic_percentage"
                        ? `${coupon.value}%`
                        : `₦${Number(coupon.value).toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {coupon.usesCount}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                      {coupon.maxUsesPerUser ? (
                        <div className="text-xs text-muted-foreground">
                          max {coupon.maxUsesPerUser}/customer
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {coupon.assignedUser ? (
                        <div>
                          <div className="text-sm">{coupon.assignedUser.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.assignedUser.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Any customer
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(coupon.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[coupon.status]}>
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRedemptionsCoupon(coupon)}
                          title="View redemptions"
                        >
                          <UsersIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(coupon)}
                        >
                          Edit
                        </Button>
                        {coupon.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Deactivate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate coupon?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {coupon.code} will stop working immediately. This
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    terminateMutation.mutate({ id: coupon.id })
                                  }
                                >
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently deletes {coupon.code}. This cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(coupon.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No coupons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CouponFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        coupon={editingCoupon}
      />

      {redemptionsCoupon && (
        <RedemptionsDialog
          coupon={redemptionsCoupon}
          open={!!redemptionsCoupon}
          onOpenChange={() => setRedemptionsCoupon(null)}
        />
      )}
    </div>
  );
}

function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}) {
  const isEditing = !!coupon;
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

  const [code, setCode] = useState(coupon?.code || "");
  const [type, setType] = useState<CouponType>(coupon?.type || "fixed_amount");
  const [value, setValue] = useState(coupon ? String(coupon.value) : "");
  const [minOrderAmount, setMinOrderAmount] = useState(
    coupon ? String(coupon.minOrderAmount) : ""
  );
  const [maxUses, setMaxUses] = useState(
    coupon?.maxUses != null ? String(coupon.maxUses) : ""
  );
  const [maxUsesPerUser, setMaxUsesPerUser] = useState(
    coupon?.maxUsesPerUser != null ? String(coupon.maxUsesPerUser) : ""
  );
  const [assignedUser, setAssignedUser] = useState<
    AdminUserListItem | CouponAssignedUser | null
  >(coupon?.assignedUser || null);
  const [endDate, setEndDate] = useState(
    coupon?.endDate ? coupon.endDate.slice(0, 16) : ""
  );

  // Reset local form state whenever a different coupon is opened for editing,
  // or the dialog is reopened for a fresh create.
  const [lastCouponId, setLastCouponId] = useState<number | null | undefined>(
    coupon?.id
  );
  if (open && coupon?.id !== lastCouponId) {
    setLastCouponId(coupon?.id ?? null);
    setCode(coupon?.code || "");
    setType(coupon?.type || "fixed_amount");
    setValue(coupon ? String(coupon.value) : "");
    setMinOrderAmount(coupon ? String(coupon.minOrderAmount) : "");
    setMaxUses(coupon?.maxUses != null ? String(coupon.maxUses) : "");
    setMaxUsesPerUser(
      coupon?.maxUsesPerUser != null ? String(coupon.maxUsesPerUser) : ""
    );
    setAssignedUser(coupon?.assignedUser || null);
    setEndDate(coupon?.endDate ? coupon.endDate.slice(0, 16) : "");
  }

  const handleSubmit = () => {
    if (!code.trim() || !value) return;

    const payload: CreateCouponRequest = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value),
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
      maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
      maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser, 10) : undefined,
      assignedUserId: assignedUser ? assignedUser.id : null,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    };

    if (isEditing && coupon) {
      updateMutation.mutate(
        { id: coupon.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Coupon" : "New Coupon"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Editing ${coupon?.code}`
              : "Create a new discount code for customers"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Code</Label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER2026"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCode(generateCode())}
                title="Generate a random code"
              >
                <Dices className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CouponType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="free_delivery">Free Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {type === "percentage" ? "Discount %" : "Discount Amount (₦)"}
              </Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Order Amount (₦)</Label>
              <Input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry (optional)</Label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Usage Limit</Label>
              <Input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Uses Per Customer</Label>
              <Input
                type="number"
                min="1"
                value={maxUsesPerUser}
                onChange={(e) => setMaxUsesPerUser(e.target.value)}
                placeholder="1 for single-use"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Restrict to a Specific Customer (optional)</Label>
            <UserSingleSelect
              selectedUser={assignedUser}
              onChange={setAssignedUser}
              placeholder="Any customer can use this code"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !code.trim() || !value}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RedemptionsDialog({
  coupon,
  open,
  onOpenChange,
}: {
  coupon: Coupon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: redemptions, isLoading } = useCouponRedemptions(coupon.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Redemptions — {coupon.code}</DialogTitle>
          <DialogDescription>
            Customers who have used this coupon
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : redemptions && redemptions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {redemptions.map((r) => (
              <div
                key={r.orderId}
                className="flex justify-between items-center border-b border-border pb-2 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{r.userName}</p>
                  <p className="text-xs text-muted-foreground">{r.userEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    Order {r.orderNumber} · {new Date(r.usedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  -₦{r.discountApplied.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This coupon hasn&apos;t been used yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
