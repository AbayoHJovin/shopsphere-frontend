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
  Package,
  CalendarIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface WarehouseStockWithBatches {
  warehouseId: number;
  warehouseName: string;
  stockQuantity: number;
  lowStockThreshold: number;
  batches: Array<{
    batchNumber: string;
    manufactureDate?: string;
    expiryDate?: string;
    quantity: number;
    supplierName?: string;
    supplierBatchNumber?: string;
  }>;
}

interface WarehouseSelectorWithBatchesProps {
  warehouseStocks: WarehouseStockWithBatches[];
  onWarehouseStocksChange: (stocks: WarehouseStockWithBatches[]) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export function WarehouseSelectorWithBatches({
  warehouseStocks,
  onWarehouseStocksChange,
  disabled = false,
  title = "Warehouse Stock Assignment with Batches",
  description = "Assign stock quantities with batch details to warehouses for this product",
}: WarehouseSelectorWithBatchesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseDTO | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Batch form state
  const [batches, setBatches] = useState<
    Array<{
      batchNumber: string;
      manufactureDate?: string;
      expiryDate?: string;
      quantity: number;
      supplierName?: string;
      supplierBatchNumber?: string;
    }>
  >([]);

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

  const handleAddBatch = () => {
    setBatches([
      ...batches,
      {
        batchNumber: "",
        quantity: 0,
        supplierName: "",
        supplierBatchNumber: "",
      },
    ]);
  };

  const handleRemoveBatch = (index: number) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const handleBatchChange = (index: number, field: string, value: any) => {
    const updatedBatches = [...batches];
    updatedBatches[index] = { ...updatedBatches[index], [field]: value };
    setBatches(updatedBatches);
  };

  const handleAddWarehouse = () => {
    if (!selectedWarehouse || batches.length === 0) return;

    // Validate batches
    const hasInvalidBatch = batches.some(
      (batch) => !batch.batchNumber.trim() || batch.quantity <= 0
    );

    if (hasInvalidBatch) {
      alert("Please ensure all batches have a batch number and quantity > 0");
      return;
    }

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
              batches,
              lowStockThreshold,
              stockQuantity: batches.reduce(
                (sum, batch) => sum + batch.quantity,
                0
              ),
            }
          : stock
      );
      onWarehouseStocksChange(updatedStocks);
    } else {
      // Add new stock
      const newStock: WarehouseStockWithBatches = {
        warehouseId: selectedWarehouse.id,
        warehouseName: selectedWarehouse.name,
        batches,
        lowStockThreshold,
        stockQuantity: batches.reduce((sum, batch) => sum + batch.quantity, 0),
      };
      onWarehouseStocksChange([...warehouseStocks, newStock]);
    }

    // Reset form
    setSelectedWarehouse(null);
    setBatches([]);
    setLowStockThreshold(5);
    setIsDialogOpen(false);
  };

  const handleRemoveWarehouse = (warehouseId: number) => {
    const updatedStocks = warehouseStocks.filter(
      (stock) => stock.warehouseId !== warehouseId
    );
    onWarehouseStocksChange(updatedStocks);
  };

  const totalStock = warehouseStocks.reduce(
    (sum, stock) => sum + stock.stockQuantity,
    0
  );

  const totalBatches = warehouseStocks.reduce(
    (sum, stock) => sum + stock.batches.length,
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
            <Badge variant="outline">Total Batches: {totalBatches}</Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={disabled} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse with Batches
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>
                  Select Warehouse and Configure Batches
                </DialogTitle>
                <DialogDescription>
                  Choose a warehouse and configure batch details for this
                  product.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Warehouse Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Select Warehouse
                  </Label>

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
                </div>

                {/* Batch Configuration */}
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

                    <div className="grid grid-cols-1 gap-4">
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

                    {/* Batch Management */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Batches</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddBatch}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Batch
                        </Button>
                      </div>

                      {batches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No batches added yet</p>
                          <p className="text-sm">
                            Click "Add Batch" to create your first batch
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {batches.map((batch, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-md bg-background"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">
                                  Batch {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveBatch(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`batchNumber-${index}`}>
                                    Batch Number *
                                  </Label>
                                  <Input
                                    id={`batchNumber-${index}`}
                                    value={batch.batchNumber}
                                    onChange={(e) =>
                                      handleBatchChange(
                                        index,
                                        "batchNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter batch number"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`quantity-${index}`}>
                                    Quantity *
                                  </Label>
                                  <Input
                                    id={`quantity-${index}`}
                                    type="number"
                                    min="1"
                                    value={batch.quantity}
                                    onChange={(e) =>
                                      handleBatchChange(
                                        index,
                                        "quantity",
                                        Number(e.target.value)
                                      )
                                    }
                                    placeholder="Enter quantity"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`manufactureDate-${index}`}>
                                    Manufacture Date
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !batch.manufactureDate &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {batch.manufactureDate ? (
                                          format(
                                            new Date(batch.manufactureDate),
                                            "PPP"
                                          )
                                        ) : (
                                          <span>Pick a date (optional)</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={
                                          batch.manufactureDate
                                            ? new Date(batch.manufactureDate)
                                            : undefined
                                        }
                                        onSelect={(date) => {
                                          if (date) {
                                            handleBatchChange(
                                              index,
                                              "manufactureDate",
                                              format(date, "yyyy-MM-dd")
                                            );
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div>
                                  <Label htmlFor={`expiryDate-${index}`}>
                                    Expiry Date
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !batch.expiryDate &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {batch.expiryDate ? (
                                          format(
                                            new Date(batch.expiryDate),
                                            "PPP"
                                          )
                                        ) : (
                                          <span>Pick a date (optional)</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={
                                          batch.expiryDate
                                            ? new Date(batch.expiryDate)
                                            : undefined
                                        }
                                        onSelect={(date) => {
                                          if (date) {
                                            handleBatchChange(
                                              index,
                                              "expiryDate",
                                              format(date, "yyyy-MM-dd")
                                            );
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div>
                                  <Label htmlFor={`supplierName-${index}`}>
                                    Supplier Name
                                  </Label>
                                  <Input
                                    id={`supplierName-${index}`}
                                    value={batch.supplierName || ""}
                                    onChange={(e) =>
                                      handleBatchChange(
                                        index,
                                        "supplierName",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter supplier name"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`supplierBatchNumber-${index}`}
                                  >
                                    Supplier Batch Number
                                  </Label>
                                  <Input
                                    id={`supplierBatchNumber-${index}`}
                                    value={batch.supplierBatchNumber || ""}
                                    onChange={(e) =>
                                      handleBatchChange(
                                        index,
                                        "supplierBatchNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter supplier batch number"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                  disabled={!selectedWarehouse || batches.length === 0}
                >
                  Add Warehouse with Batches
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
                <div key={stock.warehouseId} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
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
                        <div className="text-xs text-muted-foreground">
                          Batches: {stock.batches.length}
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

                  {/* Show batch details */}
                  {stock.batches.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Batches:
                      </div>
                      {stock.batches.map((batch, index) => (
                        <div
                          key={index}
                          className="text-xs bg-muted/50 p-2 rounded"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {batch.batchNumber}
                            </span>
                            <span>Qty: {batch.quantity}</span>
                          </div>
                          {batch.supplierName && (
                            <div className="text-muted-foreground">
                              Supplier: {batch.supplierName}
                            </div>
                          )}
                          {batch.expiryDate && (
                            <div className="text-muted-foreground">
                              Expires:{" "}
                              {new Date(batch.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
              Click "Add Warehouse with Batches" to assign stock to warehouses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
