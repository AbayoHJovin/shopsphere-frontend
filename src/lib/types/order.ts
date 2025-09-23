// Response types for admin orders matching AdminOrderDTO

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  RETURNED = "RETURNED",
  READY_FOR_DELIVERY = "READY_FOR_DELIVERY",
}

export enum OrderPaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface SimpleProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

export interface ProductImageDTO {
  id: string;
  imageUrl: string;
  altText?: string;
  title?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface VariantImageDTO {
  id: string;
  imageUrl: string;
  altText?: string;
  title?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface AdminOrderItemDTO {
  id: string;
  productId: string;
  variantId: string;
  product: SimpleProductDTO;
  quantity: number;
  price: number;
  totalPrice: number;
  availableStock: number;
}

export interface AdminOrderAddressDTO {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

export interface AdminPaymentInfoDTO {
  paymentMethod: string;
  paymentStatus: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  transactionRef?: string;
  paymentDate?: string;
  receiptUrl?: string;
}

export interface AdminOrderDTO {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  items: AdminOrderItemDTO[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: AdminOrderAddressDTO;
  billingAddress: AdminOrderAddressDTO;
  paymentInfo: AdminPaymentInfoDTO;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// Keep backward compatibility
export type OrderResponse = AdminOrderDTO;
export type OrderItemDTO = AdminOrderItemDTO;
export type OrderAddressDTO = AdminOrderAddressDTO;

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
  details?: string;
}

// For simple list responses
export type OrderListResponse = ApiResponse<AdminOrderDTO[]>;
export type AdminOrderListResponse = ApiResponse<AdminOrderDTO[]>;
