// Response types for orders
import { UUID } from "crypto";

export enum OrderStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  SHIPPED = "Shipped",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
  FAILED = "Failed"
}

export enum OrderPaymentStatus {
  PENDING = "Pending",
  PAID = "Paid",
  FAILED = "Failed",
  REFUNDED = "Refunded"
}

export interface UserSummaryResponse {
  userId: string;
  username: string;
  email: string;
  role: string;
  profilePictureUrl: string;
}

export interface OrderItemResponse {
  orderItemId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderTransactionResponse {
  transactionId: string;
  transactionReference: string;
  transactionDate: string;
  paymentMethod: string;
  amount: number;
}

export interface OrderResponse {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  orderDate: string;
  updatedAt: string;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  isQrScanned: boolean;
  
  // Customer information
  user: UserSummaryResponse | null; // Null for guest orders
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  
  // Address information
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  
  notes: string | null;
  
  // Items
  items: OrderItemResponse[];
  
  // Payment information
  transaction: OrderTransactionResponse | null;
}

// Pagination response structure
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    },
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Order pagination response
export type OrderPaginationResponse = Page<OrderResponse>;