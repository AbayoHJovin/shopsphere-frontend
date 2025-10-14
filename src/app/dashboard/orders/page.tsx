"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Eye,
  Filter,
  Search,
  Calendar,
  Download,
  X,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { useMediaQuery } from "@/hooks/use-media-query";
import { orderService } from "@/lib/services/order-service";
import { userService, UserDTO } from "@/lib/services/user-service";
import {
  AdminOrderDTO,
  OrderStatus,
  OrderPaymentStatus,
} from "@/lib/types/order";
import { toast } from "sonner";
import { TruncatedText } from "@/components/ui/truncated-text";
import { DeliveryGroupDialog } from "@/components/delivery/DeliveryGroupDialog";
import { OrderCheckbox } from "@/components/delivery/OrderCheckbox";
import {
  deliveryGroupService,
  DeliveryGroupDto,
} from "@/lib/services/delivery-group-service";

export default function OrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [filters, setFilters] = useState({
    orderStatus: "all",
    paymentStatus: "all",
    city: "",
    country: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // State for API data
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrderDTO[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(15);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Delivery group workflow state
  const [deliveryGroupDialogOpen, setDeliveryGroupDialogOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [orderGroups, setOrderGroups] = useState<Map<number, DeliveryGroupDto>>(
    new Map()
  );

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() || Object.values(filters).some(
        (value) => value !== "all" && value !== "" && value !== null
      )) {
        setCurrentPage(0); // Reset to first page on search
        fetchOrders(true);
      } else if (searchTerm === "") {
        // If search is cleared, fetch without search
        setCurrentPage(0);
        fetchOrders(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = async (useSearch: boolean = false) => {
    try {
      setLoading(true);
      
      // Check if we should use search or regular fetch
      const hasActiveFilters = Object.values(filters).some(
        (value) => value !== "all" && value !== "" && value !== null
      ) || searchTerm.trim() !== "";

      const shouldUseSearch = useSearch || hasActiveFilters;

      let response;
      
      if (shouldUseSearch) {
        // Prepare search request
        const searchRequest: any = {
          page: currentPage,
          size: pageSize,
          sortBy: "createdAt",
          sortDirection: "desc"
        };

        // Add search term if present
        if (searchTerm.trim()) {
          searchRequest.searchKeyword = searchTerm.trim();
        }

        // Add filters
        if (filters.orderStatus !== "all") {
          searchRequest.orderStatus = filters.orderStatus;
        }
        if (filters.paymentStatus !== "all") {
          searchRequest.paymentStatus = filters.paymentStatus;
        }
        if (filters.city.trim()) {
          searchRequest.city = filters.city.trim();
        }
        if (filters.startDate) {
          searchRequest.startDate = filters.startDate.toISOString();
        }
        if (filters.endDate) {
          searchRequest.endDate = filters.endDate.toISOString();
        }

        response = await orderService.searchOrders(searchRequest);
      } else {
        // Use regular pagination
        response = await orderService.getAllOrdersPaginated(
          currentPage,
          pageSize,
          "createdAt",
          "desc"
        );
      }

      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalElements(response.pagination.totalElements);
      setHasNext(response.pagination.hasNext);
      setHasPrevious(response.pagination.hasPrevious);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Build order groups map from embedded delivery group data
  useEffect(() => {
    const newOrderGroups = new Map<number, DeliveryGroupDto>();

    for (const order of orders) {
      // Use embedded delivery group data if available
      if (order.deliveryGroup) {
        const group: DeliveryGroupDto = {
          deliveryGroupId: order.deliveryGroup.deliveryGroupId,
          deliveryGroupName: order.deliveryGroup.deliveryGroupName,
          deliveryGroupDescription: order.deliveryGroup.deliveryGroupDescription || "",
          delivererId: order.deliveryGroup.delivererId,
          delivererName: order.deliveryGroup.delivererName,
          orderIds: [parseInt(order.id)], // Single order for now
          memberCount: order.deliveryGroup.memberCount,
          createdAt: order.deliveryGroup.createdAt,
          scheduledAt: order.deliveryGroup.scheduledAt,
          hasDeliveryStarted: order.deliveryGroup.hasDeliveryStarted,
          deliveryStartedAt: order.deliveryGroup.deliveryStartedAt,
          status: order.deliveryGroup.status,
        };
        newOrderGroups.set(parseInt(order.id), group);
      }
    }

    setOrderGroups(newOrderGroups);
  }, [orders]);

  // Delivery group workflow functions
  const openDeliveryGroupDialog = (orderId?: number) => {
    console.log("Opening delivery group dialog for order:", orderId);
    if (orderId) {
      setSelectedOrderIds([orderId]);
    }
    setDeliveryGroupDialogOpen(true);
  };

  const handleBulkAssign = () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    setDeliveryGroupDialogOpen(true);
  };

  const handleOrderSelection = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, orderId]);
    } else {
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(orders.map((order) => parseInt(order.id)));
    } else {
      setSelectedOrderIds([]);
    }
  };


  const handleDeliveryGroupSuccess = async () => {
    // Refresh orders to get updated group information
    await fetchOrders();
    setSelectedOrderIds([]);
    setDeliveryGroupDialogOpen(false);
    toast.success("Orders updated successfully");
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOrderIds([]); // Clear selections when changing pages
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      handlePageChange(currentPage + 1);
    }
  };

  // Note: Filtering is now handled server-side through the API
  // Client-side filtering has been removed in favor of server-side pagination

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setCurrentPage(0); // Reset to first page when applying filters
    await fetchOrders(true); // Force use search
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      orderStatus: "all",
      paymentStatus: "all",
      city: "",
      country: "",
      startDate: null,
      endDate: null,
    });
    setSearchTerm("");
    setCurrentPage(0); // Reset to first page
    fetchOrders(false); // Use regular fetch without filters
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "secondary";
      case OrderStatus.PROCESSING:
        return "default";
      case OrderStatus.SHIPPED:
        return "outline";
      case OrderStatus.DELIVERED:
        return "default";
      case OrderStatus.CANCELLED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case OrderPaymentStatus.PENDING:
        return "secondary";
      case OrderPaymentStatus.COMPLETED:
        return "default";
      case OrderPaymentStatus.CANCELLED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Orders Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all customer orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <Download className="h-4 w-4" />
              Export Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar - Always visible */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="pt-6 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, user ID, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-primary/20 focus-visible:ring-primary"
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading orders..."
                : `Showing ${Math.min(pageSize, orders.length)} of ${totalElements} orders (Page ${currentPage + 1} of ${totalPages})`}
            </p>
            {Object.values(filters).some(
              (value) => value !== "all" && value !== "" && value !== null
            ) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                size="sm"
                disabled={loading}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters Dialog for Desktop */}
      {!isMobile && (
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </DialogTitle>
              <DialogDescription>
                Filter orders by status, location, dates, and more
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select
                    value={filters.orderStatus}
                    onValueChange={(value) =>
                      handleFilterChange("orderStatus", value)
                    }
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value={OrderStatus.PENDING}>
                        {OrderStatus.PENDING}
                      </SelectItem>
                      <SelectItem value={OrderStatus.PROCESSING}>
                        {OrderStatus.PROCESSING}
                      </SelectItem>
                      <SelectItem value={OrderStatus.SHIPPED}>
                        {OrderStatus.SHIPPED}
                      </SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>
                        {OrderStatus.DELIVERED}
                      </SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>
                        {OrderStatus.CANCELLED}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) =>
                      handleFilterChange("paymentStatus", value)
                    }
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All payments</SelectItem>
                      <SelectItem value={OrderPaymentStatus.PENDING}>
                        {OrderPaymentStatus.PENDING}
                      </SelectItem>
                      <SelectItem value={OrderPaymentStatus.COMPLETED}>
                        {OrderPaymentStatus.COMPLETED}
                      </SelectItem>
                      <SelectItem value={OrderPaymentStatus.CANCELLED}>
                        {OrderPaymentStatus.CANCELLED}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="Filter by city..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.startDate
                          ? format(filters.startDate, "PPP")
                          : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.startDate || undefined}
                        onSelect={(date) =>
                          handleFilterChange("startDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.endDate
                          ? format(filters.endDate, "PPP")
                          : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.endDate || undefined}
                        onSelect={(date) => handleFilterChange("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={applyFilters}
                  className="bg-primary hover:bg-primary/90"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Filters Sidebar for Mobile */}
      {isMobile && (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </SheetTitle>
              <SheetDescription>
                Filter orders by status, location, dates, and more
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-4">
              {/* Filter Grid */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select
                    value={filters.orderStatus}
                    onValueChange={(value) =>
                      handleFilterChange("orderStatus", value)
                    }
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value={OrderStatus.PENDING}>
                        {OrderStatus.PENDING}
                      </SelectItem>
                      <SelectItem value={OrderStatus.PROCESSING}>
                        {OrderStatus.PROCESSING}
                      </SelectItem>
                      <SelectItem value={OrderStatus.SHIPPED}>
                        {OrderStatus.SHIPPED}
                      </SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>
                        {OrderStatus.DELIVERED}
                      </SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>
                        {OrderStatus.CANCELLED}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) =>
                      handleFilterChange("paymentStatus", value)
                    }
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All payments</SelectItem>
                      <SelectItem value={OrderPaymentStatus.PENDING}>
                        {OrderPaymentStatus.PENDING}
                      </SelectItem>
                      <SelectItem value={OrderPaymentStatus.COMPLETED}>
                        {OrderPaymentStatus.COMPLETED}
                      </SelectItem>
                      <SelectItem value={OrderPaymentStatus.CANCELLED}>
                        {OrderPaymentStatus.CANCELLED}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="Filter by city..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.startDate
                          ? format(filters.startDate, "PPP")
                          : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.startDate || undefined}
                        onSelect={(date) =>
                          handleFilterChange("startDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.endDate
                          ? format(filters.endDate, "PPP")
                          : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.endDate || undefined}
                        onSelect={(date) => handleFilterChange("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={() => setFiltersOpen(false)}
                  className="bg-primary hover:bg-primary/90 w-full"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-primary/20 hover:bg-primary/5 hover:text-primary w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Orders Table - with improved responsive design */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <div className="flex items-center justify-center">
                      <OrderCheckbox
                        orderId={0}
                        checked={
                          selectedOrderIds.length === orders.length &&
                          orders.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Payment
                  </TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Delivery Group
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={10} className="h-16 text-center">
                        {index === 2 && "Loading orders..."}
                      </TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  // Orders data
                  orders.map((order) => {
                    const orderId = parseInt(order.id);
                    const currentGroup = orderGroups.get(orderId);

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <OrderCheckbox
                              orderId={orderId}
                              checked={selectedOrderIds.includes(orderId)}
                              onCheckedChange={(checked) =>
                                handleOrderSelection(orderId, checked)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <TruncatedText
                            text={order.orderNumber}
                            maxLength={12}
                            className="font-medium"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            {order.customerName ? (
                              <p className="font-medium text-sm">
                                {order.customerName}
                              </p>
                            ) : (
                              <TruncatedText
                                text={order.userId}
                                maxLength={8}
                                className="text-sm font-medium"
                              />
                            )}
                            {order.customerEmail && (
                              <p className="text-xs text-muted-foreground">
                                {order.customerEmail}
                              </p>
                            )}
                            {order.customerPhone && (
                              <p className="text-xs text-muted-foreground">
                                {order.customerPhone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className={
                              order.status === OrderStatus.PROCESSING ||
                              order.status === OrderStatus.DELIVERED
                                ? "bg-primary hover:bg-primary/90"
                                : ""
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={getPaymentStatusBadgeVariant(
                              order.paymentInfo?.paymentStatus || "PENDING"
                            )}
                            className={
                              order.paymentInfo?.paymentStatus ===
                              OrderPaymentStatus.COMPLETED
                                ? "bg-primary hover:bg-primary/90"
                                : ""
                            }
                          >
                            {order.paymentInfo?.paymentStatus || "PENDING"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm">
                            <p>{order.shippingAddress?.city || "N/A"}</p>
                            <p className="text-muted-foreground">
                              {order.shippingAddress?.country || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {currentGroup ? (
                            <div className="text-sm">
                              <Badge variant="outline" className="text-xs">
                                {currentGroup.deliveryGroupName}
                              </Badge>
                              <div className="text-muted-foreground text-xs mt-1">
                                {currentGroup.delivererName}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeliveryGroupDialog(orderId)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title={
                                currentGroup
                                  ? "Change Delivery Group"
                                  : "Assign to Delivery Group"
                              }
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/orders/${order.id}`)
                              }
                              className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                              title="View Order Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Order count info and bulk actions */}
          <div className="flex justify-between items-center px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total: {totalElements} orders
              {selectedOrderIds.length > 0 && (
                <span className="ml-2 text-primary">
                  ({selectedOrderIds.length} selected)
                </span>
              )}
            </p>
            {selectedOrderIds.length > 0 && (
              <Button onClick={handleBulkAssign} className="gap-2">
                <Users className="h-4 w-4" />
                Assign to Group ({selectedOrderIds.length})
              </Button>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center px-4 py-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={handlePreviousPage}
                      className={!hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage <= 2) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 3 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages - 1)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={handleNextPage}
                      className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Group Dialog */}
      <DeliveryGroupDialog
        open={deliveryGroupDialogOpen}
        onOpenChange={setDeliveryGroupDialogOpen}
        selectedOrderIds={selectedOrderIds}
        onSuccess={handleDeliveryGroupSuccess}
        currentGroup={
          selectedOrderIds.length === 1
            ? orderGroups.get(selectedOrderIds[0]) || null
            : null
        }
      />
    </div>
  );
}
