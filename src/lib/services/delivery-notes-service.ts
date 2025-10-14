import apiClient from "../api-client";

export interface DeliveryNoteDTO {
  noteId: number;
  noteText: string;
  noteType: string;
  noteCategory: string | null;
  orderId: number | null;
  orderNumber: string | null;
  deliveryGroupId: number | null;
  deliveryGroupName: string | null;
  agentId: string;
  agentName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryNoteRequest {
  noteText: string;
  noteType: "ORDER_SPECIFIC" | "GROUP_GENERAL";
  noteCategory?: string;
  orderId?: number;
  deliveryGroupId?: number;
}

export interface UpdateDeliveryNoteRequest {
  noteText: string;
  noteCategory?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export const deliveryNotesService = {
  /**
   * Create a new delivery note
   */
  createNote: async (
    request: CreateDeliveryNoteRequest
  ): Promise<DeliveryNoteDTO> => {
    const response = await apiClient.post("/delivery-notes", request);
    return response.data.data;
  },

  /**
   * Update an existing delivery note
   */
  updateNote: async (
    noteId: number,
    request: UpdateDeliveryNoteRequest
  ): Promise<DeliveryNoteDTO> => {
    const response = await apiClient.put(
      `/delivery-notes/${noteId}`,
      request
    );
    return response.data.data;
  },

  /**
   * Delete a delivery note
   */
  deleteNote: async (noteId: number): Promise<void> => {
    await apiClient.delete(`/delivery-notes/${noteId}`);
  },

  /**
   * Get notes for a specific order
   */
  getNotesForOrder: async (
    orderId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<DeliveryNoteDTO>> => {
    const response = await apiClient.get(`/delivery-notes/order/${orderId}`, {
      params: { page, size, sortBy: "createdAt", sortDirection: "DESC" },
    });
    return response.data;
  },

  /**
   * Get notes for a specific delivery group
   */
  getNotesForDeliveryGroup: async (
    groupId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<DeliveryNoteDTO>> => {
    const response = await apiClient.get(`/delivery-notes/group/${groupId}`, {
      params: { page, size, sortBy: "createdAt", sortDirection: "DESC" },
    });
    return response.data;
  },

  /**
   * Get all notes for a delivery group (including order-specific notes)
   */
  getAllNotesForDeliveryGroup: async (
    groupId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<DeliveryNoteDTO>> => {
    const response = await apiClient.get(
      `/delivery-notes/group/${groupId}/all`,
      {
        params: { page, size, sortBy: "createdAt", sortDirection: "DESC" },
      }
    );
    return response.data;
  },

  /**
   * Get my notes
   */
  getMyNotes: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<DeliveryNoteDTO>> => {
    const response = await apiClient.get(`/delivery-notes/agent/my-notes`, {
      params: { page, size, sortBy: "createdAt", sortDirection: "DESC" },
    });
    return response.data;
  },

  /**
   * Get note by ID
   */
  getNoteById: async (noteId: number): Promise<DeliveryNoteDTO> => {
    const response = await apiClient.get(`/v1/delivery-notes/${noteId}`);
    return response.data.data;
  },
};
