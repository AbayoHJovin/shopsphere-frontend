"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Calendar, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  deliveryGroupService,
  AgentDto,
  DeliveryGroupDto,
} from "@/lib/services/delivery-group-service";
import { toast } from "sonner";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (group: DeliveryGroupDto) => void;
  selectedOrderIds: number[];
}

export function CreateGroupModal({
  open,
  onOpenChange,
  selectedOrderIds,
  onSuccess,
}: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    deliveryGroupName: "",
    deliveryGroupDescription: "",
    delivererId: "",
  });
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [creating, setCreating] = useState(false);
  const [autoAssignOrders, setAutoAssignOrders] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreAgents, setHasMoreAgents] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [open, currentPage]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await deliveryGroupService.getAvailableAgents(
        currentPage,
        20
      );
      if (currentPage === 0) {
        setAgents(response.data);
      } else {
        setAgents((prev) => [...prev, ...response.data]);
      }
      setHasMoreAgents(response.pagination.hasNext);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load delivery agents");
    } finally {
      setLoadingAgents(false);
    }
  };

  const loadMoreAgents = () => {
    if (!loadingAgents && hasMoreAgents) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deliveryGroupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (!formData.delivererId) {
      toast.error("Please select a delivery agent");
      return;
    }

    try {
      setCreating(true);
      const request = {
        ...formData,
        orderIds: autoAssignOrders ? selectedOrderIds : undefined,
      };

      const newGroup = await deliveryGroupService.createGroup(request);
      onSuccess(newGroup);

      // Reset form
      setFormData({
        deliveryGroupName: "",
        deliveryGroupDescription: "",
        delivererId: "",
      });
      setAutoAssignOrders(true);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create delivery group");
    } finally {
      setCreating(false);
    }
  };

  const selectedAgent = agents.find(
    (agent) => agent.agentId === formData.delivererId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Delivery Group
          </DialogTitle>
          <DialogDescription>
            Create a new delivery group and optionally assign orders to it
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto">
          {/* Group Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                placeholder="Enter group name..."
                value={formData.deliveryGroupName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryGroupName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter group description..."
                value={formData.deliveryGroupDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryGroupDescription: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-4">
            <Label>Delivery Agent *</Label>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {loadingAgents && agents.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading agents...
                  </span>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {agents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className={`p-3 rounded-lg border transition-colors ${
                        formData.delivererId === agent.agentId
                          ? "border-primary bg-primary/5"
                          : agent.hasAGroup
                          ? "border-border bg-gray-100 cursor-not-allowed opacity-60"
                          : "border-border hover:bg-muted/50 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!agent.hasAGroup) {
                          setFormData((prev) => ({
                            ...prev,
                            delivererId: agent.agentId,
                          }));
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {agent.firstName} {agent.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {agent.email}
                          </div>
                          {agent.phoneNumber && (
                            <div className="text-sm text-muted-foreground">
                              {agent.phoneNumber}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.hasAGroup ? (
                            <Badge variant="destructive">
                              Busy ({agent.activeGroupCount}/5)
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              Available ({agent.activeGroupCount}/5)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMoreAgents && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMoreAgents}
                      disabled={loadingAgents}
                      className="w-full"
                    >
                      {loadingAgents ? "Loading..." : "Load More Agents"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Agent Info */}
          {selectedAgent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selected agent:{" "}
                <strong>
                  {selectedAgent.firstName} {selectedAgent.lastName}
                </strong>
                {selectedAgent.hasAGroup ? (
                  <span className="text-red-600 ml-2">
                    (Busy - has {selectedAgent.activeGroupCount} active groups, max 5 allowed)
                  </span>
                ) : (
                  <span className="text-green-600 ml-2">
                    (Available - has {selectedAgent.activeGroupCount} active groups)
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Auto-assign Orders */}
          {selectedOrderIds.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoAssign"
                  checked={autoAssignOrders}
                  onCheckedChange={(checked) =>
                    setAutoAssignOrders(checked === true)
                  }
                />
                <Label htmlFor="autoAssign" className="text-sm">
                  Automatically assign {selectedOrderIds.length} selected
                  order(s) to this group
                </Label>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              creating ||
              !formData.deliveryGroupName.trim() ||
              !formData.delivererId
            }
          >
            {creating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
