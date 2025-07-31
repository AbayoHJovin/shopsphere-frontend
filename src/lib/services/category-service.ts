import axios from "axios";
import { CategoryResponse } from "../types/product";
import { handleApiError } from "../utils/error-handler";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface CategoryCreateRequest {
  name: string;
  description: string;
  parentId?: string;
}

export interface CategoryUpdateRequest {
  name: string;
  description: string;
  parentId?: string;
}

export interface CategorySummary {
  categoryId: string;
  name: string;
  description: string;
  productCount: number;
  subcategoryCount: number;
}

class CategoryService {
  /**
   * Get all categories (public endpoint)
   */
  async getAllCategories(): Promise<CategoryResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/public/categories`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get subcategories for a specific category (public endpoint)
   */
  async getSubcategories(categoryId: string): Promise<CategoryResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/public/categories/${categoryId}/subcategories`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all categories (admin endpoint)
   */
  async getAllAdminCategories(): Promise<CategoryResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/categories`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get top-level categories (admin endpoint)
   */
  async getTopLevelCategories(): Promise<CategoryResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/categories/top-level`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get subcategories for a specific category (admin endpoint)
   */
  async getAdminSubcategories(categoryId: string): Promise<CategoryResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/categories/${categoryId}/subcategories`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get category summaries for admin dashboard
   */
  async getCategorySummaries(): Promise<CategorySummary[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/categories/summaries`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get a category by ID (admin endpoint)
   */
  async getCategoryById(categoryId: string): Promise<CategoryResponse> {
    try {
      const response = await axios.get(`${API_URL}/admin/categories/${categoryId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CategoryCreateRequest): Promise<CategoryResponse> {
    try {
      const response = await axios.post(`${API_URL}/admin/categories`, categoryData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryId: string, categoryData: CategoryUpdateRequest): Promise<CategoryResponse> {
    try {
      const response = await axios.put(
        `${API_URL}/admin/categories/${categoryId}`,
        categoryData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/categories/${categoryId}`, {
        withCredentials: true,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const categoryService = new CategoryService();