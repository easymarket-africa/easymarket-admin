"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  CalendarClock,
  Copy,
  Gift,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";
import { ErrorAlert, ErrorDisplay } from "@/components/error-display";
import { Pagination } from "@/components/ui/pagination";
import {
  useCreateReferralCode,
  useReferralCodes,
  useReferralRewards,
  useReferralUsages,
  useUpdateReferralCode,
} from "@/hooks/use-referrals";
import { useAdminUsers } from "@/hooks/use-admin-users";
import {
  CreateReferralCodeRequest,
  ReferralCode,
  ReferralCodeOwnerType,
  ReferralDiscountType,
  UpdateReferralCodeRequest,
} from "@/types/api";

type ReferralCodeFormValues = {
  ownerId: string;
  code: string;
  type: ReferralCodeOwnerType;
  discountType: ReferralDiscountType;
  discountValue: string;
  maxUsage: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyFormValues: ReferralCodeFormValues = {
  ownerId: "",
  code: "",
  type: "USER",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxUsage: "",
  expiresAt: "",
  isActive: true,
};

function getCodeStatusBadge(isActive: boolean, expiresAt?: string | null) {
  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
  if (!isActive) {
    return <span className="text-xs text-red-600">Inactive</span>;
  }
  if (isExpired) {
    return <span className="text-xs text-amber-600">Expired</span>;
  }
  return <span className="text-xs text-green-600">Active</span>;
}

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const [codeSearch, setCodeSearch] = useState("");
  const [codeStatus, setCodeStatus] = useState<"active" | "inactive" | "all">("all");
  const [codeType, setCodeType] = useState<ReferralCodeOwnerType | "all">("all");
  const [codesPage, setCodesPage] = useState(1);
  const [codesLimit, setCodesLimit] = useState(10);

  const [usageCodeFilter, setUsageCodeFilter] = useState("");
  const [usageUserIdFilter, setUsageUserIdFilter] = useState("");
  const [usageStartDate, setUsageStartDate] = useState("");
  const [usageEndDate, setUsageEndDate] = useState("");
  const [usagesPage, setUsagesPage] = useState(1);
  const [usagesLimit, setUsagesLimit] = useState(10);

  const [rewardSearch, setRewardSearch] = useState("");
  const [rewardsPage, setRewardsPage] = useState(1);
  const [rewardsLimit, setRewardsLimit] = useState(10);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ReferralCode | null>(null);
  const [formValues, setFormValues] =
    useState<ReferralCodeFormValues>(emptyFormValues);

  const codesFilters = {
    page: codesPage,
    limit: codesLimit,
    search: codeSearch || undefined,
    status: codeStatus === "all" ? undefined : codeStatus,
    type: codeType === "all" ? undefined : codeType,
  };

  const usageFilters = {
    page: usagesPage,
    limit: usagesLimit,
    code: usageCodeFilter || undefined,
    userId: usageUserIdFilter ? Number(usageUserIdFilter) : undefined,
    startDate: usageStartDate || undefined,
    endDate: usageEndDate || undefined,
  };

  const rewardFilters = {
    page: rewardsPage,
    limit: rewardsLimit,
    search: rewardSearch || undefined,
  };

  const {
    data: codesData,
    isLoading: isCodesLoading,
    error: codesError,
    refetch: refetchCodes,
  } = useReferralCodes(codesFilters);
  const {
    data: usagesData,
    isLoading: isUsagesLoading,
    error: usagesError,
    refetch: refetchUsages,
  } = useReferralUsages(usageFilters);
  const {
    data: rewardsData,
    isLoading: isRewardsLoading,
    error: rewardsError,
    refetch: refetchRewards,
  } = useReferralRewards(rewardFilters);

  // Lightweight overview queries for cards/charts.
  const { data: overviewCodes, isLoading: isOverviewCodesLoading } = useReferralCodes({
    page: 1,
    limit: 200,
  });
  const { data: overviewUsages, isLoading: isOverviewUsagesLoading } =
    useReferralUsages({
      page: 1,
      limit: 200,
    });
  const { data: overviewRewards, isLoading: isOverviewRewardsLoading } =
    useReferralRewards({
      page: 1,
      limit: 200,
    });

  const createMutation = useCreateReferralCode();
  const updateMutation = useUpdateReferralCode();

  const { data: adminUsersData, isLoading: isAdminUsersLoading } = useAdminUsers(
    { page: 1, limit: 200 },
    { enabled: isCreateDialogOpen }
  );

  const codeRows = codesData?.data || [];
  const usageRows = usagesData?.data || [];
  const rewardRows = rewardsData?.data || [];

  const totalRewardsGenerated = useMemo(() => {
    const rewards = overviewRewards?.data || [];
    return rewards.reduce((sum, item) => sum + Number(item.totalEarned || 0), 0);
  }, [overviewRewards]);

  const usageChartData = useMemo(() => {
    const grouped = new Map<string, number>();
    (overviewUsages?.data || []).forEach((usage) => {
      const key = format(new Date(usage.createdAt), "MMM d");
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([date, count]) => ({
      date,
      usageCount: count,
    }));
  }, [overviewUsages]);

  const topCodes = useMemo(() => {
    return [...(overviewCodes?.data || [])]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }, [overviewCodes]);

  const ownerOptions = useMemo(() => {
    const ownersMap = new Map<number, string>();
    (adminUsersData?.users ?? []).forEach((u) => {
      ownersMap.set(u.id, `${u.fullName} (${u.email})`);
    });
    (overviewCodes?.data || []).forEach((code) => {
      if (code.ownerId && !ownersMap.has(code.ownerId)) {
        ownersMap.set(code.ownerId, code.ownerName || `User ${code.ownerId}`);
      }
    });
    (overviewRewards?.data || []).forEach((reward) => {
      if (reward.userId && !ownersMap.has(reward.userId)) {
        ownersMap.set(reward.userId, reward.userName || `User ${reward.userId}`);
      }
    });
    return Array.from(ownersMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.id - b.id);
  }, [adminUsersData, overviewCodes, overviewRewards]);

  const ownerSelectValue = useMemo(() => {
    if (!formValues.ownerId.trim()) return undefined;
    const numeric = Number(formValues.ownerId);
    if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
    return ownerOptions.some((o) => o.id === numeric)
      ? String(numeric)
      : undefined;
  }, [formValues.ownerId, ownerOptions]);

  const resetForm = () => {
    setFormValues(emptyFormValues);
    setEditingCode(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormValues((prev) => ({
      ...prev,
      code: `REF${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    }));
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (code: ReferralCode) => {
    setEditingCode(code);
    setFormValues({
      ownerId: String(code.ownerId || ""),
      code: code.code,
      type: code.type,
      discountType: code.discountType,
      discountValue: String(code.discountValue || ""),
      maxUsage:
        code.maxUsage === null || code.maxUsage === undefined
          ? ""
          : String(code.maxUsage),
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : "",
      isActive: code.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code} to clipboard`);
    } catch {
      toast.error("Failed to copy referral code");
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.ownerId || !formValues.code || !formValues.discountValue) {
      toast.error("Owner, code and discount value are required");
      return;
    }

    try {
      if (editingCode) {
        const payload: UpdateReferralCodeRequest = {
          isActive: formValues.isActive,
          discountType: formValues.discountType,
          discountValue: Number(formValues.discountValue),
          maxUsage: formValues.maxUsage ? Number(formValues.maxUsage) : undefined,
          expiresAt: formValues.expiresAt
            ? new Date(formValues.expiresAt).toISOString()
            : undefined,
        };
        await updateMutation.mutateAsync({ id: editingCode.id, data: payload });
      } else {
        const payload: CreateReferralCodeRequest = {
          ownerId: Number(formValues.ownerId),
          code: formValues.code.trim().toUpperCase(),
          type: formValues.type,
          discountType: formValues.discountType,
          discountValue: Number(formValues.discountValue),
          maxUsage: formValues.maxUsage ? Number(formValues.maxUsage) : undefined,
          expiresAt: formValues.expiresAt
            ? new Date(formValues.expiresAt).toISOString()
            : undefined,
          isActive: formValues.isActive,
        };
        await createMutation.mutateAsync(payload);
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch {
      // handled by hooks
    }
  };

  const handleToggleStatus = async (code: ReferralCode) => {
    await updateMutation.mutateAsync({
      id: code.id,
      data: { isActive: !code.isActive },
    });
  };

  if (codesError && activeTab === "codes") {
    return (
      <ErrorDisplay
        error={codesError}
        onRetry={() => refetchCodes()}
        title="Failed to load referral codes"
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground">
            Manage referral campaigns, usage, and rewards from one place.
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Referral Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Edit Referral Code" : "Create Referral Code"}
              </DialogTitle>
              <DialogDescription>
                Configure owner, discount model, usage limits and status.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="owner-id-manual">Owner</Label>
                  <Select
                    value={ownerSelectValue}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({ ...prev, ownerId: value }))
                    }
                  >
                    <SelectTrigger id="owner-select" className="w-full min-w-0">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map((owner) => (
                        <SelectItem key={owner.id} value={String(owner.id)}>
                          {owner.name} (#{owner.id})
                        </SelectItem>
                      ))}
                      {ownerOptions.length === 0 && !isAdminUsersLoading ? (
                        <SelectItem value="__no_users__" disabled>
                          No users in list — type ID below
                        </SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  {isAdminUsersLoading ? (
                    <p className="text-muted-foreground text-xs">
                      Loading users…
                    </p>
                  ) : null}
                  <Input
                    id="owner-id-manual"
                    placeholder="Or enter owner ID manually"
                    value={formValues.ownerId}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        ownerId: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Referral Code</Label>
                  <Input
                    id="code"
                    value={formValues.code}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="REFCODE123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formValues.type}
                    onValueChange={(value: ReferralCodeOwnerType) =>
                      setFormValues((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="INFLUENCER">INFLUENCER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formValues.discountType}
                    onValueChange={(value: ReferralDiscountType) =>
                      setFormValues((prev) => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">PERCENTAGE</SelectItem>
                      <SelectItem value="FIXED">FIXED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.discountValue}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        discountValue: e.target.value,
                      }))
                    }
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsage">Max Usage</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    min="0"
                    value={formValues.maxUsage}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        maxUsage: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiry Date</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formValues.expiresAt}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formValues.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({
                        ...prev,
                        isActive: value === "active",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingCode
                    ? "Update Code"
                    : "Create Code"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="codes">Codes</TabsTrigger>
          <TabsTrigger value="usages">Usages</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {isOverviewCodesLoading || isOverviewUsagesLoading || isOverviewRewardsLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Referral Codes
                    </CardTitle>
                    <Gift className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewCodes?.total || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Usage Count
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewUsages?.total || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Rewards Generated
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₦{totalRewardsGenerated.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Referral Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {usageChartData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No usage data available yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={usageChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usageCount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Referral Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {topCodes.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No referral codes yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topCodes.map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{code.code}</p>
                          <p className="text-xs text-muted-foreground">
                            Owner #{code.ownerId} • {code.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{code.usageCount}</p>
                          <p className="text-xs text-muted-foreground">uses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          {codesError && <ErrorAlert error={codesError} onRetry={() => refetchCodes()} />}
          <Card>
            <CardHeader>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code or owner..."
                    value={codeSearch}
                    onChange={(e) => {
                      setCodesPage(1);
                      setCodeSearch(e.target.value);
                    }}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={codeStatus}
                  onValueChange={(value: "active" | "inactive" | "all") => {
                    setCodesPage(1);
                    setCodeStatus(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={codeType}
                  onValueChange={(value: ReferralCodeOwnerType | "all") => {
                    setCodesPage(1);
                    setCodeType(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INFLUENCER">INFLUENCER</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isCodesLoading ? (
                <TableSkeleton rows={6} columns={8} />
              ) : codeRows.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  No referral codes yet.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codeRows.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {code.code}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleCopyCode(code.code)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {code.ownerName || `User #${code.ownerId}`}
                          </TableCell>
                          <TableCell>{code.type}</TableCell>
                          <TableCell>
                            {code.discountType === "PERCENTAGE"
                              ? `${code.discountValue}%`
                              : `₦${code.discountValue}`}
                          </TableCell>
                          <TableCell>
                            {code.usageCount}
                            {code.maxUsage ? ` / ${code.maxUsage}` : ""}
                          </TableCell>
                          <TableCell>{getCodeStatusBadge(code.isActive, code.expiresAt)}</TableCell>
                          <TableCell>
                            {code.expiresAt
                              ? format(new Date(code.expiresAt), "MMM d, yyyy")
                              : "No expiry"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(code)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(code)}
                                disabled={updateMutation.isPending}
                              >
                                {code.isActive ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    currentPage={codesPage}
                    totalPages={codesData?.totalPages || 1}
                    pageSize={codesLimit}
                    totalItems={codesData?.total || 0}
                    onPageChange={setCodesPage}
                    onPageSizeChange={(size) => {
                      setCodesPage(1);
                      setCodesLimit(size);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usages" className="space-y-4">
          {usagesError && <ErrorAlert error={usagesError} onRetry={() => refetchUsages()} />}
          <Card>
            <CardHeader>
              <div className="grid gap-3 md:grid-cols-5">
                <Input
                  placeholder="Referral code"
                  value={usageCodeFilter}
                  onChange={(e) => {
                    setUsagesPage(1);
                    setUsageCodeFilter(e.target.value.toUpperCase());
                  }}
                />
                <Input
                  placeholder="User ID"
                  value={usageUserIdFilter}
                  onChange={(e) => {
                    setUsagesPage(1);
                    setUsageUserIdFilter(e.target.value.replace(/\D/g, ""));
                  }}
                />
                <Input
                  type="date"
                  value={usageStartDate}
                  onChange={(e) => {
                    setUsagesPage(1);
                    setUsageStartDate(e.target.value);
                  }}
                />
                <Input
                  type="date"
                  value={usageEndDate}
                  onChange={(e) => {
                    setUsagesPage(1);
                    setUsageEndDate(e.target.value);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setUsageCodeFilter("");
                    setUsageUserIdFilter("");
                    setUsageStartDate("");
                    setUsageEndDate("");
                    setUsagesPage(1);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isUsagesLoading ? (
                <TableSkeleton rows={6} columns={7} />
              ) : usageRows.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  No referral usages found.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Discount Applied</TableHead>
                        <TableHead>Reward Granted</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageRows.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="font-medium">
                            {usage.referralCode || `#${usage.referralCodeId}`}
                          </TableCell>
                          <TableCell>
                            {usage.usedByUserName || `User #${usage.usedByUserId}`}
                          </TableCell>
                          <TableCell>#{usage.orderId}</TableCell>
                          <TableCell>₦{Number(usage.discountApplied).toLocaleString()}</TableCell>
                          <TableCell>
                            ₦{Number(usage.rewardGrantedToReferrer).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                              {format(new Date(usage.createdAt), "MMM d, yyyy h:mm a")}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    currentPage={usagesPage}
                    totalPages={usagesData?.totalPages || 1}
                    pageSize={usagesLimit}
                    totalItems={usagesData?.total || 0}
                    onPageChange={setUsagesPage}
                    onPageSizeChange={(size) => {
                      setUsagesPage(1);
                      setUsagesLimit(size);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          {rewardsError && (
            <ErrorAlert error={rewardsError} onRetry={() => refetchRewards()} />
          )}
          <Card>
            <CardHeader>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search by user..."
                    value={rewardSearch}
                    onChange={(e) => {
                      setRewardsPage(1);
                      setRewardSearch(e.target.value);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isRewardsLoading ? (
                <TableSkeleton rows={6} columns={6} />
              ) : rewardRows.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  No referral rewards found.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Total Earned</TableHead>
                        <TableHead>Total Redeemed</TableHead>
                        <TableHead>Current Balance</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewardRows.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell className="font-medium">
                            {reward.userName || `User #${reward.userId}`}
                          </TableCell>
                          <TableCell>₦{reward.totalEarned.toLocaleString()}</TableCell>
                          <TableCell>₦{reward.totalRedeemed.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            ₦{reward.balance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {reward.lastUpdated
                              ? format(new Date(reward.lastUpdated), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-green-600">
                              <BadgeCheck className="h-4 w-4" />
                              Active
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    currentPage={rewardsPage}
                    totalPages={rewardsData?.totalPages || 1}
                    pageSize={rewardsLimit}
                    totalItems={rewardsData?.total || 0}
                    onPageChange={setRewardsPage}
                    onPageSizeChange={(size) => {
                      setRewardsPage(1);
                      setRewardsLimit(size);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
