import { apiClient } from "@/lib/api-client";
import {
  AgentDetails,
  AgentFilters,
  AgentMetrics,
  PaginatedResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
} from "@/types/api";

/**
 * Agents Service
 * Handles all agent-related API calls
 * Following Single Responsibility Principle
 */
export class AgentsService {
  private readonly basePath = "/admin/agents";

  /**
   * Get all agents with filtering and pagination
   */
  async getAgents(
    filters: AgentFilters = {}
  ): Promise<PaginatedResponse<AgentDetails>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return apiClient.get<PaginatedResponse<AgentDetails>>(url);
  }

  /**
   * Get agent details by ID
   */
  async getAgentById(id: number): Promise<AgentDetails> {
    return apiClient.get<AgentDetails>(`${this.basePath}/${id}`);
  }

  /**
   * Get agent metrics
   */
  async getAgentMetrics(): Promise<AgentMetrics> {
    return apiClient.get<AgentMetrics>(`${this.basePath}/metrics`);
  }

  /**
   * Create new agent
   */
  async createAgent(data: CreateAgentRequest): Promise<AgentDetails> {
    return apiClient.post<AgentDetails>(this.basePath, data);
  }

  /**
   * Update existing agent
   */
  async updateAgent(
    id: number,
    data: UpdateAgentRequest
  ): Promise<AgentDetails> {
    return apiClient.put<AgentDetails>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`);
  }

  /**
   * Get agent's order history
   */
  async getAgentOrders(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/orders`);
  }

  /**
   * Suspend agent
   */
  async suspendAgent(id: number, reason: string): Promise<AgentDetails> {
    return apiClient.post<AgentDetails>(`${this.basePath}/${id}/suspend`, {
      reason,
    });
  }

  /**
   * Activate agent
   */
  async activateAgent(id: number): Promise<AgentDetails> {
    return apiClient.post<AgentDetails>(`${this.basePath}/${id}/activate`);
  }

  /**
   * Update agent rating
   */
  async updateAgentRating(id: number, rating: number): Promise<AgentDetails> {
    return apiClient.put<AgentDetails>(`${this.basePath}/${id}/rating`, {
      rating,
    });
  }
}

// Export singleton instance
export const agentsService = new AgentsService();
