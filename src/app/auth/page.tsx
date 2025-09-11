"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AuthPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "invitation-accepted") {
      toast.success(
        "Invitation accepted successfully! You can now log in with your credentials."
      );
    } else if (message === "invitation-declined") {
      toast.info(
        "Invitation declined. You can still log in with your existing account."
      );
    }
  }, [searchParams]);

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          ShopSphere Admin
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This dashboard gives me complete control over my ecommerce
              operations. I can track sales, manage inventory, and provide
              excellent customer service all from one place."
            </p>
            <footer className="text-sm opacity-80">Admin User</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center">Loading...</div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
