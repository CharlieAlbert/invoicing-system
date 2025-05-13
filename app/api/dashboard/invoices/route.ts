import { getInvoices } from "@/lib/supabase/server-extended/invoices";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch invoices
    const invoicesResponse = await getInvoices();
    
    if (!invoicesResponse.success) {
      return NextResponse.json(
        { error: invoicesResponse.error || "Failed to fetch invoices" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ invoices: invoicesResponse.data || [] });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// This enables on-demand revalidation
export const dynamic = 'force-dynamic';
