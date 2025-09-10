"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  warehouseService,
  WarehouseProductDTO,
} from "@/lib/services/warehouse-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Package,
  Trash2,
  AlertTriangle,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function WarehouseProductsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const warehouseId = parseInt(params.id as string);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [productToRemove, setProductToRemove] =
    useState<WarehouseProductDTO | null>(null);

  // Fetch warehouse products
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["warehouse-products", warehouseId, currentPage, pageSize],
    queryFn: () =>
      warehouseService.getWarehouseProducts(warehouseId, currentPage, pageSize),
    enabled: !!warehouseId,
  });

  // Remove product mutation
  const removeProductMutation = useMutation({
    mutationFn: (productId: string) =>
      warehouseService.removeProductFromWarehouse(warehouseId, productId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product removed from warehouse successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["warehouse-products", warehouseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });
      setProductToRemove(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to remove product",
        variant: "destructive",
      });
    },
  });

  const handleRemoveProduct = (product: WarehouseProductDTO) => {
    setProductToRemove(product);
  };

  const confirmRemoveProduct = () => {
    if (productToRemove) {
      removeProductMutation.mutate(productToRemove.productId);
    }
  };

  const filteredProducts =
    productsData?.content?.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.variantSku?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalPages = productsData
    ? Math.ceil(productsData.totalElements / pageSize)
    : 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load warehouse products. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Warehouse Products</h1>
            <p className="text-muted-foreground">
              Manage products in warehouse #{warehouseId}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsData?.totalElements || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredProducts.filter(
                  (p) => p.quantity <= p.lowStockThreshold
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
          <CardDescription>
            Search by product name, SKU, or variant SKU
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="pageSize">Page Size</Label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products in Warehouse</CardTitle>
          <CardDescription>
            {productsData?.totalElements || 0} total products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No products match your search criteria"
                  : "This warehouse has no products yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Low Stock Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={`${product.productId}-${
                        product.variantId || "main"
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          {product.productImages &&
                          product.productImages.length > 0 ? (
                            <Image
                              src={product.productImages[0]}
                              alt={product.productName}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {product.productName}
                          </div>
                          {product.isVariant && product.variantSku && (
                            <div className="text-sm text-muted-foreground">
                              Variant: {product.variantSku}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {product.isVariant
                            ? product.variantSku
                            : product.productSku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isVariant ? "secondary" : "default"}
                        >
                          {product.isVariant ? "Variant" : "Product"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.quantity}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {product.lowStockThreshold}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.quantity <= product.lowStockThreshold
                              ? "destructive"
                              : product.quantity <=
                                product.lowStockThreshold * 2
                              ? "secondary"
                              : "default"
                          }
                        >
                          {product.quantity <= product.lowStockThreshold
                            ? "Low Stock"
                            : product.quantity <= product.lowStockThreshold * 2
                            ? "Medium Stock"
                            : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProduct(product)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Product from Warehouse
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "
                                {product.productName}" from this warehouse? This
                                action cannot be undone and will remove all
                                stock for this product.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={confirmRemoveProduct}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={removeProductMutation.isPending}
                              >
                                {removeProductMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Removing...
                                  </>
                                ) : (
                                  "Remove Product"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to{" "}
                {Math.min(
                  (currentPage + 1) * pageSize,
                  productsData?.totalElements || 0
                )}{" "}
                of {productsData?.totalElements || 0} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, currentPage - 2) + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
