import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">{children}</main>
    </div>
  );
}
