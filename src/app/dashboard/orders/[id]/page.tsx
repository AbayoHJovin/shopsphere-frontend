"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  QrCode,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { OrderStatus, OrderPaymentStatus } from "@/lib/types/order";
import QRScannerModal from "@/components/QRScannerModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orderService } from "@/lib/services/order-service";
import { useToast } from "@/hooks/use-toast";
import { PaymentStatus } from "@/data/mockData";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isValidatingQR, setIsValidatingQR] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
        toast({
          title: "Error",
          description: err.message || "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error || "Order Not Found"}
          </h1>
          <Button
            onClick={() => router.push("/dashboard/orders")}
            className="bg-primary hover:bg-primary/90"
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

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

  // Calculate values
  const shippingCost = order.shippingCost || order.shippingFee || 0;
  const subtotalValue =
    order.totalAmount -
    shippingCost -
    order.taxAmount +
    (order.discountAmount || 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/orders")}
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Order Details
              </h1>
              <p className="text-muted-foreground">Order #{order.orderCode}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Badge
              variant={getStatusBadgeVariant(order.orderStatus)}
              className={
                order.orderStatus === OrderStatus.CONFIRMED ||
                order.orderStatus === OrderStatus.DELIVERED
                  ? "bg-primary hover:bg-primary/90"
                  : ""
              }
            >
              {order.orderStatus}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90"
                  size="sm"
                  disabled={
                    order.orderStatus === OrderStatus.DELIVERED &&
                    order.isQrScanned
                  }
                >
                  <QrCode className="h-4 w-4" />
                  {order.isQrScanned ? "QR Verified" : "QR Options"}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsQRModalOpen(true)}>
                  Scan QR Code
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${order.orderCode}`,
                      "_blank"
                    )
                  }
                >
                  View Test QR Code
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(order.orderDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {format(
                      new Date(order.updatedAt || order.orderDate),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <Badge
                    variant={getPaymentStatusBadgeVariant(order.paymentStatus)}
                    className={
                      order.paymentStatus === PaymentStatus.PAID
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    QR Verification
                  </p>
                  <Badge
                    variant={order.isQrScanned ? "default" : "secondary"}
                    className={
                      order.isQrScanned ? "bg-primary hover:bg-primary/90" : ""
                    }
                  >
                    {order.isQrScanned ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-medium">${subtotalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipping</p>
                  <p className="font-medium">${shippingCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax</p>
                  <p className="font-medium">${order.taxAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discount</p>
                  <p className="font-medium text-green-600">
                    ${(order.discountAmount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items.length} items in this order
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {order.items.map((item: { 
                  orderItemId?: string;
                  productName: string;
                  productId: string;
                  quantity: number;
                  subtotal?: number;
                  totalPrice?: number;
                  price?: number;
                  unitPrice?: number;
                  imageUrl?: string;
                }, index: number) => (
                  <div
                    key={item.orderItemId || index}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Product ID: {item.productId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${((item.subtotal ?? item.totalPrice) ?? 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${((item.price ?? item.unitPrice) ?? 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{`${order.firstName} ${order.lastName}`}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {order.phoneNumber || order.phone}
                </p>
              </div>
              {order.user && (
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium text-xs">{order.user.userId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <p className="font-medium">
                {order.streetAddress || order.address}
              </p>
              <p>
                {order.city}, {order.stateProvince || order.state}
              </p>
              <p>{order.postalCode}</p>
              <p className="font-medium">{order.country}</p>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.transaction && (
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium">
                    {order.transaction.paymentMethod || order.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction ID
                  </p>
                  <p className="font-medium text-xs">
                    {order.transaction.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">
                    {order.transaction.transactionReference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Date
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(order.transaction.transactionDate),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-bold text-primary">
                    ${order.transaction.amount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => {
          // Only allow closing if not in validating state
          if (!isValidatingQR) {
            setIsQRModalOpen(false);
          }
        }}
        orderCode={order.orderCode}
        isValidating={isValidatingQR}
        onSuccess={async (scannedCode) => {
          try {
            // Set validating state to true
            setIsValidatingQR(true);
            
            // Send the scanned code to the backend for validation
            const updatedOrder = await orderService.scanQrCode(scannedCode);
            
            // Update the order data
            setOrder(updatedOrder);
            
            // Show success message
            toast({
              title: "Success",
              description: "Order delivered successfully",
              variant: "default",
            });
            
            // Close the modal only on success
            setIsQRModalOpen(false);
          } catch (err: any) {
            console.error("Error verifying QR code:", err);
            
            // Show error message but keep modal open
            toast({
              title: "Error",
              description: err.message || "Failed to verify QR code",
              variant: "destructive",
            });
          } finally {
            // Reset validating state
            setIsValidatingQR(false);
          }
        }}
      />
    </div>
  );
}
