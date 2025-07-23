"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [title, setTitle] = useState("Dashboard");

  useEffect(() => {
    // Update title based on pathname
    if (pathname === "/dashboard") {
      setTitle("Dashboard");
    } else if (pathname === "/dashboard/products") {
      setTitle("Products Management");
    } else if (pathname === "/dashboard/orders") {
      setTitle("Orders Management");
    } else if (pathname === "/dashboard/invitations" || pathname.startsWith("/dashboard/invitations/")) {
      setTitle("Invitations Management");
    } else if (pathname === "/dashboard/analytics") {
      setTitle("Analytics");
    } else if (pathname === "/dashboard/settings") {
      setTitle("Settings");
    }
  }, [pathname]);

  return (
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
  );
} 