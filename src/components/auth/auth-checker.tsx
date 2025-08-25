'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { checkAuthStart, checkAuthSuccess, checkAuthFailure } from '@/lib/redux/auth-slice';
import { authService } from '@/lib/services/auth-service';
import { setupAuthHeaders } from '@/lib/utils/auth-utils';

/**
 * Auth checker component
 * Checks for existing auth session when the app initializes
 */
export function AuthChecker({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { checkingAuth } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    // Function to check if user is already authenticated
    const checkAuthentication = async () => {
      try {
        // Set up auth headers first
        setupAuthHeaders();
        
        dispatch(checkAuthStart());
        const user = await authService.getCurrentUser();
        dispatch(checkAuthSuccess(user));
      } catch (error) {
        dispatch(checkAuthFailure());
      }
    };
    
    checkAuthentication();
  }, [dispatch]);
  
  // You could render a loading state here if needed
  // if (checkingAuth) {
  //   return <div>Loading authentication...</div>;
  // }
  
  return <>{children}</>;
} 