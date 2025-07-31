import { ReactNode } from "react";
import { UserRole } from "@/lib/constants";
import {
  LineChart,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  roles: UserRole[];
}

export const sidebarItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN, UserRole.CO_WORKER],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <LineChart className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN, UserRole.CO_WORKER],
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN, UserRole.CO_WORKER],
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: <Package className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN, UserRole.CO_WORKER],
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: <Tag className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN, UserRole.CO_WORKER],
  },
  {
    title: "Invitations",
    href: "/dashboard/invitations",
    icon: <Users className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
    roles: [UserRole.ADMIN, UserRole.CO_WORKER],
  },
]; 