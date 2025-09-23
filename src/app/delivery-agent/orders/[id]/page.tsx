"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  User,
  FileText,
  Check,
  X,
  Truck,
  Phone,
  Mail,
  QrCode,
  Camera,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  deliveryAgentService,
  OrderDTO,
} from "@/lib/services/delivery-agent-service";
import QRScannerModal from "@/components/QRScannerModal";
import { orderService } from "@/lib/services/order-service";

export default function DeliveryAgentOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await deliveryAgentService.getOrderDetails(
          parseInt(orderId)
        );
        setOrder(orderData);
      } catch (err) {
        setError("Failed to fetch order details");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleQRScanSuccess = async (scannedCode: string) => {
    try {
      setIsVerifying(true);
      setVerificationResult(null);

      // Verify the delivery using the scanned pickup token
      const result = await orderService.verifyDelivery(scannedCode);

      if (result.success) {
        setVerificationResult({
          success: true,
          message: "Delivery verified successfully! Order marked as delivered.",
        });
        // Refresh order data to show updated status
        const updatedOrder = await deliveryAgentService.getOrderDetails(
          parseInt(orderId)
        );
        setOrder(updatedOrder);
      } else {
        setVerificationResult({
          success: false,
          message: result.message || "Verification failed",
        });
      }
    } catch (error: any) {
      setVerificationResult({
        success: false,
        message: error.message || "An error occurred during verification",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsVerifying(true);
      setVerificationResult(null);

      const QrScanner = (await import("qr-scanner")).default;
      const result = await QrScanner.scanImage(file);

      if (result) {
        await handleQRScanSuccess(result);
      } else {
        setVerificationResult({
          success: false,
          message: "No QR code found in the uploaded image",
        });
      }
    } catch (error: any) {
      setVerificationResult({
        success: false,
        message: error.message || "Failed to scan QR code from image",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "READY_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
          <p className="text-muted-foreground mb-4">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="relative group">
                      {item.product?.images &&
                      item.product.images.length > 0 ? (
                        <div className="relative">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name || "Product"}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = "/api/placeholder/100/100";
                            }}
                          />
                          {item.product.images.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {item.product.images.length}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.product?.name || "Product"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      {item.product?.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress?.streetAddress || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress?.city || "N/A"},{" "}
                      {order.shippingAddress?.state || "N/A"}{" "}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress?.country || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {order.customerPhone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {order.customerName?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {order.customerName || "Customer"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerEmail}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Order Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code Verification */}
          {order.status !== "DELIVERED" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Verify Delivery
                </CardTitle>
                <CardDescription>
                  Scan the customer's QR code to verify delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Verification Result */}
                  {verificationResult && (
                    <div
                      className={`p-4 rounded-lg ${
                        verificationResult.success
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {verificationResult.success ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                        <p
                          className={`text-sm font-medium ${
                            verificationResult.success
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {verificationResult.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verification Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Camera Scan */}
                    <Button
                      onClick={() => setShowQRScanner(true)}
                      disabled={isVerifying}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {isVerifying ? "Verifying..." : "Scan with Camera"}
                    </Button>

                    {/* Image Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isVerifying}
                        className="sr-only"
                        id="qr-image-upload"
                      />
                      <Button
                        variant="outline"
                        disabled={isVerifying}
                        onClick={() => {
                          const fileInput = document.getElementById(
                            "qr-image-upload"
                          ) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                        className="w-full flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isVerifying ? "Processing..." : "Upload Image"}
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Instructions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ask the customer to show their pickup QR code</li>
                      <li>Use camera scan for real-time scanning</li>
                      <li>Or upload a photo of the QR code</li>
                      <li>
                        Once verified, the order will be marked as delivered
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Completed */}
          {order.status === "DELIVERED" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Delivery Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="bg-green-100 p-4 rounded-full w-fit mx-auto">
                    <Check className="h-12 w-12 text-green-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-green-700">
                      Order Successfully Delivered
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This order has been verified and marked as delivered.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        orderCode={order?.orderNumber || ""}
        onSuccess={handleQRScanSuccess}
        isValidating={isVerifying}
      />
    </div>
  );
}
