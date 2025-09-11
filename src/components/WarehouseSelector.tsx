"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  warehouseService,
  WarehouseDTO,
} from "@/lib/services/warehouse-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Trash2,
  Warehouse,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface WarehouseStock {
  warehouseId: number;
  warehouseName: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface WarehouseSelectorProps {
  warehouseStocks: WarehouseStock[];
  onWarehouseStocksChange: (stocks: WarehouseStock[]) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export function WarehouseSelector({
  warehouseStocks,
  onWarehouseStocksChange,
  disabled = false,
  title = "Warehouse Stock Assignment",
  description = "Assign stock quantities to warehouses for this product",
}: WarehouseSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseDTO | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Fetch warehouses with pagination and search
  const {
    data: warehousesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["warehouses", currentPage, pageSize, searchTerm],
    queryFn: () => warehouseService.getWarehouses(currentPage, pageSize),
    enabled: isDialogOpen,
  });

  const handleAddWarehouse = () => {
    if (!selectedWarehouse) return;

    // Check if warehouse is already added
    const existingStock = warehouseStocks.find(
      (stock) => stock.warehouseId === selectedWarehouse.id
    );

    if (existingStock) {
      // Update existing stock
      const updatedStocks = warehouseStocks.map((stock) =>
        stock.warehouseId === selectedWarehouse.id
          ? {
              ...stock,
              stockQuantity,
              lowStockThreshold,
            }
          : stock
      );
      onWarehouseStocksChange(updatedStocks);
    } else {
      // Add new stock
      const newStock: WarehouseStock = {
        warehouseId: selectedWarehouse.id,
        warehouseName: selectedWarehouse.name,
        stockQuantity,
        lowStockThreshold,
      };
      onWarehouseStocksChange([...warehouseStocks, newStock]);
    }

    // Reset form
    setSelectedWarehouse(null);
    setStockQuantity(0);
    setLowStockThreshold(5);
    setIsDialogOpen(false);
  };

  const handleRemoveWarehouse = (warehouseId: number) => {
    const updatedStocks = warehouseStocks.filter(
      (stock) => stock.warehouseId !== warehouseId
    );
    onWarehouseStocksChange(updatedStocks);
  };

  const handleUpdateStock = (
    warehouseId: number,
    field: keyof WarehouseStock,
    value: number
  ) => {
    const updatedStocks = warehouseStocks.map((stock) =>
      stock.warehouseId === warehouseId ? { ...stock, [field]: value } : stock
    );
    onWarehouseStocksChange(updatedStocks);
  };

  const totalStock = warehouseStocks.reduce(
    (sum, stock) => sum + stock.stockQuantity,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {disabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warehouse selection is disabled when product variants are present.
              Stock will be managed at the variant level instead.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {warehouseStocks.length} Warehouse
              {warehouseStocks.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="secondary">Total Stock: {totalStock}</Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={disabled} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Select Warehouse</DialogTitle>
                <DialogDescription>
                  Choose a warehouse and set stock quantities for this product.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search warehouses..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Warehouse List */}
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading warehouses...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <span className="ml-2 text-destructive">
                        Failed to load warehouses
                      </span>
                    </div>
                  ) : warehousesData?.content?.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <Warehouse className="h-6 w-6 text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">
                        No warehouses found
                      </span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehousesData?.content?.map((warehouse) => (
                          <TableRow
                            key={warehouse.id}
                            className={`cursor-pointer hover:bg-muted/50 ${
                              selectedWarehouse?.id === warehouse.id
                                ? "bg-muted"
                                : ""
                            }`}
                            onClick={() => setSelectedWarehouse(warehouse)}
                          >
                            <TableCell>
                              <div className="font-medium">
                                {warehouse.name}
                              </div>
                              {warehouse.description && (
                                <div className="text-sm text-muted-foreground">
                                  {warehouse.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {warehouse.city}, {warehouse.state}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {warehouse.country}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  warehouse.isActive ? "default" : "secondary"
                                }
                              >
                                {warehouse.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWarehouse(warehouse);
                                }}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Stock Configuration */}
                {selectedWarehouse && (
                  <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                    <div>
                      <Label className="text-sm font-medium">
                        Selected: {selectedWarehouse.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedWarehouse.city}, {selectedWarehouse.state},{" "}
                        {selectedWarehouse.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stockQuantity">Stock Quantity</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) =>
                            setStockQuantity(Number(e.target.value))
                          }
                          placeholder="Enter stock quantity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lowStockThreshold">
                          Low Stock Threshold
                        </Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          min="0"
                          value={lowStockThreshold}
                          onChange={(e) =>
                            setLowStockThreshold(Number(e.target.value))
                          }
                          placeholder="Enter threshold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddWarehouse}
                  disabled={!selectedWarehouse || stockQuantity < 0}
                >
                  Add Warehouse
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Warehouse Assignments */}
        {warehouseStocks.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Assignments</Label>
            <div className="space-y-2">
              {warehouseStocks.map((stock) => (
                <div
                  key={stock.warehouseId}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex-1">
                    <div className="font-medium">{stock.warehouseName}</div>
                    <div className="text-sm text-muted-foreground">
                      Warehouse ID: {stock.warehouseId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Stock: {stock.stockQuantity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Threshold: {stock.lowStockThreshold}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveWarehouse(stock.warehouseId)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {warehouseStocks.length === 0 && !disabled && (
          <div className="text-center py-8 text-muted-foreground">
            <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No warehouses assigned yet</p>
            <p className="text-sm">
              Click "Add Warehouse" to assign stock to warehouses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
