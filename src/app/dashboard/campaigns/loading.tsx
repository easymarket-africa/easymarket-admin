import { TableSkeleton } from "@/components/loading-states";

export default function CampaignsLoading() {
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

      <div className="rounded-lg border">
        <div className="p-6">
          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
