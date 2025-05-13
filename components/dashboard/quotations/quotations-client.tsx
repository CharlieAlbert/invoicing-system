"use client";

import type * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Trash2,
  FileText,
  Building2,
  Package,
  Download,
  Loader2,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  DollarSign,
  FileCheck,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  CalendarClock,
  Pencil,
  Calculator,
  Percent,
  ShoppingCart,
  CalendarIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getQuotationById,
  getQuotations,
  createQuotation,
  addQuotationItems,
  deleteQuotation,
  updateQuotationStatus,
} from "@/lib/supabase/server-extended/quotations";
import type { Database } from "@/lib/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define types for the component props
interface QuotationItem {
  id: string | number;
  product_id: string;
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
  };
  isNew?: boolean;
}

interface Quotation {
  id: string;
  quotation_number: string;
  client_id: string;
  created_at: string;
  created_by: string;
  total_amount: number;
  discount: number | null;
  vat: number | null;
  final_amount: number;
  valid_until: string;
  status: "pending" | "approved" | "rejected";
  notes?: string | null;
  client?: {
    company_name: string;
    company_email: string;
    contact_person?: string | null;
    address?: string | null;
  } | null;
  items?: QuotationItem[];
}

interface Client {
  id: string;
  company_name: string;
  company_email: string;
  contact_person?: string | null;
  address?: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  type: Database["public"]["Enums"]["product_type"];
  variants: {
    id: string;
    product_id: string;
    size: number;
    unit: string;
    cost_price: number | null;
    selling_price: number;
    created_at: string | null;
  }[];
}

interface QuotationsClientProps {
  initialQuotations: Quotation[];
  initialClients: Client[];
  initialProducts: Product[];
  user: any;
}

