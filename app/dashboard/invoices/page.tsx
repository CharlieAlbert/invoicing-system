"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  Trash2,
  FileText,
  Building2,
  Package,
  Calculator,
  Calendar,
  DollarSign,
  Percent,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  Receipt,
  ClipboardList,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  FileCheck,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getClients } from "@/lib/supabase/server-extended/clients";
import { getProducts } from "@/lib/supabase/server-extended/products";
import {
  getInvoiceWithItems,
  createInvoice,
  deleteInvoice,
  deleteInvoiceItem,
  updateInvoiceItem,
  getInvoices,
} from "@/lib/supabase/server-extended/invoices";
import { Database } from "@/lib/supabase/types";

export default function InvoicesPage() {
  // Types
  type InvoiceItem = {
    id: string | number;
    product_id: string;
    product_variant_id?: string | null;
    description: string;
    quantity: number;
    price_per_unit: number;
    total_amount: number;
    product?: {
      name: string;
      description: string;
      type: string;
    };
    product_variant?: {
      size: number;
      unit: string;
      sku: string;
    };
    isNew?: boolean;
  };

  type Invoice = {
    id: string;
    invoice_number: string;
    client_id: string;
    invoice_date: string;
    due_date: string;
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    total_amount: number;
    discount: number;
    vat: number;
    final_amount: number;
    notes?: string | null;
    created_at: string;
    created_by: string;
    client?: {
      company_name: string;
      company_email: string;
      phone?: string | null;
      contact_person?: string | null;
      address?: string | null;
    };
    items?: InvoiceItem[];
  };

  type Client = {
    id: string;
    company_name: string;
    company_email: string;
    phone?: string | null;
    contact_person?: string | null;
    address?: string | null;
  };

  type Product = {
    id: string;
    name: string;
    description: string | null;
    type: Database["public"]["Enums"]["product_type"];
    created_at: string | null;
    updated_at: string | null;
    variants: {
      id: string;
      product_id: string;
      size: number;
      unit: string;
      cost_price: number | null;
      selling_price: number;
      sku: string | null;
      created_at: string | null;
      updated_at: string | null;
    }[];
  };

  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<string>("create");
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("invoice_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<InvoiceItem | null>(
    null
  );
  const [formData, setFormData] = useState({
    product_id: "",
    product_variant_id: "",
    description: "",
    quantity: 1,
    price_per_unit: 0,
    invoice_date: new Date(),
    due_date: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days
    discount: 0,
    vat: 7.5, // Default VAT rate
    notes: "",
  });

  const { user } = useAuth();

  // Fetch clients, products, and invoices on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const clientsData = await getClients();
        setClients(clientsData);

        // Fetch products
        const productsData = await getProducts();
        setProducts(productsData);

        // Fetch invoices
        fetchInvoices();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);

      // Fetch invoices from Supabase
      const response = await getInvoices();

      if (response.success && response.data) {
        setInvoices(response.data as Invoice[]);
      } else {
        toast.error(response.error || "Failed to load invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Fetch invoice details for viewing
  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoadingDetails(true);

      // Fetch invoice data
      const invoiceData = await getInvoiceWithItems(invoiceId);
      if (!invoiceData.success || !invoiceData.data) {
        toast.error("Invoice not found");
        return;
      }

      // Convert the InvoiceWithItems to Invoice type
      const invoice = invoiceData.data;

      // Ensure all required fields are present and have the correct types
      if (!invoice.invoice_number) {
        toast.error("Invalid invoice data: missing invoice number");
        return;
      }

      // Map the invoice items to match the InvoiceItem type in the component
      const mappedItems: InvoiceItem[] = invoice.items.map((item) => {
        // Access the nested properties using the correct aliases from the query
        return {
          id: item.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          description: item.products?.description || "",
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          total_amount: item.total_amount,
          product: item.products
            ? {
                name: item.products.name,
                description: item.products.description || "",
                type: item.products.type,
              }
            : undefined,
          product_variant: item.product_variants
            ? {
                size: item.product_variants.size,
                unit: item.product_variants.unit,
                sku: item.product_variants.sku || "",
              }
            : undefined,
        };
      });

      // Set the selected invoice with its items
      setSelectedInvoice({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        invoice_date: invoice.invoice_date || "",
        due_date: invoice.due_date || "",
        status: invoice.status as
          | "draft"
          | "sent"
          | "paid"
          | "overdue"
          | "cancelled",
        total_amount: invoice.total_amount || 0,
        discount: invoice.discount || 0,
        vat: invoice.vat || 0,
        final_amount: invoice.final_amount || 0,
        notes: invoice.notes,
        created_at: invoice.created_at || "",
        created_by: invoice.created_by || "",
        client: invoice.client,
        items: mappedItems,
      });
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error("Failed to load invoice details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Generate PDF for an invoice
  const handleGeneratePDF = async (invoiceId: string) => {
    try {
      setLoadingPdf(true);
      toast.loading("Generating PDF...");

      // Fetch invoice data
      const invoiceData = await getInvoiceWithItems(invoiceId);
      if (!invoiceData.success || !invoiceData.data) {
        toast.error("Invoice not found");
        return;
      }

      const invoice = invoiceData.data;

      // Fetch client information
      const clientInfo = invoice.client;
      if (!clientInfo) {
        toast.error("Client information not found");
        return;
      }

      // Map items to the format needed for the PDF
      const items = invoice.items.map((item) => {
        return {
          productName: item.products?.name || "Product",
          variantName: item.product_variants
            ? `${item.product_variants.size} ${item.product_variants.unit}`
            : "Standard",
          quantity: item.quantity.toString(),
          price: formatCurrency(item.price_per_unit || 0),
          total: formatCurrency(item.total_amount || 0),
        };
      });

      // If no items were found, warn the user
      if (!items.length) {
        toast.warning("No items found in this invoice");
      }

      // Calculate financial values
      const subtotal = formatCurrency(invoice.total_amount || 0);
      const discount = formatCurrency(invoice.discount || 0);
      const vat = invoice.vat || 16;
      const grandTotal = formatCurrency(invoice.final_amount || 0);

      // Company information
      const companyInfo = {
        name: "ANKARDS COMPANY LIMITED",
        poBox: "209 - 00516",
        tel: "+254 725 672 249",
        mobile: "+254 721 891 399",
        email: "info@ankards.co.ke",
      };

      // Create HTML for the invoice
      const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      body {
        font-family: 'Roboto', Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
        background-color: #f9f9f9;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 20px auto;
        background-color: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        padding: 40px;
        border-radius: 8px;
        position: relative;
      }
      
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 100px;
        opacity: 0.03;
        color: #000;
        pointer-events: none;
        z-index: 0;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        border-bottom: 1px solid #eee;
        padding-bottom: 20px;
      }
      
      .logo {
        font-size: 28px;
        font-weight: 700;
        color: #2563eb;
      }
      
      .company-info {
        text-align: right;
        font-size: 14px;
      }
      
      .invoice-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .client-info {
        max-width: 50%;
      }
      
      .invoice-info {
        text-align: right;
      }
      
      .invoice-id {
        font-size: 18px;
        font-weight: 700;
        color: #2563eb;
        margin-bottom: 10px;
      }
      
      .invoice-status {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 15px;
      }
      
      .status-draft {
        background-color: #f3f4f6;
        color: #6b7280;
      }
      
      .status-sent {
        background-color: #dbeafe;
        color: #2563eb;
      }
      
      .status-paid {
        background-color: #dcfce7;
        color: #16a34a;
      }
      
      .status-overdue {
        background-color: #fee2e2;
        color: #dc2626;
      }
      
      .dates {
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .dates span {
        font-weight: 500;
      }
      
      h2 {
        font-size: 18px;
        margin-bottom: 15px;
        color: #1f2937;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      th {
        background-color: #f9fafb;
        padding: 12px 15px;
        text-align: left;
        font-weight: 500;
        font-size: 14px;
        color: #4b5563;
        border-bottom: 1px solid #e5e7eb;
      }
      
      td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
      }
      
      .item-name {
        font-weight: 500;
      }
      
      .item-description {
        color: #6b7280;
        font-size: 13px;
      }
      
      .text-right {
        text-align: right;
      }
      
      .summary {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 30px;
      }
      
      .summary-table {
        width: 300px;
      }
      
      .summary-table td {
        padding: 8px 0;
        border: none;
      }
      
      .summary-table .total-row {
        font-weight: 700;
        font-size: 16px;
        color: #2563eb;
      }
      
      .notes {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
      
      .notes-title {
        font-weight: 500;
        margin-bottom: 10px;
      }
      
      .notes-content {
        font-size: 14px;
        color: #6b7280;
      }
      
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="watermark">INVOICE</div>
      
      <div class="header">
        <div class="logo">${companyInfo.name}</div>
        <div class="company-info">
          <div>P.O. Box ${companyInfo.poBox}</div>
          <div>Tel: ${companyInfo.tel}</div>
          <div>Mobile: ${companyInfo.mobile}</div>
          <div>Email: ${companyInfo.email}</div>
        </div>
      </div>
      
      <div class="invoice-details">
        <div class="client-info">
          <h2>Bill To:</h2>
          <div><strong>${clientInfo?.company_name || "Client"}</strong></div>
          <div>${clientInfo?.contact_person || ""}</div>
          <div>${clientInfo?.address || ""}</div>
          <div>${clientInfo?.company_email || ""}</div>
          <div>${clientInfo?.phone || ""}</div>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-id">Invoice #${invoice.invoice_number}</div>
          <div class="invoice-status status-${invoice.status.toLowerCase()}">${invoice.status.toUpperCase()}</div>
          <div class="dates"><span>Issue Date:</span> ${format(
            new Date(invoice.invoice_date),
            "dd/MM/yyyy"
          )}</div>
          <div class="dates"><span>Due Date:</span> ${format(
            new Date(invoice.due_date),
            "dd/MM/yyyy"
          )}</div>
        </div>
      </div>
      
      <h2>Invoice Items</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td>
                <div class="item-name">${item.productName}</div>
                <div class="item-description">${item.variantName}</div>
              </td>
              <td>${item.quantity}</td>
              <td>${item.price}</td>
              <td class="text-right">${item.total}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="summary">
        <table class="summary-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">${subtotal}</td>
          </tr>
          <tr>
            <td>Discount:</td>
            <td class="text-right">${discount}</td>
          </tr>
          <tr>
            <td>VAT (${vat}%):</td>
            <td class="text-right">${formatCurrency(
              (invoice.total_amount * vat) / 100
            )}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="text-right">${grandTotal}</td>
          </tr>
        </table>
      </div>
      
      ${
        invoice.notes
          ? `
      <div class="notes">
        <div class="notes-title">Notes:</div>
        <div class="notes-content">${invoice.notes}</div>
      </div>
      `
          : ""
      }
      
      <div class="footer">
        Thank you for your business!
      </div>
    </div>
  </body>
  </html>`;

      // Generate PDF using the server API
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          filename: `Invoice-${invoice.invoice_number}.pdf`,
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
      a.download = `Invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      product_id: value,
      product_variant_id: "",
    }));

    // Reset price if product changes
    setFormData((prev) => ({
      ...prev,
      price_per_unit: 0,
    }));

    // Auto-fill description
    const selectedProduct = products.find((p) => p.id === value);
    if (selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        description: selectedProduct.name,
      }));
    }
  };

  const handleVariantSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, product_variant_id: value }));

    // Auto-fill price if variant is selected
    const selectedProduct = products.find((p) => p.id === formData.product_id);
    if (selectedProduct) {
      const selectedVariant = selectedProduct.variants?.find(
        (v) => v.id === value
      );
      if (selectedVariant) {
        setFormData((prev) => ({
          ...prev,
          price_per_unit: selectedVariant.selling_price,
          description: `${selectedProduct.name} - ${selectedVariant.size} ${selectedVariant.unit}`,
        }));
      }
    }
  };

  const handleAddItem = () => {
    if (
      !formData.product_id ||
      formData.quantity <= 0 ||
      formData.price_per_unit <= 0
    ) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    // Find product and variant for display
    const selectedProduct = products.find((p) => p.id === formData.product_id);
    const selectedVariant = selectedProduct?.variants?.find(
      (v) => v.id === formData.product_variant_id
    );

    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      product_id: formData.product_id,
      product_variant_id: formData.product_variant_id || null,
      description: formData.description,
      quantity: formData.quantity,
      price_per_unit: formData.price_per_unit,
      total_amount: formData.quantity * formData.price_per_unit,
      isNew: true,
      product: {
        name: selectedProduct?.name || "",
        description: selectedProduct?.description || "",
        type: selectedProduct?.type || "",
      },
      product_variant: selectedVariant
        ? {
            size: selectedVariant.size,
            unit: selectedVariant.unit,
            sku: selectedVariant.sku || "",
          }
        : undefined,
    };

    setInvoiceItems((prev) => [...prev, newItem]);

    // Reset form fields
    setFormData((prev) => ({
      ...prev,
      product_id: "",
      product_variant_id: "",
      description: "",
      quantity: 1,
      price_per_unit: 0,
    }));

    toast.success("Item added to invoice");
  };

  const handleRemoveItem = (id: string | number) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from invoice");
  };

  const handleEditItem = (item: InvoiceItem) => {
    setCurrentEditItem(item);
    setIsEditItemDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (!currentEditItem) return;

    // Update the item in the list
    setInvoiceItems((prev) =>
      prev.map((item) =>
        item.id === currentEditItem.id
          ? {
              ...currentEditItem,
              total_amount:
                currentEditItem.quantity * currentEditItem.price_per_unit,
            }
          : item
      )
    );

    setIsEditItemDialogOpen(false);
    setCurrentEditItem(null);
    toast.success("Item updated");
  };

  const handleCreateInvoice = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    try {
      setLoading(true);

      // Prepare invoice data
      const invoiceData = {
        client_id: selectedClientId,
        created_by: user?.id,
        invoice_date: formData.invoice_date.toISOString(),
        due_date: formData.due_date.toISOString(),
        status: "pending" as const,
        discount: formData.discount,
        vat: formData.vat,
        notes: formData.notes || null,
        total_amount: invoiceItems.reduce(
          (sum, item) => sum + item.total_amount,
          0
        ),
        final_amount: calculateFinalAmount(),
      };

      // Prepare invoice items
      const items = invoiceItems.map((item) => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id || null,
        description: item.description,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        total_amount: item.total_amount,
      }));

      // Call the actual createInvoice function
      const response = await createInvoice(invoiceData, items);

      if (response.success && response.invoice_id) {
        toast.success("Invoice created successfully");
        // Reset form and fetch updated invoices
        resetForm();
        fetchInvoices();
        setActiveTab("list");
      } else {
        toast.error(response.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);

      // Call the actual deleteInvoice function from the Supabase API
      const response = await deleteInvoice(invoiceId);

      if (response.success) {
        // Remove from local state
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        toast.success("Invoice deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete invoice");
      }

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInvoiceItems([]);
    setSelectedClientId("");
    setFormData({
      product_id: "",
      product_variant_id: "",
      description: "",
      quantity: 1,
      price_per_unit: 0,
      invoice_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      discount: 0,
      vat: 7.5,
      notes: "",
    });
  };

  // Calculate subtotal
  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  // Calculate discount amount
  const discountAmount = Number(formData.discount);

  // Calculate VAT amount
  const vatAmount = (subtotal * Number(formData.vat)) / 100;

  // Calculate final total
  const finalTotal = subtotal - discountAmount + vatAmount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Overdue
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="default" className="gap-1">
            <FileCheck className="h-3 w-3" /> Sent
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="gap-1 text-destructive">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <ClipboardList className="h-3 w-3" /> Draft
          </Badge>
        );
    }
  };

  // Sort invoices
  const sortInvoices = (a: Invoice, b: Invoice) => {
    let comparison = 0;

    switch (sortField) {
      case "invoice_number":
        comparison = a.invoice_number.localeCompare(b.invoice_number);
        break;
      case "client":
        comparison = (a.client?.company_name || "").localeCompare(
          b.client?.company_name || ""
        );
        break;
      case "amount":
        comparison = a.final_amount - b.final_amount;
        break;
      case "invoice_date":
        comparison =
          new Date(a.invoice_date).getTime() -
          new Date(b.invoice_date).getTime();
        break;
      case "due_date":
        comparison =
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      case "status":
        comparison = (a.status || "").localeCompare(b.status || "");
        break;
      default:
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    return sortDirection === "asc" ? comparison : -comparison;
  };

  // Filter invoices
  const filteredInvoices = invoices
    .filter((invoice) => {
      // Status filter
      if (statusFilter !== "all" && invoice.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          (invoice.client?.company_name || "")
            .toLowerCase()
            .includes(searchLower) ||
          (invoice.notes || "").toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort(sortInvoices);

  const calculateFinalAmount = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + item.total_amount,
      0
    );
    const discountAmount = Number(formData.discount);
    const vatAmount = (subtotal * Number(formData.vat)) / 100;
    return subtotal - discountAmount + vatAmount;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage invoices for your clients
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="create"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Receipt className="h-4 w-4" />
            Invoice List
          </TabsTrigger>
        </TabsList>

        {/* Create Invoice Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Client Selection & Item Form */}
            <div className="space-y-6">
              {/* Client Selection Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>Client Information</CardTitle>
                  </div>
                  <CardDescription>
                    Select the client for this invoice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedClientId}
                    onValueChange={setSelectedClientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedClientId && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium">
                        {
                          clients.find((c) => c.id === selectedClientId)
                            ?.company_name
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {
                          clients.find((c) => c.id === selectedClientId)
                            ?.company_email
                        }
                      </p>
                      {clients.find((c) => c.id === selectedClientId)
                        ?.contact_person && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Contact:{" "}
                          {
                            clients.find((c) => c.id === selectedClientId)
                              ?.contact_person
                          }
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Item Form Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>Add Item</CardTitle>
                  </div>
                  <CardDescription>
                    Add products to your invoice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="product"
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Product
                      </Label>
                      <Select
                        value={formData.product_id}
                        onValueChange={handleProductSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.product_id &&
                      products.find((p) => p.id === formData.product_id)
                        ?.variants && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="variant"
                            className="flex items-center gap-1"
                          >
                            <Package className="h-4 w-4" />
                            Variant
                          </Label>
                          <Select
                            value={formData.product_variant_id}
                            onValueChange={handleVariantSelect}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent>
                              {products
                                .find((p) => p.id === formData.product_id)
                                ?.variants?.map((variant) => (
                                  <SelectItem
                                    key={variant.id}
                                    value={variant.id}
                                  >
                                    {variant.size} {variant.unit} -{" "}
                                    {formatCurrency(variant.selling_price)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Item description"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="quantity"
                          className="flex items-center gap-1"
                        >
                          <Calculator className="h-4 w-4" />
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="price_per_unit"
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-4 w-4" />
                          Price (KES)
                        </Label>
                        <Input
                          id="price_per_unit"
                          name="price_per_unit"
                          type="number"
                          value={formData.price_per_unit}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Settings Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <CardTitle>Invoice Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure dates, discount, VAT, and notes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="invoice_date"
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-4 w-4" />
                          Invoice Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.invoice_date &&
                                  "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.invoice_date ? (
                                format(formData.invoice_date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={formData.invoice_date}
                              onSelect={(date) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  invoice_date: date || new Date(),
                                }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="due_date"
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-4 w-4" />
                          Due Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.due_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.due_date ? (
                                format(formData.due_date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={formData.due_date}
                              onSelect={(date) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  due_date: date || new Date(),
                                }))
                              }
                              initialFocus
                              disabled={(date) => date < formData.invoice_date}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="discount"
                          className="flex items-center gap-1"
                        >
                          <Percent className="h-4 w-4" />
                          Discount (KES)
                        </Label>
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          value={formData.discount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="vat"
                          className="flex items-center gap-1"
                        >
                          <Percent className="h-4 w-4" />
                          VAT (%)
                        </Label>
                        <Input
                          id="vat"
                          name="vat"
                          type="number"
                          value={formData.vat}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Notes
                      </Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes for the invoice"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Invoice Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <CardTitle>Invoice Summary</CardTitle>
                  </div>
                  <CardDescription>
                    Review and finalize your invoice
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {invoiceItems.length === 0 ? (
                    <div className="text-center py-10 border-t">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">
                        No items added yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add items to your invoice using the form
                      </p>
                    </div>
                  ) : (
                    <div className="border-t">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.description}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.price_per_unit)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.total_amount)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditItem(item)}
                                    className="h-8 w-8"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                {invoiceItems.length > 0 && (
                  <CardFooter className="flex-col items-end pt-6">
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount:</span>
                        <span>- {formatCurrency(discountAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VAT:</span>
                        <span>+ {formatCurrency(vatAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateInvoice}
                      className="mt-6 w-full max-w-xs"
                      disabled={
                        loading ||
                        invoiceItems.length === 0 ||
                        !selectedClientId
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Receipt className="mr-2 h-4 w-4" />
                          Create Invoice
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Invoice List Tab */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Invoice List</CardTitle>
                  <CardDescription>
                    View and manage all your invoices
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchInvoices}
                    disabled={invoicesLoading}
                    title="Refresh"
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        invoicesLoading && "animate-spin"
                      )}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {invoicesLoading ? (
                <div className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading invoices...</p>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-muted/20 border-dashed">
                  {searchQuery || statusFilter !== "all" ? (
                    <>
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">
                        No invoices found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try a different search term or filter
                      </p>
                    </>
                  ) : (
                    <>
                      <Receipt className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">
                        No invoices yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create your first invoice using the Create tab
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => {
                              setSortDirection(
                                sortField === "invoice_number"
                                  ? sortDirection === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc"
                              );
                              setSortField("invoice_number");
                            }}
                          >
                            <div className="flex items-center gap-1">
                              Invoice #
                              {sortField === "invoice_number" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => {
                              setSortDirection(
                                sortField === "client"
                                  ? sortDirection === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc"
                              );
                              setSortField("client");
                            }}
                          >
                            <div className="flex items-center gap-1">
                              Client
                              {sortField === "client" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => {
                              setSortDirection(
                                sortField === "invoice_date"
                                  ? sortDirection === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc"
                              );
                              setSortField("invoice_date");
                            }}
                          >
                            <div className="flex items-center gap-1">
                              Issue Date
                              {sortField === "invoice_date" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => {
                              setSortDirection(
                                sortField === "due_date"
                                  ? sortDirection === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc"
                              );
                              setSortField("due_date");
                            }}
                          >
                            <div className="flex items-center gap-1">
                              Due Date
                              {sortField === "due_date" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => {
                              setSortDirection(
                                sortField === "amount"
                                  ? sortDirection === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc"
                              );
                              setSortField("amount");
                            }}
                          >
                            <div className="flex justify-between font-medium">
                              <span>Amount</span>
                              {sortField === "amount" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => {
                              setSortDirection(
                                sortField === "status"
                                  ? sortDirection === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc"
                              );
                              setSortField("status");
                            }}
                          >
                            <div className="flex items-center gap-1">
                              Status
                              {sortField === "status" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="group">
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell>
                              {invoice.client?.company_name || "Unknown Client"}
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.invoice_date)}
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.due_date)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(invoice.final_amount)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(invoice.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      fetchInvoiceDetails(invoice.id);
                                      setIsViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleGeneratePDF(invoice.id)
                                    }
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setSelectedInvoice(invoice);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Item Dialog */}
      <Dialog
        open={isEditItemDialogOpen}
        onOpenChange={setIsEditItemDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice Item</DialogTitle>
            <DialogDescription>
              Update the details of this invoice item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={currentEditItem?.description || ""}
                onChange={(e) =>
                  setCurrentEditItem((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={currentEditItem?.quantity || 0}
                  onChange={(e) =>
                    setCurrentEditItem((prev) =>
                      prev
                        ? { ...prev, quantity: Number(e.target.value) }
                        : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (KES)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentEditItem?.price_per_unit || 0}
                  onChange={(e) =>
                    setCurrentEditItem((prev) =>
                      prev
                        ? { ...prev, price_per_unit: Number(e.target.value) }
                        : null
                    )
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoice_number} -{" "}
              {selectedInvoice?.client?.company_name}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">
                Loading invoice details...
              </p>
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Client
                  </h3>
                  <p className="font-medium">
                    {selectedInvoice.client?.company_name}
                  </p>
                  <p className="text-sm">
                    {selectedInvoice.client?.contact_person}
                  </p>
                  <p className="text-sm">
                    {selectedInvoice.client?.company_email}
                  </p>
                  {selectedInvoice.client?.address && (
                    <p className="text-sm">{selectedInvoice.client.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Invoice Details
                  </h3>
                  <p className="font-medium">
                    {selectedInvoice.invoice_number}
                  </p>
                  <p className="text-sm">
                    Issue Date: {formatDate(selectedInvoice.invoice_date)}
                  </p>
                  <p className="text-sm">
                    Due Date: {formatDate(selectedInvoice.due_date)}
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Items</h3>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                          {item.product_variant && (
                            <div className="text-xs text-muted-foreground">
                              {item.product_variant.size}{" "}
                              {item.product_variant.unit}
                              {item.product_variant.sku &&
                                ` (SKU: ${item.product_variant.sku})`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price_per_unit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>- {formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT:</span>
                    <span>+ {formatCurrency(selectedInvoice.vat)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.final_amount)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-muted/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-1">Notes</h3>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Invoice not found</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                selectedInvoice && handleGeneratePDF(selectedInvoice.id)
              }
              disabled={!selectedInvoice || loadingPdf}
            >
              {loadingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice{" "}
              {selectedInvoice?.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedInvoice && handleDeleteInvoice(selectedInvoice.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
