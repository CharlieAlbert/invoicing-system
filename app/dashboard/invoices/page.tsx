import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/supabase/server-extended/clients";
import { getProducts } from "@/lib/supabase/server-extended/products";
import { getInvoices } from "@/lib/supabase/server-extended/invoices";
import InvoicesClient from "@/components/dashboard/invoices/invoices-client";
import { Loader2, AlertCircle } from "lucide-react";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function InvoicesPage() {
  // Fetch data on the server
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    // Prefetch data for the page
    const [clientsData, productsData, invoicesResponse] = await Promise.all([
      getClients(),
      getProducts(),
      getInvoices(),
    ]);

    // Extract and transform invoice data to match the expected Invoice type
    const invoicesData = invoicesResponse.success && invoicesResponse.data 
      ? invoicesResponse.data.map(invoice => {
          // Find the matching client for this invoice
          const matchingClient = clientsData.find(client => client.id === invoice.client_id);
          
          return {
            id: invoice.id,
            invoice_number: invoice.invoice_number || '',
            client_id: invoice.client_id,
            invoice_date: invoice.invoice_date || '',
            due_date: invoice.due_date,
            status: invoice.status as "draft" | "sent" | "paid" | "overdue" | "cancelled",
            total_amount: invoice.total_amount,
            discount: invoice.discount || 0,
            vat: invoice.vat || 0,
            final_amount: invoice.final_amount,
            notes: invoice.notes,
            created_at: invoice.created_at || '',
            created_by: invoice.created_by || '',
            // Add client information if available
            client: matchingClient ? {
              company_name: matchingClient.company_name,
              company_email: matchingClient.company_email,
              phone: matchingClient.phone,
              contact_person: matchingClient.contact_person,
              address: matchingClient.address
            } : undefined
          };
        })
      : [];

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <InvoicesClient
          initialClients={clientsData}
          initialProducts={productsData}
          initialInvoices={invoicesData}
          user={user}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading invoice data:", error);
    // Return a fallback UI for error state
    return (
      <div className="flex flex-col items-center justify-center w-full h-64">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load invoice data</h2>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }
}
