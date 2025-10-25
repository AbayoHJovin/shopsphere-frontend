"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/lib/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Wraps components that require authentication
 * Redirects to login page if user is not authenticated
 * Can also check for specific roles
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [UserRole.ADMIN, UserRole.EMPLOYEE],
}: ProtectedRouteProps) {
  const { isAuthenticated, user, checkingAuth } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Wait until auth check is complete
    if (checkingAuth) {
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.push(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      hasRedirected.current = true;
      if (user.role === UserRole.DELIVERY_AGENT) {
        router.push("/delivery-agent/dashboard");
      } else if (user.role === UserRole.CUSTOMER) {
        router.push("/");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname, checkingAuth]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
      return <>{children}</>;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
