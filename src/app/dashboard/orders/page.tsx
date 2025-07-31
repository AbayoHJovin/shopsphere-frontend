"use client";

import { useState, useMemo, useEffect } from "react";
import { Eye, Filter, Search, Calendar, Download, X } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import { useMediaQuery } from "@/hooks/use-media-query";
import { orderService } from "@/lib/services/order-service";
import { OrderResponse, OrderStatus, OrderPaymentStatus, OrderPaginationResponse } from "@/lib/types/order";
import { toast } from "sonner";


export default function OrdersPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-indexed pages
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [filters, setFilters] = useState({
    orderStatus: "all",
    paymentStatus: "all",
    city: "",
    country: "",
    isQrScanned: "all",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  });

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getAllOrders(
          currentPage,
          pageSize,
          "orderDate",
          "desc"
        );
        setOrders(response.content);
        setPagination({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          size: response.size,
          number: response.number,
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, pageSize]);

  // Filter and search logic - client-side filtering for now
  // In a real application, these filters should be sent to the API
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const matchesSearch = 
        order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filters
      const matchesOrderStatus = !filters.orderStatus || filters.orderStatus === "all" || order.orderStatus === filters.orderStatus;
      const matchesPaymentStatus = !filters.paymentStatus || filters.paymentStatus === "all" || order.paymentStatus === filters.paymentStatus;
      
      // Location filters
      const matchesCity = !filters.city || order.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchesCountry = !filters.country || order.country.toLowerCase().includes(filters.country.toLowerCase());
      
      // QR status filter
      const matchesQrStatus = !filters.isQrScanned || filters.isQrScanned === "all" || 
        (filters.isQrScanned === "true" ? order.isQrScanned : !order.isQrScanned);

      // Date filters
      const orderDate = new Date(order.orderDate);
      const matchesStartDate = !filters.startDate || orderDate >= filters.startDate;
      const matchesEndDate = !filters.endDate || orderDate <= filters.endDate;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus && 
             matchesCity && matchesCountry && matchesQrStatus && 
             matchesStartDate && matchesEndDate;
    });
  }, [orders, searchTerm, filters]);

  // For client-side pagination when filtering
  const paginatedOrders = filteredOrders;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filtering (API uses 0-indexed pages)
  };

  const clearFilters = () => {
    setFilters({
      orderStatus: "all",
      paymentStatus: "all",
      city: "",
      country: "",
      isQrScanned: "all",
      startDate: null,
      endDate: null,
    });
    setSearchTerm("");
    setCurrentPage(0); // Reset to first page (API uses 0-indexed pages)
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "secondary";
      case OrderStatus.CONFIRMED:
        return "default";
      case OrderStatus.SHIPPED:
        return "outline";
      case OrderStatus.DELIVERED:
        return "default";
      case OrderStatus.CANCELLED:
        return "destructive";
      case OrderStatus.FAILED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadgeVariant = (status: OrderPaymentStatus) => {
    switch (status) {
      case OrderPaymentStatus.PENDING:
        return "secondary";
      case OrderPaymentStatus.PAID:
        return "default";
      case OrderPaymentStatus.FAILED:
        return "destructive";
      case OrderPaymentStatus.REFUNDED:
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Orders Management</h1>
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
            <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
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
              placeholder="Search by order code, email, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-primary/20 focus-visible:ring-primary"
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                "Loading orders..."
              ) : (
                `Showing ${filteredOrders.length} of ${pagination.totalElements} orders`
              )}
            </p>
            {Object.values(filters).some(value => 
              value !== "all" && value !== "" && value !== null
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
                    onValueChange={(value) => handleFilterChange("orderStatus", value)}
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value={OrderStatus.PENDING}>{OrderStatus.PENDING}</SelectItem>
                      <SelectItem value={OrderStatus.CONFIRMED}>{OrderStatus.CONFIRMED}</SelectItem>
                      <SelectItem value={OrderStatus.SHIPPED}>{OrderStatus.SHIPPED}</SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>{OrderStatus.DELIVERED}</SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>{OrderStatus.CANCELLED}</SelectItem>
                      <SelectItem value={OrderStatus.FAILED}>{OrderStatus.FAILED}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All payments</SelectItem>
                      <SelectItem value={OrderPaymentStatus.PENDING}>{OrderPaymentStatus.PENDING}</SelectItem>
                      <SelectItem value={OrderPaymentStatus.PAID}>{OrderPaymentStatus.PAID}</SelectItem>
                      <SelectItem value={OrderPaymentStatus.FAILED}>{OrderPaymentStatus.FAILED}</SelectItem>
                      <SelectItem value={OrderPaymentStatus.REFUNDED}>{OrderPaymentStatus.REFUNDED}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>QR Scanned</Label>
                  <Select
                    value={filters.isQrScanned}
                    onValueChange={(value) => handleFilterChange("isQrScanned", value)}
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All orders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All orders</SelectItem>
                      <SelectItem value="true">QR Scanned</SelectItem>
                      <SelectItem value="false">Not Scanned</SelectItem>
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
                      <Button variant="outline" className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(filters.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.startDate || undefined}
                        onSelect={(date) => handleFilterChange("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(filters.endDate, "PPP") : "Pick end date"}
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
                  onClick={() => setFiltersOpen(false)}
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
                    onValueChange={(value) => handleFilterChange("orderStatus", value)}
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value={OrderStatus.PENDING}>{OrderStatus.PENDING}</SelectItem>
                      <SelectItem value={OrderStatus.CONFIRMED}>{OrderStatus.CONFIRMED}</SelectItem>
                      <SelectItem value={OrderStatus.SHIPPED}>{OrderStatus.SHIPPED}</SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>{OrderStatus.DELIVERED}</SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>{OrderStatus.CANCELLED}</SelectItem>
                      <SelectItem value={OrderStatus.FAILED}>{OrderStatus.FAILED}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All payments</SelectItem>
                      <SelectItem value={OrderPaymentStatus.PENDING}>{OrderPaymentStatus.PENDING}</SelectItem>
                      <SelectItem value={OrderPaymentStatus.PAID}>{OrderPaymentStatus.PAID}</SelectItem>
                      <SelectItem value={OrderPaymentStatus.FAILED}>{OrderPaymentStatus.FAILED}</SelectItem>
                      <SelectItem value={OrderPaymentStatus.REFUNDED}>{OrderPaymentStatus.REFUNDED}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>QR Scanned</Label>
                  <Select
                    value={filters.isQrScanned}
                    onValueChange={(value) => handleFilterChange("isQrScanned", value)}
                  >
                    <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                      <SelectValue placeholder="All orders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All orders</SelectItem>
                      <SelectItem value="true">QR Scanned</SelectItem>
                      <SelectItem value="false">Not Scanned</SelectItem>
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
                      <Button variant="outline" className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(filters.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.startDate || undefined}
                        onSelect={(date) => handleFilterChange("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal border-primary/20 focus-visible:ring-primary">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(filters.endDate, "PPP") : "Pick end date"}
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
                  <TableHead className="w-[120px]">Order Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">QR Scan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={9} className="h-16 text-center">
                        {index === 2 && "Loading orders..."}
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedOrders.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  // Orders data
                  paginatedOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">{order.orderCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{`${order.firstName} ${order.lastName}`}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(order.orderDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(order.orderStatus)}
                          className={order.orderStatus === OrderStatus.CONFIRMED || order.orderStatus === OrderStatus.DELIVERED ? "bg-primary hover:bg-primary/90" : ""}
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge 
                          variant={getPaymentStatusBadgeVariant(order.paymentStatus)}
                          className={order.paymentStatus === OrderPaymentStatus.PAID ? "bg-primary hover:bg-primary/90" : ""}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          <p>{order.city}</p>
                          <p className="text-muted-foreground">{order.country}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge 
                          variant={order.isQrScanned ? "default" : "secondary"}
                          className={order.isQrScanned ? "bg-primary hover:bg-primary/90" : ""}
                        >
                          {order.isQrScanned ? "Scanned" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/orders/${order.orderId}`)}
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - responsive layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-4 border-t">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <Label className="text-sm">Rows per page:</Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(0); // Reset to first page (API uses 0-indexed pages)
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-20 border-primary/20 focus-visible:ring-primary h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pagination.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 0) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                      aria-disabled={loading || currentPage === 0}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // Display page numbers starting from current page - 2 (if possible)
                    let startPage = Math.max(0, currentPage - 2);
                    const pageNum = startPage + i;
                    
                    // Don't show pages beyond the total
                    if (pageNum >= pagination.totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNum} className="hidden sm:inline-flex">
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                          className={currentPage === pageNum ? "bg-primary hover:bg-primary/90 text-white" : ""}
                          aria-disabled={loading}
                        >
                          {pageNum + 1} {/* Display 1-indexed page numbers to users */}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }).filter(Boolean)}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < pagination.totalPages - 1) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === pagination.totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                      aria-disabled={loading || currentPage === pagination.totalPages - 1}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}