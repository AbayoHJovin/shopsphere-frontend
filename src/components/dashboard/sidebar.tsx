"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
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
          <SidebarItem
            href="/dashboard/orders"
            icon={ShoppingCart}
            label="Orders"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/orders")}
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
            href="/dashboard/warehouses"
            icon={Warehouse}
            label="Warehouses"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/warehouses")}
          />
          <SidebarItem
            href="/dashboard/delivery-areas"
            icon={MapPin}
            label="Delivery Areas"
            collapsed={collapsed}
            isActive={pathname.startsWith("/dashboard/delivery-areas")}
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
          <SidebarItem
            href="/auth"
            icon={LogOut}
            label="Logout"
            collapsed={collapsed}
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
