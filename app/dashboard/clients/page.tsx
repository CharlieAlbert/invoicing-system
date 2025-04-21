import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/supabase/server-extended/clients";
import ClientsClient from "@/components/dashboard/clients/clients-client";
import { Loader2 } from "lucide-react";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function ClientsPage() {
  // Fetch data on the server
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  
  // Prefetch data for the page
  const clientsData = await getClients();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ClientsClient 
        initialClients={clientsData}
        user={data.user}
      />
    </Suspense>
  );
}
