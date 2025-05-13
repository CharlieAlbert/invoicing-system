import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/supabase/server-extended/products";
import ProductsClient from "@/components/dashboard/products/products-client";
import { Loader2 } from "lucide-react";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function ProductsPage() {
  // Fetch data on the server
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Prefetch data for the page
  const productsData = await getProducts();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ProductsClient 
        initialProducts={productsData}
        user={user}
      />
    </Suspense>
  );
}
