import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getQuotations } from "@/lib/supabase/server-extended/quotations";
import { getClients } from "@/lib/supabase/server-extended/clients";
import { getProducts } from "@/lib/supabase/server-extended/products";
import QuotationsClient from "@/components/dashboard/quotations/quotations-client";
import { Loader2 } from "lucide-react";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function QuotationsPage() {
  // Fetch data on the server
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Prefetch data for the page
  const [quotationsData, clientsData, productsData] = await Promise.all([
    getQuotations(),
    getClients(),
    getProducts(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <QuotationsClient
        initialQuotations={quotationsData}
        initialClients={clientsData}
        initialProducts={productsData}
        user={user}
      />
    </Suspense>
  );
}
