"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RewardSystemConfig } from "./components/RewardSystemConfig";
import { RewardRanges } from "./components/RewardRanges";
import { UserPointsOverview } from "./components/UserPointsOverview";
import { rewardSystemService } from "@/lib/services/reward-system-service";
import { RewardSystemDTO } from "@/lib/types/reward-system";

export default function RewardSystemPage() {
  const [rewardSystem, setRewardSystem] = useState<RewardSystemDTO | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("configuration");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log("RewardSystemPage: Loading reward system...");
    loadRewardSystem();
  }, []);

  const loadRewardSystem = async () => {
    try {
      console.log("RewardSystemPage: Starting to load reward system...");
      setLoading(true);
      const data = await rewardSystemService.getActiveRewardSystem();
      console.log("RewardSystemPage: Loaded data:", data);
      setRewardSystem(data);
    } catch (error) {
      console.error("RewardSystemPage: Failed to load reward system:", error);
      toast({
        title: "Error",
        description: "Failed to load reward system configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = (updatedSystem: RewardSystemDTO) => {
    setRewardSystem(updatedSystem);
    toast({
      title: "Success",
      description: "Reward system updated successfully",
    });
  };

  const handleCreateNew = () => {
    router.push("/dashboard/reward-system/create");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reward system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reward System</h1>
          <p className="text-muted-foreground">
            Manage your reward system configuration and user points
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rewardSystem && (
            <Badge
              variant={rewardSystem.isSystemEnabled ? "default" : "secondary"}
            >
              {rewardSystem.isSystemEnabled ? "Enabled" : "Disabled"}
            </Badge>
          )}
        </div>
      </div>

      {rewardSystem ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="ranges">Reward Ranges</TabsTrigger>
            <TabsTrigger value="overview">User Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-4">
            <RewardSystemConfig
              rewardSystem={rewardSystem}
              onUpdate={handleSystemUpdate}
            />
          </TabsContent>

          <TabsContent value="ranges" className="space-y-4">
            <RewardRanges
              rewardSystem={rewardSystem}
              onUpdate={handleSystemUpdate}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <UserPointsOverview />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Reward System Found</CardTitle>
            <CardDescription>
              You need to create a reward system configuration first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateNew} className="w-full sm:w-auto">
              Create Reward System
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
