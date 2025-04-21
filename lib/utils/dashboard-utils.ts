import { Database } from "@/lib/supabase/types";

// Define types
type Client = Database["public"]["Tables"]["client"]["Row"];
type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  client?: {
    company_name: string;
    company_email: string;
    phone?: string | null;
    contact_person?: string | null;
    address?: string | null;
  };
};
type Product = Database["public"]["Tables"]["products"]["Row"];

interface TopClient {
  id: string;
  name: string;
  total: number;
  count: number;
}

export interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalProducts: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  recentActivity: Invoice[];
  paymentStats: {
    paid: number;
    pending: number;
    overdue: number;
  };
  topClients: TopClient[];
}

export function calculateDashboardStats(
  clients: Client[],
  invoices: Invoice[],
  products: Product[]
): DashboardStats {
  // Basic counts
  const totalClients = clients.length;
  const totalInvoices = invoices.length;
  const totalProducts = products.length;
  
  // Invoice statistics
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  
  // Financial statistics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.final_amount || 0), 0);
  
  const averageInvoiceValue = totalInvoices > 0 
    ? invoices.reduce((sum, inv) => sum + (inv.final_amount || 0), 0) / totalInvoices 
    : 0;
  
  // Payment statistics for chart
  const paymentStats = {
    paid: paidInvoices,
    pending: pendingInvoices,
    overdue: overdueInvoices,
  };
  
  // Top clients by invoice value
  const clientInvoiceMap = new Map<string, { total: number; count: number; name: string }>();
  invoices.forEach(invoice => {
    const clientId = invoice.client_id;
    const currentTotal = clientInvoiceMap.get(clientId) || { 
      total: 0, 
      count: 0, 
      name: invoice.client?.company_name || 'Unknown' 
    };
    
    clientInvoiceMap.set(clientId, {
      total: currentTotal.total + (invoice.final_amount || 0),
      count: currentTotal.count + 1,
      name: invoice.client?.company_name || 'Unknown'
    });
  });
  
  const topClients = Array.from(clientInvoiceMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  // Recent activity - last 5 invoices
  const recentActivity = [...invoices]
    .sort((a, b) => {
      // Handle null created_at values by providing default dates
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
  
  return {
    totalClients,
    totalInvoices,
    totalProducts,
    totalRevenue,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    averageInvoiceValue,
    recentActivity,
    paymentStats,
    topClients,
  };
}
