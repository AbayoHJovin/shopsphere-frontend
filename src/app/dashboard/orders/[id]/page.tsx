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
  Edit3,
  Check,
  X,
  Plus,
  Truck,
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
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderService } from "@/lib/services/order-service";
import { userService, UserDTO } from "@/lib/services/user-service";
import {
  AdminOrderDTO,
  OrderStatus,
  OrderPaymentStatus,
} from "@/lib/types/order";
import { toast } from "sonner";
import { format } from "date-fns";
import { TruncatedText } from "@/components/ui/truncated-text";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // Delivery assignment state
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryAgents, setDeliveryAgents] = useState<UserDTO[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<UserDTO[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Filter delivery agents based on search term
  useEffect(() => {
    if (!agentSearchTerm.trim()) {
      setFilteredAgents(deliveryAgents);
    } else {
      const filtered = deliveryAgents.filter(
        (agent) =>
          agent.firstName
            .toLowerCase()
            .includes(agentSearchTerm.toLowerCase()) ||
          agent.lastName
            .toLowerCase()
            .includes(agentSearchTerm.toLowerCase()) ||
          agent.userEmail
            .toLowerCase()
            .includes(agentSearchTerm.toLowerCase()) ||
          `${agent.firstName} ${agent.lastName}`
            .toLowerCase()
            .includes(agentSearchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    }
  }, [deliveryAgents, agentSearchTerm]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;

    try {
      setUpdating(true);
      const updatedOrder = await orderService.updateOrderStatus(
        order.id,
        newStatus
      );
      setOrder(updatedOrder);
      setStatusUpdateOpen(false);
      setNewStatus("");
      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const openStatusUpdate = () => {
    setNewStatus(order?.status || "");
    setStatusUpdateOpen(true);
  };

  const openDeliveryModal = async () => {
    setSelectedAgent("");
    setAgentSearchTerm("");
    setDeliveryModalOpen(true);
    setLoadingAgents(true);

    try {
      const response = await userService.getDeliveryAgents(0, 100);
      setDeliveryAgents(response.content);
      setFilteredAgents(response.content);
    } catch (error) {
      console.error("Error fetching delivery agents:", error);
      toast.error("Failed to load delivery agents. Please try again.");
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleDeliveryAssignment = async () => {
    if (!selectedAgent || !order) return;

    try {
      setAssigning(true);
      await userService.assignDeliveryAgent(order.id, selectedAgent);
      setDeliveryModalOpen(false);
      setSelectedAgent("");
      setAgentSearchTerm("");
      toast.success("Delivery agent assigned successfully!");
    } catch (error) {
      console.error("Error assigning delivery agent:", error);
      toast.error("Failed to assign delivery agent. Please try again.");
    } finally {
      setAssigning(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground">
                The order you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.orderNumber}</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
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
            {order.paymentInfo?.paymentStatus && (
              <Badge
                variant={getPaymentStatusBadgeVariant(
                  order.paymentInfo.paymentStatus
                )}
                className={
                  order.paymentInfo.paymentStatus ===
                  OrderPaymentStatus.COMPLETED
                    ? "bg-primary hover:bg-primary/90"
                    : ""
                }
              >
                {order.paymentInfo.paymentStatus}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openDeliveryModal}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Assign Delivery
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openStatusUpdate}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Order Number
                  </label>
                  <div className="mt-1">
                    <TruncatedText
                      text={order.orderNumber}
                      maxLength={20}
                      className="font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Customer
                  </label>
                  <div className="mt-1">
                    {order.customerName ? (
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-sm text-muted-foreground">
                            {order.customerEmail}
                          </p>
                        )}
                        {order.customerPhone && (
                          <p className="text-sm text-muted-foreground">
                            {order.customerPhone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <TruncatedText
                        text={order.userId}
                        maxLength={16}
                        className="font-medium"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="font-medium">
                    {format(new Date(order.createdAt), "PPP 'at' p")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="font-medium">
                    {format(new Date(order.updatedAt), "PPP 'at' p")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items?.length || 0} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex gap-4 items-start p-4 border rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product?.images &&
                          item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name || "Product"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                const nextElement =
                                  target.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex items-center justify-center text-gray-400"
                            style={{
                              display:
                                item.product?.images &&
                                item.product.images.length > 0
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            <Package className="h-6 w-6" />
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.product?.name ||
                            `Product ID: ${item.productId}`}
                        </h4>
                        {item.product?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Quantity: {item.quantity}</span>
                          <span>
                            Price: ${item.price?.toFixed(2) || "0.00"}
                          </span>
                          {item.availableStock !== undefined && (
                            <span>Stock: {item.availableStock}</span>
                          )}
                        </div>
                        {item.variantId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Variant ID: {item.variantId}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium">
                          $
                          {item.totalPrice?.toFixed(2) ||
                            (item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items found for this order</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              {order.tax && order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.shipping && order.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
              )}
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${order.total?.toFixed(2) || "0.00"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
                <CardDescription>
                  Complete address information for delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Street Address
                  </label>
                  <p className="text-sm font-medium">
                    {order.shippingAddress.street || "Not provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      City
                    </label>
                    <p className="text-sm">
                      {order.shippingAddress.city || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      State
                    </label>
                    <p className="text-sm">
                      {order.shippingAddress.state || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Zip Code
                    </label>
                    <p className="text-sm">
                      {order.shippingAddress.zipCode || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Country
                    </label>
                    <p className="text-sm font-medium">
                      {order.shippingAddress.country || "Not provided"}
                    </p>
                  </div>
                </div>

                {order.shippingAddress.phone && (
                  <div className="pt-2 border-t">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Contact Phone
                    </label>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.paymentInfo?.paymentMethod && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </label>
                  <p className="text-sm">{order.paymentInfo.paymentMethod}</p>
                </div>
              )}
              {order.paymentInfo?.paymentStatus && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={getPaymentStatusBadgeVariant(
                        order.paymentInfo.paymentStatus
                      )}
                      className={
                        order.paymentInfo.paymentStatus ===
                        OrderPaymentStatus.COMPLETED
                          ? "bg-primary hover:bg-primary/90"
                          : ""
                      }
                    >
                      {order.paymentInfo.paymentStatus}
                    </Badge>
                  </div>
                </div>
              )}
              {order.paymentInfo?.transactionRef && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Transaction Reference
                  </label>
                  <div className="mt-1">
                    <TruncatedText
                      text={order.paymentInfo.transactionRef}
                      maxLength={16}
                      className="font-medium text-xs"
                    />
                  </div>
                </div>
              )}
              {order.paymentInfo?.paymentDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Date
                  </label>
                  <p className="text-sm">
                    {format(
                      new Date(order.paymentInfo.paymentDate),
                      "PPP 'at' p"
                    )}
                  </p>
                </div>
              )}
              {order.paymentInfo?.receiptUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Receipt
                  </label>
                  <a
                    href={order.paymentInfo.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    View Receipt
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {(order.trackingNumber || order.estimatedDelivery) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.trackingNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tracking Number
                    </label>
                    <div className="mt-1">
                      <TruncatedText
                        text={order.trackingNumber}
                        maxLength={16}
                        className="font-medium"
                      />
                    </div>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Estimated Delivery
                    </label>
                    <p className="text-sm">{order.estimatedDelivery}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{order?.orderNumber}. This will update
              the order for both admin and customer views.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <p className="text-sm text-muted-foreground">{order?.status}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
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
                  <SelectItem value={OrderStatus.REFUNDED}>
                    {OrderStatus.REFUNDED}
                  </SelectItem>
                  <SelectItem value={OrderStatus.RETURNED}>
                    {OrderStatus.RETURNED}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusUpdateOpen(false)}
              disabled={updating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || !newStatus || newStatus === order?.status}
            >
              {updating ? (
                "Updating..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Assignment Dialog */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Assign Delivery Agent
            </DialogTitle>
            <DialogDescription>
              Select a delivery agent to assign to order #{order?.orderNumber}.
              The agent will be responsible for delivering this order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {loadingAgents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading delivery agents...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Search Delivery Agents
                  </label>
                  <Input
                    placeholder="Search by name or email..."
                    value={agentSearchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAgentSearchTerm(e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Delivery Agent
                  </label>
                  <Select
                    value={selectedAgent}
                    onValueChange={setSelectedAgent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a delivery agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAgents.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          {agentSearchTerm
                            ? "No agents found matching your search"
                            : "No delivery agents available"}
                        </div>
                      ) : (
                        filteredAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                {agent.firstName} {agent.lastName}
                              </span>
                              <span className="text-muted-foreground">
                                ({agent.userEmail})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {selectedAgent && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Selected Agent:</p>
                    {(() => {
                      const agent = deliveryAgents.find(
                        (a) => a.id === selectedAgent
                      );
                      return agent ? (
                        <div className="mt-1 text-sm text-muted-foreground">
                          <p>
                            <strong>
                              {agent.firstName} {agent.lastName}
                            </strong>
                          </p>
                          <p>{agent.userEmail}</p>
                          {agent.phoneNumber && <p>{agent.phoneNumber}</p>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeliveryModalOpen(false);
                setSelectedAgent("");
                setAgentSearchTerm("");
              }}
              disabled={assigning}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleDeliveryAssignment}
              disabled={assigning || !selectedAgent || loadingAgents}
            >
              {assigning ? (
                "Assigning..."
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Assign Agent
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