export default function QuotationsClient({
  initialQuotations,
  initialClients,
  initialProducts,
  user,
}: QuotationsClientProps) {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>(
    initialQuotations || []
  );
  const [clients, setClients] = useState<Client[]>(initialClients || []);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<QuotationItem | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>("list");

  // Create quotation state
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [creatingQuotation, setCreatingQuotation] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    product_variant_id: "",
    description: "",
    quantity: 1,
    price_per_unit: 0,
    discount: 0,
    vat: 16, // Default VAT in Kenya
    valid_until: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days validity
    notes: "",
  });

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      const quotationsData = await getQuotations();
      setQuotations(quotationsData as unknown as Quotation[]);
      toast.success("Quotations refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // View quotation details
  const viewQuotationDetails = async (quotationId: string) => {
    setLoading(true);
    try {
      const quotationData = await getQuotationById(quotationId);
      setSelectedQuotation(quotationData as unknown as Quotation);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load quotation details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete quotation
  const handleDeleteQuotation = async () => {
    if (!selectedQuotation) return;

    setLoading(true);
    try {
      const response = await deleteQuotation(selectedQuotation.id);
      if (response.success) {
        setQuotations(quotations.filter((q) => q.id !== selectedQuotation.id));
        setIsDeleteDialogOpen(false);
        setSelectedQuotation(null);
        toast.success("Quotation deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete quotation");
      }
    } catch (error) {
      toast.error("Failed to delete quotation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update quotation status
  const handleUpdateStatus = async (
    quotationId: string,
    status: "approved" | "rejected"
  ) => {
    setLoading(true);
    try {
      const response = await updateQuotationStatus(quotationId, status);
      if (response.success) {
        setQuotations(
          quotations.map((q) => (q.id === quotationId ? { ...q, status } : q))
        );
        if (selectedQuotation && selectedQuotation.id === quotationId) {
          setSelectedQuotation({ ...selectedQuotation, status });
        }
        toast.success(`Quotation ${status} successfully`);
      } else {
        toast.error(`Failed to update quotation status`);
      }
    } catch (error) {
      toast.error(`Failed to update quotation status`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get status badge
  const getStatusBadge = (status: string | null): React.ReactElement | null => {
    if (!status) return null;

    switch (status) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  // Sort quotations
  const sortQuotations = (a: Quotation, b: Quotation) => {
    let comparison = 0;

    switch (sortField) {
      case "quotation_number":
        comparison = (a.quotation_number || "").localeCompare(
          b.quotation_number || ""
        );
        break;
      case "client":
        comparison = (a.client?.company_name || "").localeCompare(
          b.client?.company_name || ""
        );
        break;
      case "amount":
        comparison = a.final_amount - b.final_amount;
        break;
      case "created_at":
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "valid_until":
        comparison =
          new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
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

  // Filter quotations based on search term and status
  const filteredQuotations = quotations
    .filter((quotation) => {
      // Status filter
      if (statusFilter !== "all" && quotation.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        return (
          (quotation.quotation_number || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (quotation.client?.company_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }

      return true;
    })
    .sort(sortQuotations);

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle input change for create quotation form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle product selection
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

  // Handle variant selection
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

  // Add item to quotation
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

    const newItem: QuotationItem = {
      id: `temp-${Date.now()}`,
      product_id: formData.product_id,
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
          }
        : undefined,
    };

    setQuotationItems((prev) => [...prev, newItem]);

    // Reset form fields
    setFormData((prev) => ({
      ...prev,
      product_id: "",
      product_variant_id: "",
      description: "",
      quantity: 1,
      price_per_unit: 0,
    }));

    toast.success("Item added to quotation");
  };

  // Remove item from quotation
  const handleRemoveItem = (id: string | number) => {
    setQuotationItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from quotation");
  };

  // Edit quotation item
  const handleEditItem = (item: QuotationItem) => {
    setCurrentEditItem(item);
    setIsEditItemDialogOpen(true);
  };

  // Update edited item
  const handleUpdateItem = () => {
    if (!currentEditItem) return;

    // Update the item in the list
    setQuotationItems((prev) =>
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

  // Create quotation
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
      setCreatingQuotation(true);

      // Calculate total amount
      const totalAmount = quotationItems.reduce(
        (sum, item) => sum + item.total_amount,
        0
      );

      // Apply discount and VAT
      const discount = Number(formData.discount);
      const vat = (totalAmount * Number(formData.vat)) / 100;
      const finalAmount = totalAmount - discount + vat;

      // Prepare quotation data
      const quotationData = {
        client_id: selectedClientId,
        created_by: user?.id || "",
        total_amount: totalAmount,
        discount: discount,
        vat: vat,
        final_amount: finalAmount,
        valid_until: formData.valid_until.toISOString(),
        status: "pending" as const,
        notes: formData.notes || null,
        quotation_number: "",
      };

      // Create quotation
      const response = await createQuotation(quotationData);

      if (response.id) {
        // Prepare quotation items
        const items = quotationItems.map((item) => ({
          quotation_id: response.id,
          product_id: item.product_id,
          description: item.description,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          total_amount: item.total_amount,
        }));

        // Add quotation items
        await addQuotationItems(items);

        toast.success("Quotation created successfully");

        // Reset form
        resetForm();

        // Refresh quotations list and switch to list tab
        await refreshData();
        setActiveTab("list");
      } else {
        toast.error("Failed to create quotation");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error("Failed to create quotation");
    } finally {
      setCreatingQuotation(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setQuotationItems([]);
    setSelectedClientId("");
    setFormData({
      product_id: "",
      product_variant_id: "",
      description: "",
      quantity: 1,
      price_per_unit: 0,
      discount: 0,
      vat: 16,
      valid_until: new Date(new Date().setDate(new Date().getDate() + 30)),
      notes: "",
    });
  };

  // Calculate subtotal
  const subtotal = quotationItems.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  // Calculate discount amount
  const discountAmount = Number(formData.discount);

  // Calculate VAT amount
  const vatAmount = (subtotal * Number(formData.vat)) / 100;

  // Calculate final total
  const finalTotal = subtotal - discountAmount + vatAmount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quotation Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage quotations for your clients
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="list"
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
                    Add products to your quotation
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
                        name="product_id"
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              quantity: Number(e.target.value),
                            }))
                          }
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price_per_unit: Number(e.target.value),
                            }))
                          }
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

              {/* Quotation Settings Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Quotation Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure discount, VAT, validity, and notes
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discount: Number(e.target.value),
                            }))
                          }
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              vat: Number(e.target.value),
                            }))
                          }
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
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes for the quotation"
                        rows={3}
                      />
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
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quotationItems.map((item) => (
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
                        creatingQuotation ||
                        quotationItems.length === 0 ||
                        !selectedClientId
                      }
                    >
                      {creatingQuotation ? (
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
        <TabsContent value="list" className="space-y-4">
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
                      type="search"
                      placeholder="Search quotations..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={statusFilter === "all" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("all")}
                      >
                        All Statuses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={statusFilter === "pending" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("pending")}
                      >
                        <Clock3 className="mr-2 h-4 w-4" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={
                          statusFilter === "approved" ? "bg-muted" : ""
                        }
                        onClick={() => setStatusFilter("approved")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={
                          statusFilter === "rejected" ? "bg-muted" : ""
                        }
                        onClick={() => setStatusFilter("rejected")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refreshData}
                    disabled={loading}
                    className="h-10 w-10"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading quotations...</p>
                </div>
              ) : filteredQuotations.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-muted/20 border-dashed">
                  {searchTerm || statusFilter !== "all" ? (
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
                        Create your first quotation using the Create Quotation
                        tab
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSortToggle("quotation_number")}
                          >
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Quotation #
                              {sortField === "quotation_number" && (
                                <ArrowUpDown className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSortToggle("client")}
                          >
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              Client
                              {sortField === "client" && (
                                <ArrowUpDown className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSortToggle("created_at")}
                          >
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Date
                              {sortField === "created_at" && (
                                <ArrowUpDown className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSortToggle("valid_until")}
                          >
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-4 w-4" />
                              Valid Until
                              {sortField === "valid_until" && (
                                <ArrowUpDown className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer text-right"
                            onClick={() => handleSortToggle("amount")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4" />
                              Amount
                              {sortField === "amount" && (
                                <ArrowUpDown className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSortToggle("status")}
                          >
                            <div className="flex items-center gap-1">
                              <FileCheck className="h-4 w-4" />
                              Status
                              {sortField === "status" && (
                                <ArrowUpDown className="h-3 w-3 ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuotations.map((quotation) => (
                          <TableRow key={quotation.id} className="group">
                            <TableCell className="font-medium">
                              {quotation.quotation_number ||
                                `#${quotation.id.substring(0, 8)}`}
                            </TableCell>
                            <TableCell>
                              {quotation.client?.company_name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {formatDate(quotation.created_at)}
                            </TableCell>
                            <TableCell>
                              {formatDate(quotation.valid_until)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(quotation.final_amount)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(quotation.status)}
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
                                    onClick={() =>
                                      viewQuotationDetails(quotation.id)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  {quotation.status === "pending" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleUpdateStatus(
                                            quotation.id,
                                            "approved"
                                          )
                                        }
                                      >
                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                        Mark as Approved
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleUpdateStatus(
                                            quotation.id,
                                            "rejected"
                                          )
                                        }
                                      >
                                        <ThumbsDown className="h-4 w-4 mr-2" />
                                        Mark as Rejected
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setSelectedQuotation(quotation);
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

      {/* View Quotation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotation Details
            </DialogTitle>
            <DialogDescription>
              {selectedQuotation?.quotation_number ||
                `#${selectedQuotation?.id.substring(0, 8)}`}{" "}
              - {formatDate(selectedQuotation?.created_at || null)}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">
                Loading quotation details...
              </p>
            </div>
          ) : selectedQuotation ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Client
                  </h3>
                  <p className="font-medium">
                    {selectedQuotation.client?.company_name}
                  </p>
                  <p className="text-sm">
                    {selectedQuotation.client?.contact_person}
                  </p>
                  <p className="text-sm">
                    {selectedQuotation.client?.company_email}
                  </p>
                  {selectedQuotation.client?.address && (
                    <p className="text-sm">
                      {selectedQuotation.client.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Quotation Details
                  </h3>
                  <p className="font-medium">
                    {selectedQuotation.quotation_number ||
                      `#${selectedQuotation.id.substring(0, 8)}`}
                  </p>
                  <p className="text-sm">
                    Date: {formatDate(selectedQuotation.created_at)}
                  </p>
                  <p className="text-sm">
                    Valid Until: {formatDate(selectedQuotation.valid_until)}
                  </p>
                  <div className="mt-1 flex justify-end">
                    {getStatusBadge(selectedQuotation.status)}
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
                    {selectedQuotation.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                          {item.product_variant && (
                            <div className="text-xs text-muted-foreground">
                              {item.product_variant.size}{" "}
                              {item.product_variant.unit}
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
                    <span>
                      {formatCurrency(selectedQuotation.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>
                      - {formatCurrency(selectedQuotation.discount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT:</span>
                    <span>+ {formatCurrency(selectedQuotation.vat || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(selectedQuotation.final_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div className="bg-muted/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-1">Notes</h3>
                  <p className="text-sm">{selectedQuotation.notes}</p>
                </div>
              )}

              {selectedQuotation.status === "pending" && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="gap-1 text-destructive"
                    onClick={() => {
                      handleUpdateStatus(selectedQuotation.id, "rejected");
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="gap-1"
                    onClick={() => {
                      handleUpdateStatus(selectedQuotation.id, "approved");
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Quotation not found</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={isEditItemDialogOpen}
        onOpenChange={setIsEditItemDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Quotation Item</DialogTitle>
            <DialogDescription>
              Update the details of this quotation item
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuotation}
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
