"use client";

import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function mapUserToProps(user: any) {
  if (!user) return undefined;

  return {
    name: user.name || "",
    email: user.email || "",
    avatar: user.avatar || null,
  };
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    // Listen for sidebar state changes
    const handleSidebarStateChange = (event: any) => {
      setNavCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener("sidebarStateChange", handleSidebarStateChange);
    return () => {
      window.removeEventListener("sidebarStateChange", handleSidebarStateChange);
    };
  }, []);

  const userProps = mapUserToProps(user);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardNav />
      <div 
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          navCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <DashboardHeader user={userProps} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
