"use server";

import { createClient } from "../server";
import { Database } from "../types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];
type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];
type InvoiceItemInsert =
  Database["public"]["Tables"]["invoice_items"]["Insert"];
type InvoiceItemUpdate =
  Database["public"]["Tables"]["invoice_items"]["Update"];

export type InvoiceWithItems = Invoice & {
  items: (InvoiceItem & {
    products: { name: string; description: string | null; type: string };
    product_variants?: { size: number; unit: string; sku: string | null } | null;
  })[];
  client: {
    company_name: string;
    company_email: string;
    phone: string | null;
    contact_person: string | null;
    address: string | null;
  };
};

export async function createInvoice(
  invoiceData: Omit<InvoiceInsert, "id" | "created_at" | "invoice_number">,
  invoiceItems: Omit<InvoiceItemInsert, "id" | "created_at" | "invoice_id">[]
): Promise<{ success: boolean; error?: string; invoice_id?: string }> {
  const supabase = await createClient();

  // Start a transaction
  const { data: client } = await supabase.auth.getUser();
  if (!client.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Call the generate_invoice_number function
    const { data: invoiceNumberData, error: invoiceNumberError } =
      await supabase.rpc("generate_invoice_number");

    if (invoiceNumberError) {
      return {
        success: false,
        error: `Error generating invoice number: ${invoiceNumberError.message}`,
      };
    }

    const invoiceNumber = invoiceNumberData as string;

    // 2. Insert the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        ...invoiceData,
        invoice_number: invoiceNumber,
      })
      .select("id")
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error creating invoice: ${invoiceError.message}`,
      };
    }

    // 3. Insert all invoice items
    if (invoiceItems.length > 0) {
      const itemsWithInvoiceId = invoiceItems.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsWithInvoiceId);

      if (itemsError) {
        return {
          success: false,
          error: `Error creating invoice items: ${itemsError.message}`,
        };
      }
    }

    return { success: true, invoice_id: invoice.id };
  } catch (error) {
    console.error("Error in createInvoice:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function getInvoiceWithItems(invoiceId: string): Promise<{
  success: boolean;
  data?: InvoiceWithItems;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // 1. Get the invoice with client info
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
          *,
          client:client_id (
            company_name, company_email, phone, contact_person, address
          )
        `
      )
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error fetching invoice: ${invoiceError.message}`,
      };
    }

    // 2. Get all invoice items with product and variant info
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select(
        `
          *,
          products:product_id (
            name, description, type
          ),
          product_variants:product_variant_id (
            size, unit, sku
          )
        `
      )
      .eq("invoice_id", invoiceId);

    if (itemsError) {
      return {
        success: false,
        error: `Error fetching invoice items: ${itemsError.message}`,
      };
    }

    return {
      success: true,
      data: { ...invoice, items } as InvoiceWithItems,
    };
  } catch (error) {
    console.error("Error in getInvoiceWithItems:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function deleteInvoice(
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (error) {
      return {
        success: false,
        error: `Error deleting invoice: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteInvoice:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function addInvoiceItem(
  invoiceId: string,
  itemData: Omit<InvoiceItemInsert, "id" | "created_at" | "invoice_id">
): Promise<{ success: boolean; error?: string; item_id?: string }> {
  const supabase = await createClient();

  try {
    // Insert the item
    const { data: item, error: itemError } = await supabase
      .from("invoice_items")
      .insert({
        ...itemData,
        invoice_id: invoiceId,
        total_amount: itemData.quantity * itemData.price_per_unit,
      })
      .select("id, total_amount")
      .single();

    if (itemError) {
      return {
        success: false,
        error: `Error adding invoice item: ${itemError.message}`,
      };
    }

    // Get the current invoice to update totals
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("total_amount, discount")
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error fetching invoice: ${invoiceError.message}`,
      };
    }

    // Calculate new totals
    const newTotalAmount = (invoice.total_amount || 0) + item.total_amount;
    const vatRate = 0.16; // Assuming 16% VAT, adjust as needed
    const newVat = newTotalAmount * vatRate;
    const newFinalAmount = newTotalAmount + newVat - (invoice.discount || 0);

    // Update the invoice with new totals
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        total_amount: newTotalAmount,
        vat: newVat,
        final_amount: newFinalAmount,
      })
      .eq("id", invoiceId);

    if (updateError) {
      return {
        success: false,
        error: `Error updating invoice totals: ${updateError.message}`,
      };
    }

    return { success: true, item_id: item.id };
  } catch (error) {
    console.error("Error in addInvoiceItem:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function updateInvoiceItem(
  itemId: string,
  updateData: Partial<Pick<InvoiceItemUpdate, "quantity" | "price_per_unit">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current item to calculate new totals
    const { data: currentItem, error: itemFetchError } = await supabase
      .from("invoice_items")
      .select("invoice_id, quantity, price_per_unit, total_amount")
      .eq("id", itemId)
      .single();

    if (itemFetchError) {
      return {
        success: false,
        error: `Error fetching invoice item: ${itemFetchError.message}`,
      };
    }

    // Calculate new values
    const newQuantity = updateData.quantity ?? currentItem.quantity;
    const newPricePerUnit =
      updateData.price_per_unit ?? currentItem.price_per_unit;
    const newTotalAmount = newQuantity * newPricePerUnit;
    const oldTotalAmount = currentItem.total_amount;
    const totalDifference = newTotalAmount - oldTotalAmount;

    // Update the item
    const { error: updateItemError } = await supabase
      .from("invoice_items")
      .update({
        quantity: newQuantity,
        price_per_unit: newPricePerUnit,
        total_amount: newTotalAmount,
      })
      .eq("id", itemId);

    if (updateItemError) {
      return {
        success: false,
        error: `Error updating invoice item: ${updateItemError.message}`,
      };
    }

    // Get the current invoice to update totals
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("total_amount, discount")
      .eq("id", currentItem.invoice_id)
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error fetching invoice: ${invoiceError.message}`,
      };
    }

    // Calculate new invoice totals
    const newInvoiceTotalAmount = (invoice.total_amount || 0) + totalDifference;
    const vatRate = 0.16; // Assuming 16% VAT, adjust as needed
    const newVat = newInvoiceTotalAmount * vatRate;
    const newFinalAmount =
      newInvoiceTotalAmount + newVat - (invoice.discount || 0);

    // Update the invoice with new totals
    const { error: updateInvoiceError } = await supabase
      .from("invoices")
      .update({
        total_amount: newInvoiceTotalAmount,
        vat: newVat,
        final_amount: newFinalAmount,
      })
      .eq("id", currentItem.invoice_id);

    if (updateInvoiceError) {
      return {
        success: false,
        error: `Error updating invoice totals: ${updateInvoiceError.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateInvoiceItem:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function deleteInvoiceItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the item before deleting it
    const { data: item, error: itemFetchError } = await supabase
      .from("invoice_items")
      .select("invoice_id, total_amount")
      .eq("id", itemId)
      .single();

    if (itemFetchError) {
      return {
        success: false,
        error: `Error fetching invoice item: ${itemFetchError.message}`,
      };
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      return {
        success: false,
        error: `Error deleting invoice item: ${deleteError.message}`,
      };
    }

    // Get the current invoice to update totals
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("total_amount, discount")
      .eq("id", item.invoice_id)
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error fetching invoice: ${invoiceError.message}`,
      };
    }

    // Calculate new invoice totals
    const newTotalAmount = (invoice.total_amount || 0) - item.total_amount;
    const vatRate = 0.16; // Assuming 16% VAT, adjust as needed
    const newVat = newTotalAmount * vatRate;
    const newFinalAmount = newTotalAmount + newVat - (invoice.discount || 0);

    // Update the invoice with new totals
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        total_amount: newTotalAmount,
        vat: newVat,
        final_amount: newFinalAmount,
      })
      .eq("id", item.invoice_id);

    if (updateError) {
      return {
        success: false,
        error: `Error updating invoice totals: ${updateError.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteInvoiceItem:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function recordInvoicePayment(
  invoiceId: string,
  paymentData: {
    payment_method: string;
    amount_paid: number;
    payment_date?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("final_amount, amount_paid")
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error fetching invoice: ${invoiceError.message}`,
      };
    }

    // Calculate new amount paid and determine status
    const newAmountPaid = (invoice.amount_paid || 0) + paymentData.amount_paid;
    let newStatus: string;

    if (newAmountPaid >= invoice.final_amount) {
      newStatus = "paid";
    } else if (newAmountPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending";
    }

    // Update the invoice
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date || new Date().toISOString(),
        amount_paid: newAmountPaid,
        status: newStatus,
        notes: paymentData.notes,
      })
      .eq("id", invoiceId);

    if (updateError) {
      return {
        success: false,
        error: `Error recording payment: ${updateError.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in recordInvoicePayment:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function createInvoiceFromQuotation(
  quotationId: string,
  dueDate?: string
): Promise<{ success: boolean; error?: string; invoice_id?: string }> {
  const supabase = await createClient();

  try {
    // 1. Get the quotation details
    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", quotationId)
      .single();

    if (quotationError) {
      return {
        success: false,
        error: `Error fetching quotation: ${quotationError.message}`,
      };
    }

    // 2. Generate invoice number
    const { data: invoiceNumber, error: invoiceNumberError } =
      await supabase.rpc("generate_invoice_number");

    if (invoiceNumberError) {
      return {
        success: false,
        error: `Error generating invoice number: ${invoiceNumberError.message}`,
      };
    }

    // 3. Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        created_by: quotation.created_by,
        client_id: quotation.client_id,
        quotation_id: quotationId,
        invoice_number: invoiceNumber as string,
        due_date:
          dueDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        total_amount: quotation.total_amount,
        discount: quotation.discount,
        vat: quotation.vat,
        final_amount: quotation.final_amount,
      })
      .select("id")
      .single();

    if (invoiceError) {
      return {
        success: false,
        error: `Error creating invoice: ${invoiceError.message}`,
      };
    }

    // 4. Copy quotation items to invoice items
    const { data: quotationItems, error: itemsError } = await supabase
      .from("quotation_items")
      .select(
        "product_id, product_variant_id, quantity, price_per_unit, total_amount"
      )
      .eq("quotation_id", quotationId);

    if (itemsError) {
      return {
        success: false,
        error: `Error fetching quotation items: ${itemsError.message}`,
      };
    }

    // 5. Insert the invoice items
    if (quotationItems.length > 0) {
      const invoiceItems = quotationItems.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      const { error: insertItemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (insertItemsError) {
        // If there's an error, we should delete the invoice to avoid an inconsistent state
        await supabase.from("invoices").delete().eq("id", invoice.id);
        return {
          success: false,
          error: `Error creating invoice items: ${insertItemsError.message}`,
        };
      }
    }

    // 6. Update quotation status to approved if not already
    await supabase
      .from("quotations")
      .update({ status: "approved" })
      .eq("id", quotationId)
      .eq("status", "pending");

    return { success: true, invoice_id: invoice.id };
  } catch (error) {
    console.error("Error in createInvoiceFromQuotation:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function getInvoices(): Promise<{
  success: boolean;
  data?: Invoice[];
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get all invoices with client info
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select(
        `
          *,
          client:client_id (
            company_name, company_email, phone, contact_person, address
          )
        `
      )
      .order("created_at", { ascending: false });

    if (invoicesError) {
      return {
        success: false,
        error: `Error fetching invoices: ${invoicesError.message}`,
      };
    }

    return {
      success: true,
      data: invoices,
    };
  } catch (error) {
    console.error("Error in getInvoices:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

export async function getInvoicesByClientId(clientId: string): Promise<{
  success: boolean;
  data?: Invoice[];
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get all invoices for a specific client
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select(
        `
          *,
          client:client_id (
            company_name, company_email, phone, contact_person, address
          )
        `
      )
      .eq("client_id", clientId)
      .order("invoice_date", { ascending: false });

    if (invoicesError) {
      return {
        success: false,
        error: `Error fetching invoices: ${invoicesError.message}`,
      };
    }

    return {
      success: true,
      data: invoices,
    };
  } catch (error) {
    console.error("Error in getInvoicesByClientId:", error);
    return {
      success: false,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}
