import axios from "axios";
import { handleApiError } from "../utils/error-handler";
import { CategoryResponse, CategoryCreateRequest, CategoryUpdateRequest, CategorySummaryResponse } from "../types/category";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class AdminCategoryService {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<CategoryResponse[]> {
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
   * Get top-level categories
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
   * Get subcategories of a specific category
   */
  async getSubcategories(categoryId: string): Promise<CategoryResponse[]> {
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
   * Get category by ID
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
   * Get category summaries
   */
  async getCategorySummaries(): Promise<CategorySummaryResponse[]> {
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
      const response = await axios.put(`${API_URL}/admin/categories/${categoryId}`, categoryData, {
        withCredentials: true,
      });
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

export const adminCategoryService = new AdminCategoryService(); 