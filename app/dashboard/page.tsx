import { getClients } from "@/lib/supabase/server-extended/clients";
import { getInvoices } from "@/lib/supabase/server-extended/invoices";
import { getProducts } from "@/lib/supabase/server-extended/products";
import { calculateDashboardStats } from "@/lib/utils/dashboard-utils";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function DashboardPage() {
  // Get the user from the server
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth/login");
  }

  try {
    // Fetch data on the server
    const [clientsData, invoicesResponse, productsData] = await Promise.all([
      getClients(),
      getInvoices(),
      getProducts(),
    ]);

    // Process the data
    const clients = clientsData || [];
    const invoices = invoicesResponse.success ? invoicesResponse.data || [] : [];
    const products = productsData || [];

    // Calculate statistics
    const stats = calculateDashboardStats(clients, invoices, products);

    // Pass data to client component
    return <DashboardClient initialData={{ clients, invoices, products, stats }} />;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return client component with empty data
    return (
      <DashboardClient
        initialData={{
          clients: [],
          invoices: [],
          products: [],
          stats: {
            totalClients: 0,
            totalInvoices: 0,
            totalProducts: 0,
            totalRevenue: 0,
            paidInvoices: 0,
            pendingInvoices: 0,
            overdueInvoices: 0,
            averageInvoiceValue: 0,
            recentActivity: [],
            paymentStats: {
              paid: 0,
              pending: 0,
              overdue: 0,
            },
            topClients: [],
          },
        }}
      />
    );
  }
}
