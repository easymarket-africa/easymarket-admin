import { apiClient } from "@/lib/api-client";
import {
  Order,
  OrderFilters,
  PaginatedResponse,
  OrdersResponse,
  UpdateOrderStatusRequest,
  AssignAgentRequest,
  CancelOrderRequest,
  AgentDetails,
} from "@/types/api";

/**
 * Orders Service
 * Handles all order-related API calls
 * Following Single Responsibility Principle
 */
export class OrdersService {
  private readonly basePath = "/admin/orders";

  /**
   * Get all orders with filtering and pagination
   */
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return apiClient.get<OrdersResponse>(url);
  }

  /**
   * Get order details by ID
   */
  async getOrderById(id: number): Promise<Order> {
    return apiClient.get<Order>(`${this.basePath}/${id}`);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: number,
    data: UpdateOrderStatusRequest
  ): Promise<Order> {
    return apiClient.put<Order>(`${this.basePath}/${id}/status`, data);
  }

  /**
   * Assign agent to order
   */
  async assignAgent(
    id: number,
    data: AssignAgentRequest
  ): Promise<AgentDetails> {
    return apiClient.put<AgentDetails>(
      `${this.basePath}/${id}/assign-agent`,
      data
    );
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: number, data: CancelOrderRequest): Promise<Order> {
    return apiClient.post<Order>(`${this.basePath}/${id}/cancel`, data);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: number,
    data: { paymentStatus: string }
  ): Promise<Order> {
    return apiClient.put<Order>(`${this.basePath}/${id}/payment-status`, data);
  }

  /**
   * Get order history/logs
   */
  async getOrderHistory(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/history`);
  }

  /**
   * Process order refund
   */
  async processRefund(
    id: number,
    data: { reason: string; amount?: number }
  ): Promise<Order> {
    return apiClient.post<Order>(`${this.basePath}/${id}/refund`, data);
  }

  /**
   * Update delivery address
   */
  async updateDeliveryAddress(
    id: number,
    data: {
      street: string;
      city: string;
      state: string;
      country: string;
    }
  ): Promise<Order> {
    return apiClient.put<Order>(
      `${this.basePath}/${id}/delivery-address`,
      data
    );
  }

  /**
   * Update customer information
   */
  async updateCustomerInfo(
    id: number,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
    }
  ): Promise<Order> {
    return apiClient.put<Order>(`${this.basePath}/${id}/customer-info`, data);
  }
}

// Export singleton instance
export const ordersService = new OrdersService();
