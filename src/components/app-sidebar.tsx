"use client";

import type * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Package2,
  ShoppingCart,
  Users,
  Store,
  BarChart3,
  Settings,
  LogOut,
  Package,
  Loader2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Agents",
      url: "/dashboard/agents",
      icon: Users,
    },
    {
      title: "Vendors",
      url: "/dashboard/vendors",
      icon: Store,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Option 1: If using NextAuth.js
      // import { signOut } from "next-auth/react";
      // await signOut({ redirect: false });

      // Option 2: If using custom auth with API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Option 3: Clear local storage/session storage if storing tokens locally
      // localStorage.removeItem('token');
      // localStorage.removeItem('refreshToken');
      // localStorage.removeItem('user');
      // sessionStorage.clear();

      // Option 4: Clear cookies if storing auth tokens in cookies
      // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      // document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

      // Clear any cached data or state
      // You might want to clear any global state here
      // resetUserState(); // Example function to clear user context

      // Redirect to login page
      router.push("/login");

      // Optional: Show success message
      // toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout error:", error);

      // Even if logout API fails, clear local data and redirect
      // This ensures user is logged out on the frontend
      localStorage.clear();
      sessionStorage.clear();

      // Optional: Show error message
      // toast.error('Logout failed, but you have been signed out locally');

      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Package2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FreshMarket</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
                <ThemeSwitcher />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to logout?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out of your account and redirected to the
                    login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
