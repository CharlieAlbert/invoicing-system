"use client";

import Link from "next/link";
import {
  Home,
  Package,
  FileText,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Quotations", href: "/dashboard/quotations", icon: FileText },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileSpreadsheet },
  { name: "Inventory", href: "/dashboard/inventory", icon: BarChart3 },
];

export function DashboardNav() {
  return (
    <nav className="flex w-64 flex-col bg-gray-800 p-4 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className="flex items-center rounded-lg p-2 hover:bg-gray-700"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
