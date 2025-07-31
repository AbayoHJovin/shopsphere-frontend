"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Edit, Percent, Plus, FilterIcon, Star, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DiscountModal } from "@/components/DiscountModal";
import { FilterDialog } from "@/components/products/FilterDialog";
import { FilterButton } from "@/components/products/FilterButton";
import { productService } from "@/lib/services/product-service";
import { categoryService } from "@/lib/services/category-service";
import {
  Gender,
  ProductResponse,
  ProductSearchFilterRequest,
} from "@/lib/types/product";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

export default function ProductsPage() {
  const router = useRouter();

  // Pagination and filter state
  const [searchFilters, setSearchFilters] =
    useState<ProductSearchFilterRequest>({
      page: 0,
      size: 10,
      sortBy: "name",
      sortDirection: "asc",
    });

  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Add state for discount modal
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string>("");
  const [dontAskAgain, setDontAskAgain] = useState(false);

  // Fetch products with React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products", searchFilters],
    queryFn: () => {
      // If we have category IDs, fetch products by category
      if (searchFilters.categoryIds && searchFilters.categoryIds.length === 1) {
        return productService.getProductsByCategory(
          searchFilters.categoryIds[0] as string,
          searchFilters.page || 0,
          searchFilters.size || 10
        );
      }
      // Otherwise use advanced search
      return productService.advancedSearchProducts(searchFilters);
    },
  });

  // Function to open discount modal
  const openDiscountModal = (productId: string) => {
    setSelectedProductId(productId);
    setDiscountModalOpen(true);
  };

  const openDeleteModal = (productId: string) => {
    // Check if user has chosen to skip confirmation
    const deletePreference = localStorage.getItem("productDeletePreference");
    if (deletePreference === "true") {
      // Skip confirmation and delete directly
      handleDeleteProduct(productId);
    } else {
      // Show confirmation modal
      setProductToDelete(productId);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      
      // Refresh the product list
      refetch();
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = () => {
    // Save preference if don't ask again is checked
    if (dontAskAgain) {
      localStorage.setItem("productDeletePreference", "true");
    }
    
    // Delete the product
    handleDeleteProduct(productToDelete);
    
    // Close the modal
    setDeleteModalOpen(false);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && (!data || newPage < data.totalPages)) {
      setSearchFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Apply filters from dialog
  const handleApplyFilters = (filters: ProductSearchFilterRequest) => {
    // Keep pagination size but reset to page 0
    setSearchFilters({ ...filters, page: 0, size: searchFilters.size });
  };

  // Handle search
  const handleSearch = (filters: ProductSearchFilterRequest) => {
    // Keep pagination size but reset to page 0
    setSearchFilters({ ...filters, page: 0, size: searchFilters.size });
  };

  // Get active filter count for the button badge
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (searchFilters.categories?.length)
      count += searchFilters.categories.length;
    if (searchFilters.categoryIds?.length)
      count += searchFilters.categoryIds.length;
    if (searchFilters.colors?.length) count += 1;
    if (searchFilters.sizes?.length) count += 1;
    if (searchFilters.discountRanges?.length) count += 1;
    if (searchFilters.rating) count += 1;
    if (searchFilters.gender) count += 1;
    if (searchFilters.inStock) count += 1;
    if (searchFilters.onSale) count += 1;
    if (searchFilters.popular) count += 1;
    if (searchFilters.newArrivals) count += 1;
    if (searchFilters.keyword) count += 1;
    if (searchFilters.minPrice || searchFilters.maxPrice) count += 1;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FilterButton
            onApplyFilters={handleSearch}
            currentFilters={searchFilters}
          />

          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => router.push("/dashboard/products/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Product List */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">
                Error loading products
              </h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred"}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : !data || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or add some products.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Adjust Filters
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/products/create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((product: ProductResponse) => (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.mainImage ? (
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-muted-foreground/50"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.popular && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-xs bg-primary/10 text-primary border-primary/30"
                            >
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatCurrency(product.price)}
                        </span>
                        {product.previousPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.previousPrice)}
                          </span>
                        )}
                        {product.onSale && product.activeDiscount && (
                          <span className="text-xs text-primary font-medium mt-1">
                            {product.activeDiscount.percentage}% OFF
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {product.stock} in stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          Out of stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.gender}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span>{product.averageRating} </span>
                        <span className="text-muted-foreground text-xs">
                          ({product.ratingCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/products/${product.productId}`
                                  )
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Product</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/products/${product.productId}/update`
                                  )
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Product</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() =>
                                  openDiscountModal(product.productId)
                                }
                              >
                                <Percent className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage Discounts</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  openDeleteModal(product.productId)
                                }
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Product</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(searchFilters.page! - 1)}
                  className={
                    searchFilters.page === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Generate page numbers */}
              {Array.from({ length: data.totalPages }, (_, i) => {
                // Show current page, first, last, and pages around current
                const shouldShowPage =
                  i === 0 || // First page
                  i === data.totalPages - 1 || // Last page
                  Math.abs(i - searchFilters.page!) <= 1; // Pages around current

                if (!shouldShowPage) {
                  // Return ellipsis for skipped pages, but only once
                  if (i === searchFilters.page! - 2) {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }
                  if (i === searchFilters.page! + 2) {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={searchFilters.page === i}
                      onClick={() => handlePageChange(i)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(searchFilters.page! + 1)}
                  className={
                    searchFilters.page === data.totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Filters Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        currentFilters={searchFilters}
      />

      {/* Discount Modal */}
      <DiscountModal
        open={discountModalOpen}
        onOpenChange={setDiscountModalOpen}
        selectedProductId={selectedProductId}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="dont-ask-again"
              checked={dontAskAgain}
              onCheckedChange={(checked) => setDontAskAgain(checked === true)}
            />
            <label
              htmlFor="dont-ask-again"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't ask again
            </label>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
