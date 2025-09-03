"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  rewardSystemService,
  RewardSystemDTO,
  RewardRangeDTO,
} from "@/lib/services/reward-system-service";
import { Plus, Trash2 } from "lucide-react";

interface RewardRangesProps {
  rewardSystem: RewardSystemDTO;
  onUpdate: (updatedSystem: RewardSystemDTO) => void;
}

export function RewardRanges({ rewardSystem, onUpdate }: RewardRangesProps) {
  const [loading, setLoading] = useState(false);
  const [ranges, setRanges] = useState<RewardRangeDTO[]>(
    rewardSystem.rewardRanges || []
  );
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [newRange, setNewRange] = useState<Partial<RewardRangeDTO>>({
    rangeType: "QUANTITY",
    minValue: 0,
    maxValue: undefined,
    points: 0,
    description: "",
  });

  const handleAddRange = async () => {
    if (
      !newRange.rangeType ||
      newRange.minValue === undefined ||
      newRange.points === undefined
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const rangeToAdd: RewardRangeDTO = {
        ...(newRange as RewardRangeDTO),
        rewardSystemId: rewardSystem.id,
      };

      const updatedSystem = await rewardSystemService.saveRewardSystem({
        ...rewardSystem,
        rewardRanges: [...ranges, rangeToAdd],
      });

      setRanges(updatedSystem.rewardRanges || []);
      onUpdate(updatedSystem);
      setNewRange({
        rangeType: "QUANTITY",
        minValue: 0,
        maxValue: undefined,
        points: 0,
        description: "",
      });
      setShowForm(false);
      toast({
        title: "Success",
        description: "Reward range added successfully",
      });
    } catch (error: any) {
      console.error("Failed to add reward range:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add reward range",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRange = async (rangeId: number) => {
    try {
      setLoading(true);
      const updatedRanges = ranges.filter((range) => range.id !== rangeId);

      const updatedSystem = await rewardSystemService.saveRewardSystem({
        ...rewardSystem,
        rewardRanges: updatedRanges,
      });

      setRanges(updatedSystem.rewardRanges || []);
      onUpdate(updatedSystem);
      toast({
        title: "Success",
        description: "Reward range deleted successfully",
      });
    } catch (error: any) {
      console.error("Failed to delete reward range:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete reward range",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRangeTypeLabel = (type: string) => {
    return type === "QUANTITY" ? "Product Quantity" : "Order Amount";
  };

  const getRangeTypeUnit = (type: string) => {
    return type === "QUANTITY" ? "items" : "$";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reward Ranges</CardTitle>
          <CardDescription>
            Configure reward ranges for quantity and amount-based rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Reward Range
            </Button>
          )}

          {showForm && (
            <Card className="border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Add New Reward Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rangeType">Range Type</Label>
                    <Select
                      value={newRange.rangeType}
                      onValueChange={(value) =>
                        setNewRange({
                          ...newRange,
                          rangeType: value as "QUANTITY" | "AMOUNT",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUANTITY">
                          Product Quantity
                        </SelectItem>
                        <SelectItem value="AMOUNT">Order Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minValue">Minimum Value</Label>
                    <Input
                      id="minValue"
                      type="number"
                      min="0"
                      value={newRange.minValue || ""}
                      onChange={(e) =>
                        setNewRange({
                          ...newRange,
                          minValue: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxValue">Maximum Value (Optional)</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      min="0"
                      value={newRange.maxValue || ""}
                      onChange={(e) =>
                        setNewRange({
                          ...newRange,
                          maxValue: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Points to Award</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={newRange.points || ""}
                      onChange={(e) =>
                        setNewRange({
                          ...newRange,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newRange.description || ""}
                    onChange={(e) =>
                      setNewRange({ ...newRange, description: e.target.value })
                    }
                    placeholder="e.g., Bonus points for large orders"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRange} disabled={loading}>
                    {loading ? "Saving..." : "Add Range"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Reward Ranges</h3>

            {ranges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reward ranges configured yet. Add your first range above.
              </div>
            ) : (
              <div className="space-y-3">
                {ranges.map((range) => (
                  <Card key={range.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">
                            {getRangeTypeLabel(range.rangeType)}
                          </Badge>
                          <span className="font-medium">
                            {range.minValue} {getRangeTypeUnit(range.rangeType)}
                            {range.maxValue &&
                              ` - ${range.maxValue} ${getRangeTypeUnit(
                                range.rangeType
                              )}`}
                            {!range.maxValue && "+"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Points: {range.points}</span>
                          {range.description && (
                            <span className="italic">
                              "{range.description}"
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => range.id && handleDeleteRange(range.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
