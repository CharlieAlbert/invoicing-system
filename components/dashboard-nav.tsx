"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  FileText,
  FileSpreadsheet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Quotations", href: "/dashboard/quotations", icon: FileText },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileSpreadsheet },
  { name: "Inventory", href: "/dashboard/inventory", icon: BarChart3 },
];

export function DashboardNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Update the CSS custom property when the sidebar state changes
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "4rem" : "16rem"
    );
  }, [isCollapsed]);

  return (
    <TooltipProvider>
      {/* Sidebar for larger screens */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-50 hidden h-full flex-col border-r bg-gray-800 text-white transition-all duration-300 ease-in-out md:flex",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className={cn("text-2xl font-bold", isCollapsed && "hidden")}>
            Dashboard
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </Button>
        </div>
        <ul className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg p-2 hover:bg-gray-700",
                      pathname === item.href && "bg-gray-700",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn("h-5 w-5", !isCollapsed && "mr-3")}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.name}</TooltipContent>
                )}
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom navigation for mobile screens */}
      <nav className="fixed bottom-0 left-0 z-20 flex w-full justify-around border-t bg-gray-800 p-2 text-white md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center rounded-lg p-2 hover:bg-gray-700",
              pathname === item.href && "bg-gray-700"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </TooltipProvider>
  );
}
