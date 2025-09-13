"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Calendar,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  discountService,
  DiscountDTO,
  CreateDiscountDTO,
} from "@/lib/services/discount-service";
import { toast } from "@/hooks/use-toast";
import { CreateDiscountForm } from "./components/CreateDiscountForm";
import { DiscountDetailsModal } from "./components/DiscountDetailsModal";
import { UpdateDiscountForm } from "./components/UpdateDiscountForm";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountDTO | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<DiscountDTO | null>(
    null
  );
  const [discountToUpdate, setDiscountToUpdate] = useState<DiscountDTO | null>(
    null
  );

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await discountService.getAllDiscounts(
        currentPage,
        pageSize,
        sortBy,
        sortDirection,
        activeOnly
      );
      setDiscounts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);

      // Handle different error formats
      let errorMessage = "Failed to fetch discounts";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, pageSize, sortBy, sortDirection, activeOnly]);

  const handleCreateDiscount = async (discountData: CreateDiscountDTO) => {
    try {
      await discountService.createDiscount(discountData);
      toast({
        title: "Success",
        description: "Discount created successfully",
      });
      setShowCreateModal(false);
      fetchDiscounts();
    } catch (error: any) {
      console.error("Error creating discount:", error);

      // Handle different error formats
      let errorMessage = "Failed to create discount";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDiscount = async () => {
    if (!discountToDelete) return;

    try {
      await discountService.deleteDiscount(discountToDelete.discountId);
      toast({
        title: "Success",
        description: "Discount deleted successfully",
      });
      fetchDiscounts();
      setShowDeleteModal(false);
      setDiscountToDelete(null);
    } catch (error: any) {
      console.error("Error deleting discount:", error);

      // Handle different error formats
      let errorMessage = "Failed to delete discount";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = (discount: DiscountDTO) => {
    setDiscountToDelete(discount);
    setShowDeleteModal(true);
  };

  const openUpdateModal = (discount: DiscountDTO) => {
    setDiscountToUpdate(discount);
    setShowUpdateModal(true);
  };

  const handleUpdateDiscount = async (data: any) => {
    if (!discountToUpdate) return;

    try {
      await discountService.updateDiscount(discountToUpdate.discountId, data);
      toast({
        title: "Success",
        description: "Discount updated successfully",
      });
      fetchDiscounts();
      setShowUpdateModal(false);
      setDiscountToUpdate(null);
    } catch (error: any) {
      console.error("Error updating discount:", error);

      // Handle different error formats
      let errorMessage = "Failed to update discount";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (discount: DiscountDTO) => {
    setSelectedDiscount(discount);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (discount: DiscountDTO) => {
    if (!discount.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!discount.isValid) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.discountCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground">
            Manage discounts and promotional offers
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>
                Create a new discount for your products
              </DialogDescription>
            </DialogHeader>
            <CreateDiscountForm onSubmit={handleCreateDiscount} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={activeOnly.toString()}
              onValueChange={(value) => setActiveOnly(value === "true")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">All Discounts</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="startDate">Start Date</SelectItem>
                <SelectItem value="endDate">End Date</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDirection} onValueChange={setSortDirection}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discounts ({totalElements})</CardTitle>
          <CardDescription>
            Manage your discount codes and promotional offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading discounts...</div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscounts.map((discount) => (
                    <TableRow key={discount.discountId}>
                      <TableCell className="font-medium">
                        {discount.name}
                      </TableCell>
                      <TableCell>
                        {discount.discountCode ? (
                          <Badge variant="outline">
                            {discount.discountCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No code</span>
                        )}
                      </TableCell>
                      <TableCell>{discount.percentage}%</TableCell>
                      <TableCell>{getStatusBadge(discount)}</TableCell>
                      <TableCell>
                        {discount.usedCount} / {discount.usageLimit || "∞"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(discount.startDate)}</div>
                          {discount.endDate && (
                            <div className="text-muted-foreground">
                              to {formatDate(discount.endDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(discount)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUpdateModal(discount)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(discount)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to{" "}
                  {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
                  {totalElements} discounts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Details Modal */}
      <DiscountDetailsModal
        discount={selectedDiscount}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discount</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the discount "
              {discountToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDiscount}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Discount</DialogTitle>
            <DialogDescription>
              Update the discount information below.
            </DialogDescription>
          </DialogHeader>
          {discountToUpdate && (
            <UpdateDiscountForm
              discount={discountToUpdate}
              onSubmit={handleUpdateDiscount}
              onCancel={() => {
                setShowUpdateModal(false);
                setDiscountToUpdate(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
