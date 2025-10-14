"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Phone, Edit, Trash2 } from "lucide-react";
import {
  useAgents,
  useAgentMetrics,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
} from "@/hooks/use-agents";
import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";
import { ErrorDisplay, ErrorAlert } from "@/components/error-display";
import {
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentDetails,
} from "@/types/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "suspended":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getAvailabilityColor = (isAvailable: boolean) => {
  return isAvailable
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
};

const formatRating = (rating: string | number): string => {
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
};

export default function AgentsPageIntegrated() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentDetails | null>(null);

  // API hooks
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
    refetch: refetchAgents,
  } = useAgents({
    search: searchTerm || undefined,
  });

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useAgentMetrics();

  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();

  const agents = agentsData?.agents || [];
  const metrics = metricsData || {
    totalAgents: 0,
    available: 0,
    busy: 0,
    offline: 0,
  };

  const handleCreateAgent = async (formData: CreateAgentRequest) => {
    try {
      await createAgentMutation.mutateAsync(formData);
      setIsAddModalOpen(false);
    } catch (error: unknown) {
      // Error is handled by the mutation hook, but we can also handle it here as backup
      console.error("Agent creation error in handler:", error);
      const errorMessage =
        (error as Error)?.message ||
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to create agent";
      toast.error(errorMessage);
    }
  };

  const handleUpdateAgent = async (
    id: number,
    formData: UpdateAgentRequest
  ) => {
    try {
      await updateAgentMutation.mutateAsync({ id, data: formData });
      setEditingAgent(null);
    } catch (error: unknown) {
      // Error is handled by the mutation hook, but we can also handle it here as backup
      console.error("Agent update error in handler:", error);
      const errorMessage =
        (error as Error)?.message ||
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Failed to update agent";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAgent = async (id: number) => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Are you sure you want to delete this agent?")
    ) {
      try {
        await deleteAgentMutation.mutateAsync(id);
      } catch (error: unknown) {
        // Error is handled by the mutation hook, but we can also handle it here as backup
        console.error("Agent deletion error in handler:", error);
        const errorMessage =
          (error as Error)?.message ||
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Failed to delete agent";
        toast.error(errorMessage);
      }
    }
  };

  // Show toast notifications for data fetching errors
  useEffect(() => {
    if (agentsError) {
      const errorMessage = agentsError?.message || "Failed to load agents";
      toast.error(errorMessage);
    }
  }, [agentsError]);

  useEffect(() => {
    if (metricsError) {
      const errorMessage =
        metricsError?.message || "Failed to load agent metrics";
      toast.error(errorMessage);
    }
  }, [metricsError]);

  // Global error handler for unexpected errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      toast.error("An unexpected error occurred. Please try again.");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      toast.error("An unexpected error occurred. Please try again.");
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  // Test function to verify toast is working
  const testToast = () => {
    toast.error("Test error message");
    toast.success("Test success message");
  };

  if (agentsError) {
    return (
      <ErrorDisplay
        error={agentsError}
        onRetry={() => refetchAgents()}
        title="Failed to load agents"
        description="There was an error loading the agents data. Please try again."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage delivery agents and their assignments
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Create a new delivery agent account
              </DialogDescription>
            </DialogHeader>
            <AgentForm
              onSubmit={(data) => handleCreateAgent(data as CreateAgentRequest)}
              isLoading={createAgentMutation.isPending}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={testToast}>
          Test Toast
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : metricsError ? (
          <div className="col-span-4">
            <ErrorAlert error={metricsError} />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAgents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.available}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Busy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.busy}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {metrics.offline}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {agent.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{agent.phoneNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getAvailabilityColor(agent.isAvailable)}
                      >
                        {agent.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          {formatRating(agent.rating)}
                        </span>
                        <span className="text-yellow-400 ml-1">★</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            typeof window !== "undefined" &&
                            window.open(`tel:${agent.phoneNumber}`)
                          }
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAgent(agent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
                          onClick={() => handleDeleteAgent(agent.id)}
                          disabled={deleteAgentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      {editingAgent && (
        <Dialog
          open={!!editingAgent}
          onOpenChange={() => setEditingAgent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>Update agent information</DialogDescription>
            </DialogHeader>
            <AgentForm
              initialData={editingAgent}
              onSubmit={(data) => handleUpdateAgent(editingAgent.id, data)}
              isLoading={updateAgentMutation.isPending}
              onCancel={() => setEditingAgent(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Agent Form Component
interface AgentFormProps {
  initialData?: AgentDetails;
  onSubmit: (data: CreateAgentRequest | UpdateAgentRequest) => void;
  isLoading: boolean;
  onCancel: () => void;
}

function AgentForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: AgentFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    maxOrdersPerDay: initialData?.maxOrdersPerDay || 10,
    workingHoursStart: initialData?.workingHours?.start || "08:00",
    workingHoursEnd: initialData?.workingHours?.end || "18:00",
    serviceAreas: initialData?.serviceAreas?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation - only required fields
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Build payload with only provided fields
    const submitData: CreateAgentRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    };

    // Add optional fields only if they have values
    if (formData.maxOrdersPerDay > 0) {
      submitData.maxOrdersPerDay = formData.maxOrdersPerDay;
    }
    if (formData.workingHoursStart && formData.workingHoursEnd) {
      submitData.workingHours = {
        start: formData.workingHoursStart,
        end: formData.workingHoursEnd,
      };
    }
    if (formData.serviceAreas.trim()) {
      submitData.serviceAreas = formData.serviceAreas
        .split(",")
        .map((area: string) => area.trim())
        .filter(Boolean);
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxOrdersPerDay">Max Orders Per Day</Label>
        <Input
          id="maxOrdersPerDay"
          type="number"
          min="1"
          max="50"
          value={formData.maxOrdersPerDay}
          onChange={(e) =>
            setFormData({
              ...formData,
              maxOrdersPerDay: parseInt(e.target.value) || 0,
            })
          }
          placeholder="e.g., 15"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workingHoursStart">Working Hours Start</Label>
          <Input
            id="workingHoursStart"
            type="time"
            value={formData.workingHoursStart}
            onChange={(e) =>
              setFormData({ ...formData, workingHoursStart: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workingHoursEnd">Working Hours End</Label>
          <Input
            id="workingHoursEnd"
            type="time"
            value={formData.workingHoursEnd}
            onChange={(e) =>
              setFormData({ ...formData, workingHoursEnd: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceAreas">Service Areas (comma-separated)</Label>
        <Input
          id="serviceAreas"
          value={formData.serviceAreas}
          onChange={(e) =>
            setFormData({ ...formData, serviceAreas: e.target.value })
          }
          placeholder="Lagos, Victoria Island, Ikoyi"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Agent" : "Add Agent"}
        </Button>
      </div>
    </form>
  );
}
