"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@/lib/constants";
import { useAppSelector } from "@/lib/redux/hooks";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [title, setTitle] = useState("Dashboard");
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Redirect delivery agents to their portal
    if (user && user.role === UserRole.DELIVERY_AGENT) {
      router.replace("/delivery-agent/dashboard");
      return;
    }

    // Update title based on pathname
    if (pathname === "/dashboard") {
      setTitle("Dashboard");
    } else if (pathname.startsWith("/dashboard/products")) {
      setTitle("Products Management");
    } else if (pathname.startsWith("/dashboard/orders")) {
      setTitle("Orders Management");
    } else if (pathname.startsWith("/dashboard/invitations")) {
      setTitle("Invitations Management");
    } else if (pathname.startsWith("/dashboard/categories")) {
      setTitle("Categories Management");
    } else if (pathname === "/dashboard/analytics") {
      setTitle("Analytics");
    } else if (pathname === "/dashboard/settings") {
      setTitle("Settings");
    }
  }, [pathname, user, router]);

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}>
      <DashboardProvider>
        <div className="flex h-screen overflow-hidden">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header title={title} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </DashboardProvider>
    </ProtectedRoute>
  );
}
