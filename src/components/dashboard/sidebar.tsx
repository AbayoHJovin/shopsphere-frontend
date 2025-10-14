"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  Layers,
  Mail,
  TagIcon,
  MapPin,
  Gift,
  Warehouse,
  Truck,
  Percent,
  RotateCcw,
  MessageSquareX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { usePendingAppealsCount } from "@/hooks/use-pending-appeals";
import { usePendingOrdersCount } from "@/hooks/use-pending-orders";
import { usePendingReturnsCount } from "@/hooks/use-pending-returns";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/auth-slice";
import { authService } from "@/lib/services/auth-service";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: pendingAppealsCount, isLoading: isLoadingAppeals } = usePendingAppealsCount();
  const { data: pendingOrdersCount, isLoading: isLoadingOrders } = usePendingOrdersCount();
  const { data: pendingReturnsCount, isLoading: isLoadingReturns } = usePendingReturnsCount();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call the auth service logout method
      await authService.logout();
      
      dispatch(logout());
      
      toast.success("Logged out successfully");
      
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center px-3 border-b bg-primary/5">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-semibold",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          {!collapsed && (
            <span className="text-xl font-bold text-primary">ShopSphere</span>
          )}
          {collapsed && <Layers className="h-6 w-6 text-primary" />}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "ml-auto h-8 w-8",
            collapsed ? "rotate-180" : "rotate-0"
          )}
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className={cn("flex flex-col gap-1 p-2")}>
          <SidebarItem
            href="/dashboard"
            icon={Home}
            label="Dashboard"
            collapsed={collapsed}
            isActive={pathname === "/dashboard"}
          />
          <SidebarItem
            href="/dashboard/products"
            icon={Package}
            label="Products"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/products")}
          />
          <SidebarItemWithBadge
            href="/dashboard/orders"
            icon={ShoppingCart}
            label="Orders"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/orders")}
            badgeCount={pendingOrdersCount}
            isLoading={isLoadingOrders}
          />
          <SidebarItemWithBadge
            href="/dashboard/returns"
            icon={RotateCcw}
            label="Return Requests"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/returns")}
            badgeCount={pendingReturnsCount}
            isLoading={isLoadingReturns}
          />
          <SidebarItemWithBadge
            href="/dashboard/appeals"
            icon={MessageSquareX}
            label="Appeals"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/appeals")}
            badgeCount={pendingAppealsCount}
            isLoading={isLoadingAppeals}
          />
          <SidebarItem
            href="/dashboard/shipping-costs"
            icon={Truck}
            label="Shipping Costs"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/shipping-costs")}
          />
          <SidebarItem
            href="/dashboard/invitations"
            icon={Mail}
            label="Invitations"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/invitations")}
          />
          <SidebarItem
            href="/dashboard/categories"
            icon={TagIcon}
            label="Categories"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/categories")}
          />
          <SidebarItem
            href="/dashboard/discounts"
            icon={Percent}
            label="Discounts"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/discounts")}
          />
          <SidebarItem
            href="/dashboard/warehouses"
            icon={Warehouse}
            label="Warehouses"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/warehouses")}
          />
          <SidebarItem
            href="/dashboard/reward-system"
            icon={Gift}
            label="Reward System"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/reward-system")}
          />
          <Separator className="my-2" />
          <SidebarItem
            href="/dashboard/settings"
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
            isActive={pathname === "/dashboard/settings"}
          />
          <LogoutButton
            icon={LogOut}
            label="Logout"
            collapsed={collapsed}
            onClick={handleLogout}
            isLoading={isLoggingOut}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  isActive?: boolean;
}

interface SidebarItemWithBadgeProps extends SidebarItemProps {
  badgeCount?: number;
  isLoading?: boolean;
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  collapsed,
  isActive,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center rounded-md px-3 py-2 transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
        collapsed ? "justify-center" : "justify-start"
      )}
    >
      <Icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
      {!collapsed && <span>{label}</span>}
      {collapsed && <span className="sr-only">{label}</span>}
    </Link>
  );
}

function SidebarItemWithBadge({
  href,
  icon: Icon,
  label,
  collapsed,
  isActive,
  badgeCount,
  isLoading,
}: SidebarItemWithBadgeProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center rounded-md px-3 py-2 transition-colors relative",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
        collapsed ? "justify-center" : "justify-start"
      )}
    >
      <Icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {!isLoading && badgeCount !== undefined && badgeCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
          {isLoading && (
            <div className="ml-2 w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          )}
        </>
      )}
      {collapsed && (
        <>
          <span className="sr-only">{label}</span>
          {!isLoading && badgeCount !== undefined && badgeCount > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center text-[10px]"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}

interface LogoutButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

function LogoutButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
  isLoading = false,
}: LogoutButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex h-10 items-center rounded-md px-3 py-2 transition-colors w-full",
        "text-muted-foreground hover:bg-destructive hover:text-destructive-foreground",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        collapsed ? "justify-center" : "justify-start"
      )}
    >
      {isLoading ? (
        <div className={cn("h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent", collapsed ? "mr-0" : "mr-2")} />
      ) : (
        <Icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
      )}
      {!collapsed && <span>{isLoading ? "Logging out..." : label}</span>}
      {collapsed && <span className="sr-only">{isLoading ? "Logging out..." : label}</span>}
    </button>
  );
}
