// Base API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  color?: string;
  icon?: string;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

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

// Agents specific response (since it uses 'agents' instead of 'data')
export interface AgentsResponse {
  agents: AgentDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Available agents response (different format from management endpoint)
export interface AvailableAgentsResponse {
  agents: AgentDetails[];
  totalAvailable: number;
}

// Products specific response (since it uses 'products' instead of 'data')
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Vendors specific response (since it uses 'vendors' instead of 'data')
export interface VendorsResponse {
  vendors: VendorDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  requiresVerification?: boolean;
}

export interface ApiErrorResponse {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface ExtendedError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface Admin {
  id: number;
  email: string;
  fullName: string;
  role: "admin" | "super_admin";
  status: "active" | "inactive" | "suspended";
  isEmailVerified: boolean;
  lastLoginAt: string;
}

export interface SessionInfo {
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SessionResponse {
  admin: Admin;
  session: SessionInfo;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  message: string;
  admin: Admin;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

// Legacy support - keeping for backward compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
    | "out_for_delivery"
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
  [key: string]: unknown;
}

export interface UpdateOrderStatusRequest {
  status: string;
  notes?: string;
}

export interface AssignAgentRequest {
  agentId: number;
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
  price: string;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  sku: string;
  weight: number | null;
  dimensions: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  vendor?: Vendor;
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
  [key: string]: unknown;
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
  vendorId?: number | null;
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
  rating: string;
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
  [key: string]: unknown;
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
  maxOrdersPerDay?: number;
  workingHours?: {
    start: string;
    end: string;
  };
  serviceAreas?: string[];
}

export interface UpdateAgentRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
}

export interface RevenueTrends {
  labels: string[];
  data: number[];
  currency: string;
  period: string;
}

export interface OrderTrends {
  labels: string[];
  data: number[];
  period: string;
}

export interface AgentPerformance {
  agentId: number;
  agentName: string;
  completedOrders: number;
  averageRating: number;
  totalRevenue: number;
  period: string;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  period: string;
}

export interface OrderHistoryEntry {
  id: number;
  orderId: number;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ProductHistoryEntry {
  id: number;
  productId: number;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: string;
  retentionDays: number;
  lastBackupAt?: string;
  nextBackupAt?: string;
}

export interface SystemLog {
  id: number;
  level: string;
  message: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, unknown>;
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

export interface WhatsAppMessage {
  id: string;
  groupId: number;
  message: string;
  messageType: string;
  priority: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageStatus {
  messageId: string;
  status: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
}
