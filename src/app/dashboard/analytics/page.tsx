"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
} from "lucide-react";
import { useAnalyticsOverview } from "@/hooks/use-analytics";
import { StatsCardSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";

export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("last_30_days");

  // API hooks
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useAnalyticsOverview({
    timeFilter: timeFilter as
      | "last_7_days"
      | "last_30_days"
      | "last_90_days"
      | "last_year",
  });

  const analytics = analyticsData || {
    totalRevenue: {
      value: 0,
      percentageChange: 0,
      changeType: "increase" as const,
      currency: "NGN",
    },
    totalOrders: {
      value: 0,
      percentageChange: 0,
      changeType: "increase" as const,
      period: "30 days",
    },
    activeAgents: {
      value: 0,
      percentageChange: 0,
      changeType: "increase" as const,
      period: "30 days",
    },
    averageDeliveryTime: {
      value: 0,
      percentageChange: 0,
      changeType: "increase" as const,
      unit: "minutes",
      period: "30 days",
    },
    monthlyRevenue: { labels: [], data: [], currency: "NGN" },
    orderDistribution: {
      delivered: 0,
      pending: 0,
      cancelled: 0,
      inProgress: 0,
    },
    topAgents: [],
  };

  if (analyticsError) {
    return (
      <ErrorDisplay
        error={analyticsError}
        onRetry={() => refetchAnalytics()}
        title="Failed to load analytics"
        description="There was an error loading the analytics data. Please try again."
      />
    );
  }
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track performance and business insights
          </p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 days</SelectItem>
            <SelectItem value="last_30_days">Last 30 days</SelectItem>
            <SelectItem value="last_90_days">Last 90 days</SelectItem>
            <SelectItem value="last_year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{analytics.totalRevenue.value.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {analytics.totalRevenue.changeType === "increase" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  {analytics.totalRevenue.percentageChange}% from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalOrders.value}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {analytics.totalOrders.changeType === "increase" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  {analytics.totalOrders.percentageChange}% from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Agents
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.activeAgents.value}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {analytics.activeAgents.changeType === "increase" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  {analytics.activeAgents.percentageChange}% from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Delivery Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.averageDeliveryTime.value} min
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {analytics.averageDeliveryTime.changeType === "increase" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                  )}
                  {analytics.averageDeliveryTime.percentageChange}% from last
                  period
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.monthlyRevenue.data.map((value, index) => ({
                    period:
                      analytics.monthlyRevenue.labels[index] ||
                      `Month ${index + 1}`,
                    revenue: value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? `₦${value.toLocaleString()}` : value,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.orderDistribution).map(
                        ([key, value]) => ({
                          name: key.charAt(0).toUpperCase() + key.slice(1),
                          value: value,
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(analytics.orderDistribution).map(
                        (_, index) => {
                          const colors = [
                            "#0088FE",
                            "#00C49F",
                            "#FFBB28",
                            "#FF8042",
                          ];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        }
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(analytics.orderDistribution).map(
                    ([key, value], index) => {
                      const colors = [
                        "#0088FE",
                        "#00C49F",
                        "#FFBB28",
                        "#FF8042",
                      ];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: colors[index % colors.length],
                            }}
                          />
                          <span className="text-sm">
                            {key}: {value}%
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Agents</CardTitle>
          <CardDescription>
            Agents with highest order completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topAgents.map((agent, index) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.completedOrders} orders completed
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {agent.rating} ★
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
