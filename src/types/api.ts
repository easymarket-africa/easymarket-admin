// Base API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Orders specific response (since it uses 'orders' instead of 'data')
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

// Order Types
export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface Agent {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready_for_delivery"
    | "on_the_way"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "successful";
  customer: Customer;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: string;
  deliveryFee: string;
  tax: number;
  total: string;
  assignedAgent?: Agent;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  cancellationReason?: string | null;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  agentId?: number;
  customerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
  notes?: string;
}

export interface AssignAgentRequest {
  agentId: number;
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

// Product Types
export interface Vendor {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  sku: string;
  weight: number;
  dimensions: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  vendor: Vendor;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  vendorId?: number;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalValue: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  sku: string;
  weight: number;
  dimensions: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  vendorId: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  unit?: string;
  stockQuantity?: number;
  imageUrl?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  vendorId?: number;
}

export interface BulkUploadResponse {
  successCount: number;
  errorCount: number;
  errors: string[];
  importedProductIds: number[];
}

// Agent Types
export interface AgentDetails {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: "active" | "inactive" | "suspended";
  isAvailable: boolean;
  currentOrderId?: number;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  rating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  maxOrdersPerDay: number;
  workingHours: {
    start: string;
    end: string;
  };
  serviceAreas: string[];
  createdAt: string;
  updatedAt: string;
  lastAssignedAt?: string;
  lastDeliveryCompletedAt?: string;
}

export interface AgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AgentMetrics {
  totalAgents: number;
  available: number;
  busy: number;
  offline: number;
}

export interface CreateAgentRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  maxOrdersPerDay: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  serviceAreas: string[];
  isAvailable: boolean;
}

export interface UpdateAgentRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  maxOrdersPerDay?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  serviceAreas?: string[];
  isAvailable?: boolean;
}

// Vendor Types
export interface VendorDetails {
  id: number;
  businessName: string;
  category: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  description: string;
  website: string;
  contactPersonName: string;
  registrationNumber: string;
  taxId: string;
  bankAccount: string;
  status: "active" | "pending" | "suspended";
  isActive: boolean;
  productsCount: number;
  ordersCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface VendorMetrics {
  totalVendors: number;
  active: number;
  pending: number;
  totalProducts: number;
}

export interface CreateVendorRequest {
  businessName: string;
  category: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  description: string;
  website: string;
  contactPersonName: string;
  registrationNumber: string;
  taxId: string;
  bankAccount: string;
  isActive: boolean;
}

export interface UpdateVendorRequest {
  businessName?: string;
  category?: string;
  phoneNumber?: string;
  emailAddress?: string;
  address?: string;
  description?: string;
  website?: string;
  contactPersonName?: string;
  registrationNumber?: string;
  taxId?: string;
  bankAccount?: string;
  status?: string;
  isActive?: boolean;
}

// Analytics Types
export interface MetricValue {
  value: number;
  percentageChange: number;
  changeType: "increase" | "decrease";
  period: string;
}

export interface RevenueMetric extends MetricValue {
  currency: string;
}

export interface DeliveryTimeMetric extends MetricValue {
  unit: string;
}

export interface ChartData {
  labels: string[];
  data: number[];
  currency?: string;
}

export interface OrderDistribution {
  delivered: number;
  pending: number;
  cancelled: number;
  inProgress: number;
}

export interface TopAgent {
  id: number;
  name: string;
  completedOrders: number;
  rating: number;
  totalDeliveries: number;
}

export interface AnalyticsOverview {
  totalRevenue: RevenueMetric;
  totalOrders: MetricValue;
  activeAgents: MetricValue;
  averageDeliveryTime: DeliveryTimeMetric;
  monthlyRevenue: ChartData;
  orderDistribution: OrderDistribution;
  topAgents: TopAgent[];
}

export interface AnalyticsFilters {
  timeFilter?: "last_7_days" | "last_30_days" | "last_90_days" | "last_year";
}

// Settings Types
export interface GeneralSettings {
  applicationName: string;
  companyAddress: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  logoUrl: string;
  description: string;
  website: string;
  defaultCurrency: string;
  defaultLanguage: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  agentAlerts: boolean;
  systemMaintenance: boolean;
  weeklyReports: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationEmails: string[];
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
}

export interface WhatsAppConfig {
  enabled: boolean;
  businessAccountId: string;
  accessToken: string;
  webhookUrl: string;
}

export interface PaymentGatewayConfig {
  provider: string;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface EmailServiceConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface SmsServiceConfig {
  provider: string;
  apiKey: string;
  senderId: string;
}

export interface AnalyticsConfig {
  googleAnalyticsId: string;
  facebookPixelId: string;
  enabled: boolean;
}

export interface IntegrationSettings {
  apiKey: string;
  whatsapp: WhatsAppConfig;
  paymentGateway: PaymentGatewayConfig;
  emailService: EmailServiceConfig;
  smsService: SmsServiceConfig;
  analytics: AnalyticsConfig;
}

export interface PlanFeature {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface BillingSettings {
  currentPlan: string;
  monthlyPrice: number;
  currency: string;
  nextBillingDate: string;
  paymentMethodLastFour: string;
  paymentMethodExpiryMonth: string;
  paymentMethodExpiryYear: string;
  availablePlans: PlanFeature[];
  billingAddress: string;
  taxId: string;
}

// WhatsApp Types
export interface WhatsAppGroup {
  id: number;
  name: string;
  memberCount: number;
  status: string;
  description: string;
  whatsappGroupId: string;
  isActive: boolean;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsAppGroupRequest {
  name: string;
  description: string;
  whatsappGroupId: string;
  members: string[];
}

export interface UpdateWhatsAppGroupRequest {
  name?: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  members?: string[];
}

export interface SendWhatsAppMessageRequest {
  groupId: number;
  message: string;
  orderId?: number;
  messageType?: string;
  priority?: string;
}

export interface SendWhatsAppMessageResponse {
  message: string;
  messageId: string;
}
