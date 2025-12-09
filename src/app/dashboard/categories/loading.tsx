import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";

export default function CategoriesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories displayed in the mobile app
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="p-6">
          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
