"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, CalendarIcon, AlertTriangle, CheckCircle, XCircle, Clock, Warehouse } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  stockBatchService,
  StockBatch,
  CreateStockBatchRequest,
  UpdateStockBatchRequest,
} from "@/lib/services/stock-batch-service";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VariantBatchManagementProps {
  variantId: number;
  variantName: string;
  onBatchesUpdated?: () => void;
}

export function VariantBatchManagement({
  variantId,
  variantName,
  onBatchesUpdated,
}: VariantBatchManagementProps) {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<StockBatch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState<CreateStockBatchRequest>({
    stockId: 0,
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: 0,
    supplierName: "",
    supplierBatchNumber: "",
  });

  const [createFormTimes, setCreateFormTimes] = useState({
    manufactureTime: "",
    expiryTime: "",
  });

  const [editForm, setEditForm] = useState<UpdateStockBatchRequest>({
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: 0,
    supplierName: "",
    supplierBatchNumber: "",
  });

  const [editFormTimes, setEditFormTimes] = useState({
    manufactureTime: "",
    expiryTime: "",
  });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (variantId) {
      fetchBatches();
    }
  }, [variantId]);

  // Group batches by warehouse
  const batchesByWarehouse = batches.reduce((acc, batch) => {
    const warehouseId = batch.warehouseId;
    if (!acc[warehouseId]) {
      acc[warehouseId] = {
        warehouseName: batch.warehouseName,
        batches: [],
      };
    }
    acc[warehouseId].batches.push(batch);
    return acc;
  }, {} as Record<number, { warehouseName: string; batches: StockBatch[] }>);

  const handleCreateBatch = () => {
    if (warehouseStocks.length === 0) {
      toast({
        title: "No Warehouses",
        description: "This variant needs to be assigned to warehouses first",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      stockId: warehouseStocks[0]?.stockId || 0,
      batchNumber: "",
      quantity: 1,
      manufactureDate: "",
      expiryDate: "",
      supplierName: "",
      supplierBatchNumber: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEditBatch = (batch: StockBatch) => {
    setSelectedBatch(batch);
    setFormData({
      stockId: Number(batch.stockId),
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      manufactureDate: batch.manufactureDate || "",
      expiryDate: batch.expiryDate || "",
      supplierName: batch.supplierName || "",
      supplierBatchNumber: batch.supplierBatchNumber || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteBatch = (batch: StockBatch) => {
    setSelectedBatch(batch);
    setIsDeleteModalOpen(true);
  };

  const submitCreateBatch = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.stockId || !formData.batchNumber || formData.quantity <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await stockBatchService.createBatch({
        stockId: Number(formData.stockId),
        batchNumber: String(formData.batchNumber),
        quantity: Number(formData.quantity),
        manufactureDate: formData.manufactureDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        supplierName: formData.supplierName || undefined,
        supplierBatchNumber: formData.supplierBatchNumber || undefined,
      });

      toast({
        title: "Success",
        description: "Batch created successfully",
      });

      setIsCreateModalOpen(false);
      await fetchBatches();
      onBatchesUpdated?.();
    } catch (error: any) {
      console.error("Error creating batch:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitEditBatch = async () => {
    if (!selectedBatch) return;

    try {
      setLoading(true);

      await stockBatchService.updateBatch(selectedBatch.id, {
        batchNumber: String(formData.batchNumber),
        quantity: Number(formData.quantity),
        manufactureDate: formData.manufactureDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        supplierName: formData.supplierName || undefined,
        supplierBatchNumber: formData.supplierBatchNumber || undefined,
      });

      toast({
        title: "Success",
        description: "Batch updated successfully",
      });

      setIsEditModalOpen(false);
      setSelectedBatch(null);
      await fetchBatches();
      onBatchesUpdated?.();
    } catch (error: any) {
      console.error("Error updating batch:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteBatch = async () => {
    if (!selectedBatch) return;

    try {
      setLoading(true);

      await stockBatchService.deleteBatch(selectedBatch.id);

      toast({
        title: "Success",
        description: "Batch deleted successfully",
      });

      setIsDeleteModalOpen(false);
      setSelectedBatch(null);
      await fetchBatches();
      onBatchesUpdated?.();
    } catch (error: any) {
      console.error("Error deleting batch:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBatchStatusBadge = (batch: StockBatch) => {
    if (batch.isRecalled) {
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Recalled
        </Badge>
      );
    }
    if (batch.isExpired) {
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    }
    if (batch.isEmpty) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Package className="w-3 h-3 mr-1" />
          Empty
        </Badge>
      );
    }
    if (batch.isExpiringSoon) {
      return (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expiring Soon
        </Badge>
      );
    }
    if (batch.isAvailable) {
      return (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        <Clock className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Batch Management - {variantName}
              </CardTitle>
              <CardDescription>
                Manage stock batches for this product variant across all warehouses
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateBatch}
              className="bg-primary hover:bg-primary/90"
              disabled={loading || warehouseStocks.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Batch
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading batches...</p>
            </div>
          ) : Object.keys(batchesByWarehouse).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(batchesByWarehouse).map(([warehouseId, { warehouseName, batches }]) => (
                <div key={warehouseId} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Warehouse className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm">{warehouseName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {batches.length} batch{batches.length !== 1 ? 'es' : ''}
                    </Badge>
                  </div>

                  <div className="grid gap-3">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">
                              {batch.batchNumber}
                            </span>
                            {getBatchStatusBadge(batch)}
                            <span className="text-sm font-semibold text-primary">
                              {batch.quantity} units
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {batch.manufactureDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Mfg: {format(new Date(batch.manufactureDate), "MMM dd, yyyy")}
                              </span>
                            )}
                            {batch.expiryDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Exp: {format(new Date(batch.expiryDate), "MMM dd, yyyy")}
                              </span>
                            )}
                            {batch.supplierName && (
                              <span>Supplier: {batch.supplierName}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBatch(batch)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBatch(batch)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Batches Found</h3>
              <p className="text-muted-foreground mb-6">
                This variant doesn't have any stock batches yet.
              </p>
              {warehouseStocks.length > 0 ? (
                <Button onClick={handleCreateBatch} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Batch
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Assign this variant to warehouses first to create batches.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Batch Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Batch</DialogTitle>
            <DialogDescription>
              Create a new stock batch for {variantName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="warehouse">Warehouse</Label>
              <select
                id="warehouse"
                value={formData.stockId}
                onChange={(e) => setFormData({ ...formData, stockId: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {warehouseStocks.map((stock) => (
                  <option key={stock.stockId} value={stock.stockId}>
                    {stock.warehouseName} ({stock.stockQuantity} units)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="batchNumber">Batch Number *</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufactureDate">Manufacture Date</Label>
                <Input
                  id="manufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <Label htmlFor="supplierBatchNumber">Supplier Batch Number</Label>
              <Input
                id="supplierBatchNumber"
                value={formData.supplierBatchNumber}
                onChange={(e) => setFormData({ ...formData, supplierBatchNumber: e.target.value })}
                placeholder="Enter supplier batch number"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={submitCreateBatch} disabled={loading}>
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Update batch information for {selectedBatch?.batchNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="editBatchNumber">Batch Number *</Label>
              <Input
                id="editBatchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <Label htmlFor="editQuantity">Quantity *</Label>
              <Input
                id="editQuantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editManufactureDate">Manufacture Date</Label>
                <Input
                  id="editManufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editExpiryDate">Expiry Date</Label>
                <Input
                  id="editExpiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editSupplierName">Supplier Name</Label>
              <Input
                id="editSupplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <Label htmlFor="editSupplierBatchNumber">Supplier Batch Number</Label>
              <Input
                id="editSupplierBatchNumber"
                value={formData.supplierBatchNumber}
                onChange={(e) => setFormData({ ...formData, supplierBatchNumber: e.target.value })}
                placeholder="Enter supplier batch number"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={submitEditBatch} disabled={loading}>
              {loading ? "Updating..." : "Update Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete batch "{selectedBatch?.batchNumber}"? 
              This action cannot be undone and will remove {selectedBatch?.quantity} units from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDeleteBatch}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
