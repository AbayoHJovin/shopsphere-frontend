"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  deliveryGroupService,
  DeliveryGroupDto,
  BulkAddResult,
} from "@/lib/services/delivery-group-service";
import { CreateGroupModal } from "./CreateGroupModal";
import { toast } from "sonner";

interface DeliveryGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderIds: number[];
  onSuccess: () => void;
}

export function DeliveryGroupDialog({
  open,
  onOpenChange,
  selectedOrderIds,
  onSuccess,
}: DeliveryGroupDialogProps) {
  const [groups, setGroups] = useState<DeliveryGroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkResult, setBulkResult] = useState<BulkAddResult | null>(null);
  const [showBulkResult, setShowBulkResult] = useState(false);

  const isBulkMode = selectedOrderIds.length > 1;

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open, currentPage]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await deliveryGroupService.getAvailableGroups(
        currentPage,
        10
      );
      setGroups(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load delivery groups");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToGroup = async () => {
    if (!selectedGroupId) return;

    try {
      setAssigning(true);
      const result = await deliveryGroupService.bulkAddOrdersToGroup(
        selectedGroupId,
        selectedOrderIds
      );
      setBulkResult(result);
      setShowBulkResult(true);

      if (result.successfullyAdded > 0) {
        toast.success(
          `Successfully assigned ${result.successfullyAdded} order(s) to group`
        );
        onSuccess();
      }

      if (result.skipped > 0) {
        toast.warning(`${result.skipped} order(s) were skipped`);
      }

      fetchGroups(); // Refresh groups
    } catch (error) {
      console.error("Error assigning orders to group:", error);
      toast.error("Failed to assign orders to group");
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateGroupSuccess = (newGroup: DeliveryGroupDto) => {
    setCreateGroupOpen(false);
    fetchGroups();
    setSelectedGroupId(newGroup.deliveryGroupId);
    toast.success("Group created successfully");
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.deliveryGroupName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      group.delivererName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "READY":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isBulkMode
                ? "Assign Orders to Delivery Group"
                : "Assign Order to Delivery Group"}
            </DialogTitle>
            <DialogDescription>
              {isBulkMode
                ? `Select a delivery group to assign ${selectedOrderIds.length} orders to`
                : "Select a delivery group to assign this order to"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto">
            {/* Search and Create Group */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search groups by name or deliverer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setCreateGroupOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            {/* Groups Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Available Delivery Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading groups...
                    </span>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No delivery groups found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Deliverer</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => (
                        <TableRow
                          key={group.deliveryGroupId}
                          className={
                            selectedGroupId === group.deliveryGroupId
                              ? "bg-primary/5"
                              : ""
                          }
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {group.deliveryGroupName}
                              </div>
                              {group.deliveryGroupDescription && (
                                <div className="text-sm text-muted-foreground">
                                  {group.deliveryGroupDescription}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {group.delivererName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {group.memberCount} orders
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(group.status)}
                            >
                              {group.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(group.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() =>
                                setSelectedGroupId(group.deliveryGroupId)
                              }
                              disabled={group.hasDeliveryStarted}
                            >
                              {selectedGroupId === group.deliveryGroupId ? (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              ) : (
                                <Plus className="h-4 w-4 mr-1" />
                              )}
                              {selectedGroupId === group.deliveryGroupId
                                ? "Selected"
                                : "Select"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Selected Group Info */}
            {selectedGroupId && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Selected group:{" "}
                  {
                    groups.find((g) => g.deliveryGroupId === selectedGroupId)
                      ?.deliveryGroupName
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignToGroup}
              disabled={!selectedGroupId || assigning}
            >
              {assigning ? "Assigning..." : `Assign to Group`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onSuccess={handleCreateGroupSuccess}
        selectedOrderIds={selectedOrderIds}
      />

      {/* Bulk Result Modal */}
      <Dialog open={showBulkResult} onOpenChange={setShowBulkResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assignment Results</DialogTitle>
            <DialogDescription>
              Summary of the bulk assignment operation
            </DialogDescription>
          </DialogHeader>

          {bulkResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {bulkResult.successfullyAdded}
                  </div>
                  <div className="text-sm text-green-600">
                    Successfully Added
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {bulkResult.skipped}
                  </div>
                  <div className="text-sm text-yellow-600">Skipped</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {bulkResult.totalRequested}
                  </div>
                  <div className="text-sm text-blue-600">Total Requested</div>
                </div>
              </div>

              {bulkResult.skippedOrders.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skipped Orders:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {bulkResult.skippedOrders.map((skipped, index) => (
                      <div
                        key={index}
                        className="p-2 bg-yellow-50 rounded text-sm"
                      >
                        <div className="font-medium">
                          Order #{skipped.orderId}
                        </div>
                        <div className="text-yellow-600">
                          {skipped.reason}: {skipped.details}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowBulkResult(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
