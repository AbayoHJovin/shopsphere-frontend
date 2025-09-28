// Return Request Types for Admin Dashboard

export interface ReturnRequestDTO {
  id: string | number;
  orderId: string;
  customerId?: string;
  reason: string;
  status: ReturnStatus;
  submittedAt: string;
  decisionAt?: string;
  decisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  returnMedia?: ReturnMediaDTO[];
  returnItems: ReturnItemDTO[];
  returnAppeal?: ReturnAppealDTO;
  customerName?: string;
  customerEmail?: string;
  orderNumber: string;
  
  // Helper fields
  canBeAppealed: boolean;
  daysUntilExpiry: number;
  isEligibleForReturn: boolean;
}

export interface ReturnItemDTO {
  id: string | number;
  orderItemId: string;
  returnQuantity: number;
  itemReason: string;
  productId?: string;
  variantId?: string;
  maxQuantity: number;
  productName: string;
  variantName?: string;
  productImage?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ReturnMediaDTO {
  id: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface ReturnAppealDTO {
  id: string;
  reason: string;
  submittedAt: string;
  status: string;
  decisionAt?: string;
  decisionNotes?: string;
  appealMedia?: ReturnMediaDTO[];
}

export type ReturnStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'DENIED' 
  | 'COMPLETED';

export interface ReturnRequestsResponse {
  content: ReturnRequestDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ReturnDecisionDTO {
  returnRequestId: string | number;
  decision: 'APPROVED' | 'DENIED';
  decisionNotes?: string;
}

// Filter and search interfaces
export interface ReturnRequestFilters {
  status?: ReturnStatus | 'ALL';
  customerType?: 'ALL' | 'REGISTERED' | 'GUEST';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ReturnRequestSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: ReturnRequestFilters;
}
