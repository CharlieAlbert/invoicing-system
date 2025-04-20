"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  FileText, 
  FileSpreadsheet, 
  BarChart3, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  CreditCard, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getClients } from "@/lib/supabase/server-extended/clients";
import { getInvoices } from "@/lib/supabase/server-extended/invoices";
import { getProducts } from "@/lib/supabase/server-extended/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

interface DashboardStats {
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

export default function DashboardPage() {
  const { user, error } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
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
  });

  useEffect(() => {
    if (!user || error) {
      router.push("/auth/login");
      return;
    }
    
    fetchData();
  }, [user, error, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch clients
      const clientsData = await getClients();
      setClients(clientsData || []);
      
      // Fetch invoices
      const invoicesResponse = await getInvoices();
      const invoicesData = invoicesResponse.success ? invoicesResponse.data || [] : [];
      setInvoices(invoicesData);
      
      // Fetch products - getProducts returns array directly, not {success, data} structure
      let productsData: Product[] = [];
      try {
        productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
      
      // Calculate statistics
      calculateStats(clientsData || [], invoicesData, productsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clients: Client[], invoices: Invoice[], products: Product[]) => {
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
    
    setStats({
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
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Clock className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active business relationships
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.paidInvoices} paid, {stats.pendingInvoices} pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From paid invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Invoice Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageInvoiceValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per invoice average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different insights */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Invoice Status */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                        <span>Paid</span>
                      </div>
                      <span className="font-medium">{stats.paidInvoices}</span>
                    </div>
                    <Progress 
                      value={stats.totalInvoices ? (stats.paidInvoices / stats.totalInvoices) * 100 : 0} 
                      className="h-2 bg-muted" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                        <span>Pending</span>
                      </div>
                      <span className="font-medium">{stats.pendingInvoices}</span>
                    </div>
                    <Progress 
                      value={stats.totalInvoices ? (stats.pendingInvoices / stats.totalInvoices) * 100 : 0} 
                      className="h-2 bg-muted" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                        <span>Overdue</span>
                      </div>
                      <span className="font-medium">{stats.overdueInvoices}</span>
                    </div>
                    <Progress 
                      value={stats.totalInvoices ? (stats.overdueInvoices / stats.totalInvoices) * 100 : 0} 
                      className="h-2 bg-muted" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((invoice) => (
                      <div key={invoice.id} className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Invoice #{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.client?.company_name || 'Unknown Client'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(invoice.final_amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(invoice.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topClients.length > 0 ? (
                <div className="space-y-4">
                  {stats.topClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.count} invoices</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatCurrency(client.total)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No client data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold">{stats.totalClients}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Revenue per Client</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(stats.totalClients ? stats.totalRevenue / stats.totalClients : 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-3">Client Activity</h4>
                    {clients.length > 0 ? (
                      <div className="space-y-3">
                        {clients.slice(0, 5).map((client) => {
                          const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
                          const totalValue = clientInvoices.reduce((sum, inv) => sum + (inv.final_amount || 0), 0);
                          
                          return (
                            <div key={client.id} className="flex items-center justify-between">
                              <p className="text-sm">{client.company_name}</p>
                              <p className="text-sm font-medium">{formatCurrency(totalValue)}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No clients found</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Client Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Active vs Inactive Clients */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Clients</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={clients.length ? 100 : 0} 
                        className="h-2 flex-1" 
                      />
                      <span className="text-sm font-medium">{clients.length}</span>
                    </div>
                  </div>
                  
                  {/* Client with most invoices */}
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-3">Most Active Clients</h4>
                    {clients.length > 0 ? (
                      <div className="space-y-3">
                        {Array.from(
                          invoices.reduce((acc, invoice) => {
                            const clientId = invoice.client_id;
                            acc.set(clientId, (acc.get(clientId) || 0) + 1);
                            return acc;
                          }, new Map<string, number>())
                        )
                          .map(([clientId, count]) => {
                            const client = clients.find(c => c.id === clientId);
                            return { 
                              id: clientId, 
                              name: client?.company_name || 'Unknown', 
                              count 
                            };
                          })
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 5)
                          .map(client => (
                            <div key={client.id} className="flex items-center justify-between">
                              <p className="text-sm">{client.name}</p>
                              <p className="text-sm font-medium">{client.count} invoices</p>
                            </div>
                          ))
                      }
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No client activity data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Average Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.averageInvoiceValue)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-3">Invoice Status Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                          <p className="text-sm">Paid</p>
                        </div>
                        <p className="text-sm font-medium">{stats.paidInvoices} ({stats.totalInvoices ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}%)</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                          <p className="text-sm">Pending</p>
                        </div>
                        <p className="text-sm font-medium">{stats.pendingInvoices} ({stats.totalInvoices ? Math.round((stats.pendingInvoices / stats.totalInvoices) * 100) : 0}%)</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                          <p className="text-sm">Overdue</p>
                        </div>
                        <p className="text-sm font-medium">{stats.overdueInvoices} ({stats.totalInvoices ? Math.round((stats.overdueInvoices / stats.totalInvoices) * 100) : 0}%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          invoices
                            .filter(inv => inv.status === 'paid' || inv.status === 'overdue')
                            .reduce((sum, inv) => sum + (inv.final_amount || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-3">Recent Payments</h4>
                    {invoices.filter(inv => inv.status === 'paid').length > 0 ? (
                      <div className="space-y-3">
                        {invoices
                          .filter(inv => inv.status === 'paid')
                          .sort((a, b) => {
                            // Handle null created_at values by providing default dates
                            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                            return dateB - dateA;
                          })
                          .slice(0, 5)
                          .map(invoice => (
                            <div key={invoice.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm">Invoice #{invoice.invoice_number}</p>
                                <p className="text-xs text-muted-foreground">{invoice.client?.company_name}</p>
                              </div>
                              <p className="text-sm font-medium">{formatCurrency(invoice.final_amount)}</p>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No payment data available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Overdue Invoices Alert */}
          {stats.overdueInvoices > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-red-400">
                  You have {stats.overdueInvoices} overdue {stats.overdueInvoices === 1 ? 'invoice' : 'invoices'} that require immediate attention.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/dashboard/invoices')}
                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                  >
                    View Overdue Invoices →
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
