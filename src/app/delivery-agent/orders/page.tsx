"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Square,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deliveryAgentService,
  DeliveryGroupDto,
  OrderDTO,
} from "@/lib/services/delivery-agent-service";
import { toast } from "sonner";

export default function DeliveryAgentOrdersPage() {
  const [deliveryGroups, setDeliveryGroups] = useState<DeliveryGroupDto[]>([]);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [groupOrders, setGroupOrders] = useState<Record<number, OrderDTO[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
    groupId: number;
  } | null>(null);

  useEffect(() => {
    fetchDeliveryGroups();
  }, []);

  const fetchDeliveryGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await deliveryAgentService.getDashboardData();
      // Combine current and completed groups for the orders view
      const allGroups = [...dashboardData.currentGroups, ...dashboardData.completedGroups];
      setDeliveryGroups(allGroups);
    } catch (err) {
      setError("Failed to load delivery groups");
      console.error("Error fetching delivery groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersForGroup = async (groupId: number) => {
    try {
      setLoadingOrders(groupId);
      const orders = await deliveryAgentService.getOrdersForGroup(groupId);
      setGroupOrders((prev) => ({
        ...prev,
        [groupId]: orders,
      }));
    } catch (err) {
      console.error("Error fetching orders for group:", err);
    } finally {
      setLoadingOrders(null);
    }
  };

  const toggleGroupExpansion = (groupId: number) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
      if (!groupOrders[groupId]) {
        fetchOrdersForGroup(groupId);
      }
    }
  };

  const startDelivery = async (groupId: number) => {
    try {
      setActionLoading(groupId);
      setActionResult(null);

      const result = await deliveryAgentService.startDelivery(groupId);

      const successMessage = result.message || "Delivery started successfully!";
      setActionResult({
        success: true,
        message: successMessage,
        groupId: groupId,
      });
      toast.success(successMessage);

      // Refresh delivery groups to show updated status
      await fetchDeliveryGroups();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to start delivery";
      setActionResult({
        success: false,
        message: errorMessage,
        groupId: groupId,
      });
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const finishDelivery = async (groupId: number) => {
    try {
      setActionLoading(groupId);
      setActionResult(null);

      const result = await deliveryAgentService.finishDelivery(groupId);

      const successMessage = result.message || "Delivery finished successfully!";
      setActionResult({
        success: true,
        message: successMessage,
        groupId: groupId,
      });
      toast.success(successMessage);

      // Refresh delivery groups to show updated status
      await fetchDeliveryGroups();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to finish delivery";
      setActionResult({
        success: false,
        message: errorMessage,
        groupId: groupId,
      });
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const getGroupStatus = (group: DeliveryGroupDto) => {
    if (group.hasDeliveryFinished) {
      return { label: "Completed", variant: "default", className: "bg-green-100 text-green-800" };
    } else if (group.hasDeliveryStarted) {
      return { label: "In Progress", variant: "default", className: "bg-blue-100 text-blue-800" };
    } else {
      return { label: "Pending", variant: "secondary", className: "bg-yellow-100 text-yellow-800" };
    }
  };

  const filteredGroups = deliveryGroups.filter((group) => {
    const matchesSearch = group.deliveryGroupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.deliveryGroupDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    
    const status = getGroupStatus(group);
    return matchesSearch && status.label.toLowerCase() === statusFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDeliveryGroups}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage your delivery groups and orders
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Package className="mr-1 h-3 w-3" />
          {filteredGroups.length} Groups
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search delivery groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Result */}
      {actionResult && (
        <div
          className={`p-4 rounded-lg border ${
            actionResult.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionResult.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            <p className="font-medium">{actionResult.message}</p>
          </div>
        </div>
      )}

      {/* Delivery Groups */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const status = getGroupStatus(group);
            return (
              <Card key={group.deliveryGroupId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {group.deliveryGroupName}
                      </CardTitle>
                      <CardDescription>
                        {group.deliveryGroupDescription}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={status.variant as any}
                        className={status.className}
                      >
                        {status.label}
                      </Badge>
                      {!group.hasDeliveryStarted && (
                        <Button
                          size="sm"
                          onClick={() => startDelivery(group.deliveryGroupId)}
                          disabled={actionLoading === group.deliveryGroupId}
                          className="flex items-center gap-1"
                        >
                          {actionLoading === group.deliveryGroupId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          Start Delivery
                        </Button>
                      )}
                      {group.hasDeliveryStarted && !group.hasDeliveryFinished && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => finishDelivery(group.deliveryGroupId)}
                          disabled={actionLoading === group.deliveryGroupId}
                          className="flex items-center gap-1"
                        >
                          {actionLoading === group.deliveryGroupId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                          Finish Delivery
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created: {formatDate(group.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {group.memberCount} orders
                        </div>
                        {group.hasDeliveryStarted && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Started: {formatDate(group.createdAt)}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupExpansion(group.deliveryGroupId)}
                        className="flex items-center gap-1"
                        disabled={loadingOrders === group.deliveryGroupId}
                      >
                        {loadingOrders === group.deliveryGroupId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : expandedGroupId === group.deliveryGroupId ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide Orders
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            View Orders
                          </>
                        )}
                      </Button>
                    </div>

                    {expandedGroupId === group.deliveryGroupId && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <Separator />
                        <div className="space-y-3">
                          {groupOrders[group.deliveryGroupId]?.map((order) => (
                            <div
                              key={order.id}
                              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => {
                                window.location.href = `/delivery-agent/orders/${order.id}`;
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {order.orderNumber}
                                    </span>
                                  </div>
                                  <Badge variant="outline">{order.status}</Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {formatCurrency(order.totalAmount)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {order.items.length} item
                                    {order.items.length !== 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {order.customerName}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {order.shippingAddress.street}, {order.shippingAddress.city}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || statusFilter !== "all"
                ? "No delivery groups match your current filters. Try adjusting your search criteria."
                : "You don't have any delivery groups assigned at the moment. Check back later or contact your supervisor for new assignments."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
