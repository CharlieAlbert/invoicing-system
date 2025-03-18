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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createQuotation,
  addQuotationItems,
  getQuotationById,
  getQuotations,
} from "@/lib/supabase/server-extended/quotations";
import { getClients } from "@/lib/supabase/server-extended/clients";
import { getProducts } from "@/lib/supabase/server-extended/products";
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
  Clock3,
  Download,
  Loader2,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { generatePDF } from "@/utils/pdf/generatePDF";
import html2pdf from "html2pdf.js";

export default function QuotationsPage() {
  // Types
  type QuotationItem = {
    id: number;
    product: string;
    product_variant_id: string;
    quantity: string;
    price: string;
    productName?: string;
    variantName?: string;
  };

  type Client = {
    id: string;
    company_name: string;
    company_email: string;
  };

  type Product = {
    id: string;
    name: string;
    description: string | null;
    type: string;
    created_at: string | null;
    updated_at: string | null;
    variants: ProductVariant[];
  };

  type ProductVariant = {
    id: string;
    product_id: string;
    size: number;
    unit: string;
    cost_price: number | null;
    selling_price: number;
    sku: string | null;
    created_at: string | null;
    updated_at: string | null;
  };

  type Quotation = {
    client_id: string | null;
    created_at: string | null;
    created_by: string | null;
    discount: number | null;
    final_amount: number | null;
    id: string;
    status: "pending" | "approved" | "rejected" | null;
    total_amount: number | null;
    valid_until: string | null;
    vat: number | null;
    client?: {
      company_name: string;
    } | null;
  };

  // State
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("create");
  const [loading, setLoading] = useState(false);
  const [quotationsLoading, setQuotationsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    price: "",
    discount: "0",
    vat: "16", // Default VAT in Kenya
    valid_until: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days validity
  });

  const { user } = useAuth();

  // Fetch clients, products, and quotations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const clientsData = await getClients();
        setClients(clientsData);

        // Fetch products
        const productsData = await getProducts();
        setProducts(productsData);

        // Fetch quotations
        fetchQuotations();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const fetchQuotations = async () => {
    try {
      setQuotationsLoading(true);
      const quotationsData = await getQuotations();
      setQuotations(quotationsData || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setQuotationsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (value: string) => {
    setSelectedProductId(value);
    setSelectedVariantId(""); // Reset variant selection when product changes
  };

  const handleVariantChange = (value: string) => {
    setSelectedVariantId(value);

    // Auto-fill price based on the selected variant
    const selectedProduct = products.find((p) => p.id === selectedProductId);
    if (selectedProduct) {
      const selectedVariant = selectedProduct.variants.find(
        (v) => v.id === value
      );
      if (selectedVariant) {
        setFormData((prev) => ({
          ...prev,
          price: selectedVariant.selling_price.toString(),
        }));
      }
    }
  };

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !selectedProductId ||
      !selectedVariantId ||
      !formData.quantity ||
      !formData.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Find product and variant details for display
    const selectedProduct = products.find((p) => p.id === selectedProductId);
    const selectedVariant = selectedProduct?.variants.find(
      (v) => v.id === selectedVariantId
    );

    if (!selectedProduct || !selectedVariant) {
      toast.error("Invalid product or variant selected");
      return;
    }

    setQuotationItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: selectedProductId,
        product_variant_id: selectedVariantId,
        quantity: formData.quantity,
        price: formData.price,
        productName: selectedProduct.name,
        variantName: `${selectedVariant.size} ${selectedVariant.unit}`,
      },
    ]);

    // Reset form fields except discount and VAT
    setFormData((prev) => ({
      ...prev,
      product: "",
      quantity: "",
      price: "",
    }));

    // Reset product and variant selection
    setSelectedProductId("");
    setSelectedVariantId("");

    toast.success("Item added to quotation");
  };

  const handleRemoveItem = (id: number) => {
    setQuotationItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from quotation");
  };

  const handleCreateQuotation = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (quotationItems.length === 0) {
      toast.error("Please add at least one item to the quotation");
      return;
    }

    try {
      setLoading(true);

      const totalAmount = quotationItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.price),
        0
      );

      const discount = Number(formData.discount);
      const vat = Number(formData.vat);
      const finalAmount = totalAmount - discount + (totalAmount * vat) / 100;

      const quotation = await createQuotation({
        client_id: selectedClientId,
        created_by: user?.id || "",
        total_amount: totalAmount,
        discount,
        vat,
        final_amount: finalAmount,
        valid_until: formData.valid_until.toISOString(),
        status: "pending",
      });

      const items = quotationItems.map((item) => ({
        quotation_id: quotation.id,
        product_id: item.product,
        product_variant_id: item.product_variant_id,
        quantity: Number(item.quantity),
        price_per_unit: Number(item.price),
        total_amount: Number(item.quantity) * Number(item.price),
      }));

      await addQuotationItems(items);

      toast.success("Quotation created successfully");

      setQuotationItems([]);
      setSelectedClientId("");
      setFormData({
        product: "",
        quantity: "",
        price: "",
        discount: "0",
        vat: "16",
        valid_until: new Date(new Date().setDate(new Date().getDate() + 30)),
      });

      fetchQuotations();

      setActiveTab("list");

      handleGeneratePDF(quotation.id);
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error("Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (quotationId: string) => {
    try {
      setLoading(true);
      const quotationData = await getQuotationById(quotationId);

      if (!quotationData) {
        toast.error("Quotation not found");
        return;
      }

      const clientInfo = clients.find((c) => c.id === quotationData.client_id);
      if (!clientInfo) {
        toast.error("Client information not found");
        return;
      }

      let items = [
        {
          productName: "WALLMASTER WHITE",
          variantName: "20x30 KGS",
          quantity: "20",
          price: "Ksh3,500.00",
          total: "Ksh70,000.00",
        },
        {
          productName: "WEATHERGUARD",
          variantName: "6x4 KGS",
          quantity: "6",
          price: "Ksh2,300.00",
          total: "Ksh13,800.00",
        },
      ];

      const subtotal = formatCurrency(quotationData.total_amount || 0);
      const discount = formatCurrency(quotationData.discount || 0);
      const vat = quotationData.vat || 16;
      const grandTotal = formatCurrency(quotationData.final_amount || 0);

      const companyInfo = {
        name: "ANKARDS COMPANY LIMITED",
        poBox: "209 - 00516",
        tel: "0491-0000",
        mobile: "+324 721 581 999",
        fax: "+324 721 581 999",
        email: "info@ankards.co.kr",
      };

      // Request PDF generation
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo,
          items,
          subtotal,
          discount,
          vat,
          grandTotal,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "quotation.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal
  const subtotal = quotationItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
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
      case "approved":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock3 className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  // Filter quotations
  const filteredQuotations = quotations.filter((quotation) => {
    // Status filter
    if (statusFilter !== "all" && quotation.status !== statusFilter) {
      return false;
    }

    // Search filter - check client name if available
    if (searchQuery && quotation.client) {
      return quotation.client.company_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quotation Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage quotations for your clients
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
            Create Quotation
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <FileText className="h-4 w-4" />
            Quotation List
          </TabsTrigger>
        </TabsList>

        {/* Create Quotation Tab */}
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
                    Select the client for this quotation
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
                    Add products to your quotation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="product"
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Product
                      </Label>
                      <Select
                        value={selectedProductId}
                        onValueChange={handleProductChange}
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

                    {selectedProductId && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="variant"
                          className="flex items-center gap-1"
                        >
                          <Package className="h-4 w-4" />
                          Variant
                        </Label>
                        <Select
                          value={selectedVariantId}
                          onValueChange={handleVariantChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant" />
                          </SelectTrigger>
                          <SelectContent>
                            {products
                              .find((p) => p.id === selectedProductId)
                              ?.variants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.size} {variant.unit} -{" "}
                                  {formatCurrency(variant.selling_price)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

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
                          htmlFor="price"
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-4 w-4" />
                          Price (KES)
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quotation Settings Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Quotation Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure discount, VAT, and validity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                        htmlFor="valid_until"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-4 w-4" />
                        Valid Until
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.valid_until && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.valid_until ? (
                              format(formData.valid_until, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.valid_until}
                            onSelect={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                valid_until: date || new Date(),
                              }))
                            }
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quotation Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Quotation Summary</CardTitle>
                  </div>
                  <CardDescription>
                    Review and finalize your quotation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {quotationItems.length === 0 ? (
                    <div className="text-center py-10 border-t">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">
                        No items added yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add items to your quotation using the form
                      </p>
                    </div>
                  ) : (
                    <div className="border-t">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quotationItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.productName}
                              </TableCell>
                              <TableCell>{item.variantName}</TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(Number(item.price))}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  Number(item.quantity) * Number(item.price)
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                {quotationItems.length > 0 && (
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
                        <span className="text-muted-foreground">
                          VAT ({formData.vat}%):
                        </span>
                        <span>+ {formatCurrency(vatAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateQuotation}
                      className="mt-6 w-full max-w-xs"
                      disabled={
                        loading ||
                        quotationItems.length === 0 ||
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
                          <FileText className="mr-2 h-4 w-4" />
                          Create Quotation
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Quotation List Tab */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Quotation List</CardTitle>
                  <CardDescription>
                    View and manage all your quotations
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search quotations..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchQuotations}
                    disabled={quotationsLoading}
                    title="Refresh"
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        quotationsLoading && "animate-spin"
                      )}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {quotationsLoading ? (
                <div className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading quotations...</p>
                </div>
              ) : filteredQuotations.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-muted/20 border-dashed">
                  {searchQuery || statusFilter !== "all" ? (
                    <>
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">
                        No quotations found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try a different search term or filter
                      </p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">
                        No quotations yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create your first quotation using the Create tab
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
                          <TableHead>ID</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Valid Until</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuotations.map((quotation) => (
                          <TableRow key={quotation.id} className="group">
                            <TableCell className="font-medium">
                              #{quotation.id.substring(0, 8)}
                            </TableCell>
                            <TableCell>
                              {quotation.client?.company_name ||
                                "Unknown Client"}
                            </TableCell>
                            <TableCell>
                              {quotation.final_amount
                                ? formatCurrency(quotation.final_amount)
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {formatDate(quotation.created_at)}
                            </TableCell>
                            <TableCell>
                              {formatDate(quotation.valid_until)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(quotation.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleGeneratePDF(quotation.id)
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </div>
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
    </div>
  );
}
