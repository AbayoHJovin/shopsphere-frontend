'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { UserRole } from '@/lib/constants';

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
  allowedRoles = [UserRole.ADMIN, UserRole.CO_WORKER] 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, checkingAuth } = useAppSelector(state => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until auth check is complete
    if (checkingAuth) {
      return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check if user has required role
    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push('/dashboard'); // Redirect to dashboard as fallback
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname, checkingAuth]);

  // Show loading during auth check
  if (checkingAuth) {
    return null; // Or a loading spinner
  }

  // Return children only if authenticated
  if (isAuthenticated && user) {
    // If role check is required and user has appropriate role
    if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
      return <>{children}</>;
    }
  }

  // Return null while redirecting
  return null;
} 