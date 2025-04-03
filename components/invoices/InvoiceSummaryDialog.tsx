"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getClients } from "@/lib/supabase/server-extended/clients";
import { getInvoicesByClientId, InvoiceWithItems } from "@/lib/supabase/server-extended/invoices";
import { generateInvoiceSummaryHTML } from "@/utils/pdf/generateInvoiceSummary";
import { Loader2, FileText } from "lucide-react";
import { Database } from "@/lib/supabase/types";

type Client = Database["public"]["Tables"]["client"]["Row"];
type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  client: {
    company_name: string;
    company_email: string;
    phone: string | null;
    contact_person: string | null;
    address: string | null;
  };
};

type InvoiceSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InvoiceSummaryDialog({
  open,
  onOpenChange,
}: InvoiceSummaryDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [summaryTitle, setSummaryTitle] = useState<string>("Payment Summary");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingClients, setLoadingClients] = useState<boolean>(false);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      } finally {
        setLoadingClients(false);
      }
    };

    if (open) {
      fetchClients();
    }
  }, [open]);

  // Fetch invoices when a client is selected
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedClientId) {
        setInvoices([]);
        setSelectedInvoices([]);
        return;
      }

      try {
        setLoadingInvoices(true);
        const result = await getInvoicesByClientId(selectedClientId);
        if (result.success && result.data) {
          // Cast the data to the Invoice type
          setInvoices(result.data as unknown as Invoice[]);
        } else {
          toast.error(result.error || "Failed to load invoices");
          setInvoices([]);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    if (selectedClientId) {
      fetchInvoices();
    }
  }, [selectedClientId]);

  const handleClientChange = (value: string) => {
    setSelectedClientId(value);
    setSelectedInvoices([]);
  };

  const handleInvoiceToggle = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map((invoice) => invoice.id));
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedClientId || selectedInvoices.length === 0) {
      toast.error("Please select a client and at least one invoice");
      return;
    }

    try {
      setGeneratingPdf(true);
      toast.loading("Generating invoice summary...");

      // Get client info
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) {
        toast.error("Client information not found");
        return;
      }

      // Filter selected invoices
      const selectedInvoiceData = invoices.filter((invoice) =>
        selectedInvoices.includes(invoice.id)
      );

      // Generate HTML for the summary
      const html = generateInvoiceSummaryHTML(
        selectedInvoiceData as unknown as InvoiceWithItems[],
        client,
        summaryTitle
      );

      // Generate PDF using the server API
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          filename: `${client.company_name.replace(/\s+/g, "-")}-Invoice-Summary-${format(
            new Date(),
            "yyyy-MM-dd"
          )}.pdf`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${client.company_name.replace(/\s+/g, "-")}-Invoice-Summary-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success("Invoice summary generated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating invoice summary:", error);
      toast.dismiss();
      toast.error("Failed to generate invoice summary");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Invoice Summary</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="summary-title" className="text-right">
              Title
            </Label>
            <Input
              id="summary-title"
              value={summaryTitle}
              onChange={(e) => setSummaryTitle(e.target.value)}
              className="col-span-3"
              placeholder="Payment Summary"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedClientId}
                onValueChange={handleClientChange}
                disabled={loadingClients}
              >
                <SelectTrigger id="client">
                  {loadingClients ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading clients...
                    </div>
                  ) : (
                    <SelectValue placeholder="Select a client" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClientId && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Invoices</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={invoices.length === 0 || loadingInvoices}
                >
                  {selectedInvoices.length === invoices.length && invoices.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              {loadingInvoices ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found for this client
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left w-8"></th>
                        <th className="p-2 text-left">Invoice #</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-right">Paid</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const isSelected = selectedInvoices.includes(invoice.id);
                        const amountPaid = invoice.amount_paid || 0;
                        const totalAmount = invoice.total_amount || 0;
                        const remaining = totalAmount - amountPaid;
                        let statusClass = "";

                        if (invoice.status.toLowerCase() === "paid") {
                          statusClass = "bg-green-100 text-green-800";
                        } else if (invoice.status.toLowerCase() === "unpaid") {
                          statusClass = "bg-red-100 text-red-800";
                        } else if (invoice.status.toLowerCase() === "partial") {
                          statusClass = "bg-yellow-100 text-yellow-800";
                        }

                        return (
                          <tr
                            key={invoice.id}
                            className={`border-t hover:bg-muted/50 ${
                              isSelected ? "bg-blue-50" : ""
                            }`}
                          >
                            <td className="p-2 text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleInvoiceToggle(invoice.id)}
                              />
                            </td>
                            <td className="p-2">{invoice.invoice_number}</td>
                            <td className="p-2">
                              {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                            </td>
                            <td className="p-2 text-right">
                              {totalAmount.toLocaleString("en-KE", {
                                style: "currency",
                                currency: "KES",
                              })}
                            </td>
                            <td className="p-2 text-right">
                              {amountPaid.toLocaleString("en-KE", {
                                style: "currency",
                                currency: "KES",
                              })}
                            </td>
                            <td className="p-2 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                              >
                                {invoice.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generatingPdf}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateSummary}
            disabled={
              selectedInvoices.length === 0 ||
              !selectedClientId ||
              generatingPdf
            }
          >
            {generatingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
