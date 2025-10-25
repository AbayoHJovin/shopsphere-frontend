"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layers, Eye, EyeOff } from "lucide-react";
import { authService } from "@/lib/services/auth-service";
import { LoginRequest } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "@/lib/redux/auth-slice";
import { handleApiError } from "@/lib/utils/error-handler";
import { UserRole } from "@/lib/constants";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl, authLoading]);

  // Show auth error if any
  useEffect(() => {
    if (authError) {
      toast({
        title: "Authentication Error",
        description: authError,
        variant: "destructive",
      });
    }
  }, [authError, toast]);

  // Login mutation with TanStack Query
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => {
      dispatch(loginStart());
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      dispatch(
        loginSuccess({
          id: data.userId,
          firstName: data.userName.split(" ")[0] || "",
          lastName: data.userName.split(" ").slice(1).join(" ") || "",
          userEmail: data.userEmail,
          phoneNumber: data.userPhone,
          role: data.role,
          emailVerified: false,
          phoneVerified: false,
          enabled: true,
        })
      );

      toast({
        title: "Success",
        description: data.message || "Logged in successfully",
      });

      if (
        data.role != UserRole.ADMIN &&
        data.role != UserRole.EMPLOYEE &&
        data.role != UserRole.DELIVERY_AGENT
      ) {
        toast({
          title: "Redirecting...",
          description: "You're being redirected to the customer portal",
        });
        window.location.href = "https://shopsphere-frontend.vercel.app/shop";
        return;
      }

      router.replace(returnUrl);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      dispatch(loginFailure(errorMessage));

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="mx-auto flex w-full flex-col space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto flex items-center justify-center bg-primary/10 p-4 rounded-full">
          <Layers className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access the admin panel
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="admin@example.com"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Clear error when user starts typing
                      if (authError) {
                        dispatch(clearError());
                      }
                    }}
                    className="border-primary/20 focus-visible:ring-primary"
                    disabled={loginMutation.isPending || authLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="******"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear error when user starts typing
                        if (authError) {
                          dispatch(clearError());
                        }
                      }}
                      className="border-primary/20 focus-visible:ring-primary pr-10"
                      disabled={loginMutation.isPending || authLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loginMutation.isPending || authLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending || authLoading}
          >
            {loginMutation.isPending || authLoading
              ? "Signing In..."
              : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
