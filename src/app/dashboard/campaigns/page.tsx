"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Megaphone, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Pagination } from "@/components/ui/pagination";
import { UserMultiSelect } from "@/components/user-multi-select";
import {
  useCampaigns,
  useCancelCampaign,
  useCampaignTriggers,
  useCreateCampaign,
  useUpdateCampaignTrigger,
} from "@/hooks/use-campaigns";
import {
  AdminUserListItem,
  CampaignAudienceType,
  CampaignDelayUnit,
  CampaignDeliveryType,
  CampaignStatus,
  CampaignTrigger,
} from "@/types/api";

const STATUS_BADGE: Record<
  CampaignStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  queued: "secondary",
  sending: "default",
  completed: "secondary",
  failed: "destructive",
  cancelled: "destructive",
};

export default function CampaignsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Send push notifications and manage automated triggers
          </p>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
          <TabsTrigger value="triggers">Automated Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <CampaignHistory />
        </TabsContent>

        <TabsContent value="triggers" className="mt-4">
          <TriggersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CampaignHistory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useCampaigns({
    page,
    limit,
  });
  const cancelCampaign = useCancelCampaign();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaigns</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <CreateCampaignDialog onDone={() => setCreateOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : isError ? (
          <ErrorDisplay error={error} onRetry={() => refetch()} />
        ) : !data || data.campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No campaigns yet</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent / Delivered / Failed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.title}
                    </TableCell>
                    <TableCell className="capitalize">
                      {campaign.audienceType.replace("_", " ")}
                      {campaign.audienceType === "specific_users" &&
                        campaign.audienceUserIds &&
                        ` (${campaign.audienceUserIds.length})`}
                    </TableCell>
                    <TableCell className="capitalize">
                      {campaign.deliveryType}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {campaign.totalRecipients === 0
                        ? "—"
                        : `${campaign.totalSent} / ${campaign.totalDelivered} / ${campaign.totalFailed} of ${campaign.totalRecipients}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(campaign.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {(campaign.status === "draft" ||
                        campaign.status === "queued") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancelCampaign.isPending}
                          onClick={() => cancelCampaign.mutate(campaign.id)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(data.total / data.limit))}
                pageSize={limit}
                totalItems={data.total}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setLimit(size);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CreateCampaignDialog({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] =
    useState<CampaignAudienceType>("all_users");
  const [selectedUsers, setSelectedUsers] = useState<AdminUserListItem[]>([]);
  const [deliveryType, setDeliveryType] =
    useState<CampaignDeliveryType>("now");
  const [scheduledAt, setScheduledAt] = useState("");

  const createCampaign = useCreateCampaign();

  const resetForm = () => {
    setTitle("");
    setBody("");
    setAudienceType("all_users");
    setSelectedUsers([]);
    setDeliveryType("now");
    setScheduledAt("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    if (audienceType === "specific_users" && selectedUsers.length === 0) {
      toast.error("Select at least one customer");
      return;
    }

    if (deliveryType === "scheduled" && !scheduledAt) {
      toast.error("Pick a date and time to schedule this campaign");
      return;
    }

    createCampaign.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        audienceType,
        audienceUserIds:
          audienceType === "specific_users"
            ? selectedUsers.map((u) => u.id)
            : undefined,
        deliveryType,
        scheduledAt:
          deliveryType === "scheduled"
            ? new Date(scheduledAt).toISOString()
            : undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onDone();
        },
      }
    );
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>New Campaign</DialogTitle>
        <DialogDescription>
          Send a push notification to all customers or a specific group.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-title">Title</Label>
          <Input
            id="campaign-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekend Flash Sale"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-body">Message</Label>
          <Textarea
            id="campaign-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Get 20% off all groceries this weekend only!"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Audience</Label>
          <Select
            value={audienceType}
            onValueChange={(v) => setAudienceType(v as CampaignAudienceType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_users">All Users</SelectItem>
              <SelectItem value="specific_users">Specific Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {audienceType === "specific_users" && (
          <div className="space-y-2">
            <Label>Customers</Label>
            <UserMultiSelect
              selectedUsers={selectedUsers}
              onChange={setSelectedUsers}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Delivery</Label>
          <Select
            value={deliveryType}
            onValueChange={(v) => setDeliveryType(v as CampaignDeliveryType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Send Now</SelectItem>
              <SelectItem value="scheduled">Schedule for Later</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {deliveryType === "scheduled" && (
          <div className="space-y-2">
            <Label htmlFor="campaign-scheduled-at">Date &amp; time</Label>
            <Input
              id="campaign-scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={createCampaign.isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          {deliveryType === "now"
            ? createCampaign.isPending
              ? "Sending..."
              : "Send Now"
            : createCampaign.isPending
              ? "Scheduling..."
              : "Schedule Campaign"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

const DELAY_UNIT_OPTIONS: CampaignDelayUnit[] = ["hours", "days"];

function TriggersTab() {
  const { data: triggers, isLoading, isError, error, refetch } =
    useCampaignTriggers();

  if (isLoading) return <TableSkeleton columns={3} />;
  if (isError) return <ErrorDisplay error={error} onRetry={() => refetch()} />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(triggers ?? []).map((trigger) => (
        <TriggerCard key={trigger.id} trigger={trigger} />
      ))}
    </div>
  );
}

function TriggerCard({ trigger }: { trigger: CampaignTrigger }) {
  const [enabled, setEnabled] = useState(trigger.enabled);
  const [delayValue, setDelayValue] = useState(trigger.delayValue);
  const [delayUnit, setDelayUnit] = useState<CampaignDelayUnit>(
    trigger.delayUnit
  );
  const [titleTemplate, setTitleTemplate] = useState(trigger.titleTemplate);
  const [bodyTemplate, setBodyTemplate] = useState(trigger.bodyTemplate);

  const updateTrigger = useUpdateCampaignTrigger();

  const label =
    trigger.type === "abandoned_cart" ? "Abandoned Cart Reminder" : "Inactive User Check-in";

  const handleSave = () => {
    updateTrigger.mutate({
      id: trigger.id,
      data: { enabled, delayValue, delayUnit, titleTemplate, bodyTemplate },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{label}</CardTitle>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label>Wait before sending</Label>
            <Input
              type="number"
              min={1}
              value={delayValue}
              onChange={(e) => setDelayValue(Number(e.target.value))}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Unit</Label>
            <Select
              value={delayUnit}
              onValueChange={(v) => setDelayUnit(v as CampaignDelayUnit)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_UNIT_OPTIONS.map((unit) => (
                  <SelectItem key={unit} value={unit} className="capitalize">
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notification title</Label>
          <Input
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Notification message</Label>
          <Textarea
            rows={2}
            value={bodyTemplate}
            onChange={(e) => setBodyTemplate(e.target.value)}
          />
        </div>

        {trigger.lastRunAt && (
          <p className="text-xs text-muted-foreground">
            Last checked: {new Date(trigger.lastRunAt).toLocaleString()}
          </p>
        )}

        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateTrigger.isPending}
        >
          {updateTrigger.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
