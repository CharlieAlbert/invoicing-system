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
    const { data: quotations, error } = await supabase
      .from("quotations")
      .select(
        `
          *,
          client:client_id (company_name, company_email, contact_person, address)
        `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return quotations;
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

export const createQuotation = async (quotationData: InsertQuotation) => {
  const supabase = await createClient();

  if (!quotationData.client_id) throw new Error("Client ID is required");
  if (!quotationData.created_by) throw new Error("Created by is required");
  if (
    quotationData.total_amount === null ||
    quotationData.total_amount === undefined
  ) {
    throw new Error("Total amount is required");
  }
  if (!quotationData.discount) throw new Error("Discount is required");
  if (!quotationData.vat) throw new Error("VAT is required");
  if (!quotationData.final_amount) throw new Error("Final amount is required");
  if (!quotationData.valid_until) throw new Error("Valid until is required");
  if (!quotationData.status) throw new Error("Status is required");

  const { data: existing, error: fetchError } = await supabase
    .from("quotations")
    .select("quotation_number")
    .order("quotation_number", { ascending: false })
    .limit(1)
    .single();

  let nextNumber = "001";
  if (existing && existing.quotation_number) {
    const current = parseInt(existing.quotation_number, 10);
    nextNumber = String(current + 1).padStart(3, "0");
  }

  const quotationWithNumber = {
    ...quotationData,
    quotation_number: nextNumber,
  };

  const { data, error } = await supabase
    .from("quotations")
    .insert([quotationWithNumber])
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

export const deleteQuotation = async (id: string) => {
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);

  if (error) throw new Error("Failed to delete quotation");
  return { success: true, message: "Quotation deleted successfully" };
};

export const getQuotationItems = async (
  id: string
): Promise<{ quotation: any; items: QuotationItem[] }> => {
  const supabase = await createClient();

  // Fetch the quotation with client information
  const { data: quotation, error: quotationError } = await supabase
    .from("quotations")
    .select(
      `
      *,
      client:client_id (
        id,
        company_name,
        company_email,
        contact_person,
        phone,
        address
      )
    `
    )
    .eq("id", id)
    .single();

  if (quotationError) {
    throw new Error(`Failed to fetch quotation: ${quotationError.message}`);
  }

  // Fetch the quotation items
  const { data: items, error: itemsError } = await supabase
    .from("quotation_items")
    .select()
    .eq("quotation_id", id);

  if (itemsError) throw new Error("Failed to fetch quotation items");

  return {
    quotation,
    items: items as QuotationItem[],
  };
};

export const updateQuotationStatus = async (
  id: string,
  status: "approved" | "rejected"
) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error)
    throw new Error(`Failed to update quotation status: ${error.message}`);
  return { success: true, data };
};
