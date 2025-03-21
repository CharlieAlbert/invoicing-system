"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
type QuotationItem = Database["public"]["Tables"]["quotation_items"]["Row"];
type InsertQuotation = Database["public"]["Tables"]["quotations"]["Insert"];
type InsertQuotationItem =
  Database["public"]["Tables"]["quotation_items"]["Insert"];

export const getQuotations = async () => {
  const supabase = await createClient();

  try {
    const { data: quotations, error } = await supabase.from("quotations")
      .select(`
          *,
          client:client_id (company_name)
        `);

    if (error) throw error;

    return quotations as (Quotation & {
      client: { company_name: string } | null;
    })[];
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }
};

export const getQuotationById = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error("Failed to fetch quotation");
  return data as Quotation & { quotation_items: QuotationItem[] };
};

// Create a new quotation
export const createQuotation = async (quotationData: InsertQuotation) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .insert([quotationData])
    .select()
    .single();

  if (error) throw new Error("Failed to create quotation");
  return data as Quotation;
};

export const addQuotationItems = async (items: InsertQuotationItem[]) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotation_items")
    .insert(items)
    .select();

  if (error) throw new Error("Failed to add quotation items");
  return data as QuotationItem[];
};

// Delete a quotation
export const deleteQuotation = async (id: string) => {
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);

  if (error) throw new Error("Failed to delete quotation");
  return { success: true, message: "Quotation deleted successfully" };
};

export const getQuotationItems = async (
  id: string
): Promise<QuotationItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotation_items")
    .select()
    .eq("quotation_id", id);

  if (error) throw new Error("Failed to fetch quotation items");
  return data as QuotationItem[];
};
