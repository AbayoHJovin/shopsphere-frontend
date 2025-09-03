"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { rewardSystemService } from "@/lib/services/reward-system-service";
import { RewardSystemDTO, RewardRangeDTO } from "@/lib/types/reward-system";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function CreateRewardSystemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<RewardSystemDTO>({
    pointValue: 0.01,
    isActive: false,
    isSystemEnabled: true,
    isReviewPointsEnabled: false,
    reviewPointsAmount: 10,
    isSignupPointsEnabled: false,
    signupPointsAmount: 50,
    isPurchasePointsEnabled: false,
    isQuantityBasedEnabled: false,
    isAmountBasedEnabled: false,
    isPercentageBasedEnabled: false,
    percentageRate: 0.01,
    description: "",
    rewardRanges: [],
  });

  const [ranges, setRanges] = useState<RewardRangeDTO[]>([]);

  const handleInputChange = (field: keyof RewardSystemDTO, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field: keyof RewardSystemDTO, value: boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addRange = (type: "QUANTITY" | "AMOUNT") => {
    const newRange: RewardRangeDTO = {
      rangeType: type,
      minValue: 0,
      maxValue: undefined,
      points: 0,
      description: "",
    };
    setRanges((prev) => [...prev, newRange]);
  };

  const updateRange = (
    index: number,
    field: keyof RewardRangeDTO,
    value: any
  ) => {
    setRanges((prev) =>
      prev.map((range, i) =>
        i === index ? { ...range, [field]: value } : range
      )
    );
  };

  const removeRange = (index: number) => {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const systemToSave = {
        ...config,
        rewardRanges: ranges,
      };

      const savedSystem = await rewardSystemService.saveRewardSystem(
        systemToSave
      );

      toast({
        title: "Success",
        description: "Reward system created successfully",
      });

      router.push("/dashboard/reward-system");
    } catch (error: any) {
      console.error("Failed to create reward system:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create reward system",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return config.pointValue > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Reward System
          </h1>
          <p className="text-muted-foreground">
            Configure your new reward system with points, ranges, and rules
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>
                Set up the fundamental reward system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pointValue">Point Value ($)</Label>
                <Input
                  id="pointValue"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={config.pointValue}
                  onChange={(e) =>
                    handleInputChange(
                      "pointValue",
                      parseFloat(e.target.value) || 0.01
                    )
                  }
                  placeholder="0.01"
                />
                <p className="text-sm text-muted-foreground">
                  How much each point is worth in dollars
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your reward system..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for the entire reward system
                  </p>
                </div>
                <Switch
                  checked={config.isSystemEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle("isSystemEnabled", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Points</CardTitle>
              <CardDescription>
                Configure points awarded for product reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Review Points</Label>
                  <p className="text-sm text-muted-foreground">
                    Award points when users write reviews
                  </p>
                </div>
                <Switch
                  checked={config.isReviewPointsEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle("isReviewPointsEnabled", checked)
                  }
                />
              </div>

              {config.isReviewPointsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reviewPointsAmount">Points per Review</Label>
                  <Input
                    id="reviewPointsAmount"
                    type="number"
                    min="1"
                    value={config.reviewPointsAmount}
                    onChange={(e) =>
                      handleInputChange(
                        "reviewPointsAmount",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="10"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signup Points</CardTitle>
              <CardDescription>
                Configure points awarded for new user registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Signup Points</Label>
                  <p className="text-sm text-muted-foreground">
                    Award points when new users sign up
                  </p>
                </div>
                <Switch
                  checked={config.isSignupPointsEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle("isSignupPointsEnabled", checked)
                  }
                />
              </div>

              {config.isSignupPointsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="signupPointsAmount">Points for Signup</Label>
                  <Input
                    id="signupPointsAmount"
                    type="number"
                    min="1"
                    value={config.signupPointsAmount}
                    onChange={(e) =>
                      handleInputChange(
                        "signupPointsAmount",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="50"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Points</CardTitle>
              <CardDescription>
                Configure points awarded for purchases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Purchase Points</Label>
                  <p className="text-sm text-muted-foreground">
                    Award points when users make purchases
                  </p>
                </div>
                <Switch
                  checked={config.isPurchasePointsEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle("isPurchasePointsEnabled", checked)
                  }
                />
              </div>

              {config.isPurchasePointsEnabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Quantity-Based Rewards</Label>
                      <p className="text-sm text-muted-foreground">
                        Award points based on product quantity
                      </p>
                    </div>
                    <Switch
                      checked={config.isQuantityBasedEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle("isQuantityBasedEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Amount-Based Rewards</Label>
                      <p className="text-sm text-muted-foreground">
                        Award points based on order amount
                      </p>
                    </div>
                    <Switch
                      checked={config.isAmountBasedEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle("isAmountBasedEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Percentage-Based Rewards</Label>
                      <p className="text-sm text-muted-foreground">
                        Award points as percentage of order value
                      </p>
                    </div>
                    <Switch
                      checked={config.isPercentageBasedEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle("isPercentageBasedEnabled", checked)
                      }
                    />
                  </div>

                  {config.isPercentageBasedEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="percentageRate">
                        Percentage Rate (%)
                      </Label>
                      <Input
                        id="percentageRate"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={config.percentageRate}
                        onChange={(e) =>
                          handleInputChange(
                            "percentageRate",
                            parseFloat(e.target.value) || 0.01
                          )
                        }
                        placeholder="1.00"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {(config.isQuantityBasedEnabled || config.isAmountBasedEnabled) && (
            <Card>
              <CardHeader>
                <CardTitle>Reward Ranges</CardTitle>
                <CardDescription>
                  Define specific ranges for quantity and amount-based rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.isQuantityBasedEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Quantity-Based Ranges</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRange("QUANTITY")}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Range
                      </Button>
                    </div>
                    {ranges
                      .filter((range) => range.rangeType === "QUANTITY")
                      .map((range, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 border rounded-lg"
                        >
                          <Input
                            type="number"
                            min="0"
                            placeholder="Min"
                            value={range.minValue}
                            onChange={(e) =>
                              updateRange(
                                index,
                                "minValue",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Max"
                            value={range.maxValue || ""}
                            onChange={(e) =>
                              updateRange(
                                index,
                                "maxValue",
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                            className="w-20"
                          />
                          <Input
                            type="number"
                            min="1"
                            placeholder="Points"
                            value={range.points}
                            onChange={(e) =>
                              updateRange(
                                index,
                                "points",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRange(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}

                {config.isAmountBasedEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Amount-Based Ranges</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRange("AMOUNT")}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Range
                      </Button>
                    </div>
                    {ranges
                      .filter((range) => range.rangeType === "AMOUNT")
                      .map((range, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 border rounded-lg"
                        >
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Min $"
                            value={range.minValue}
                            onChange={(e) =>
                              updateRange(
                                index,
                                "minValue",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Max $"
                            value={range.maxValue || ""}
                            onChange={(e) =>
                              updateRange(
                                index,
                                "maxValue",
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                            className="w-24"
                          />
                          <Input
                            type="number"
                            min="1"
                            placeholder="Points"
                            value={range.points}
                            onChange={(e) =>
                              updateRange(
                                index,
                                "points",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRange(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
          className="min-w-[120px]"
        >
          {loading ? "Creating..." : "Create System"}
        </Button>
      </div>
    </div>
  );
}
