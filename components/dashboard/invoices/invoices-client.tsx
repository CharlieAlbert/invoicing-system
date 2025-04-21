"use client"

import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  Receipt,
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getInvoiceWithItems,
  deleteInvoice,
  getInvoices,
  createInvoice,
  addInvoiceItem,
} from "@/lib/supabase/server-extended/invoices"
import type { Database } from "@/lib/supabase/types"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Define types for the component props
interface InvoiceItem {
  id: string | number
  product_id: string
  product_variant_id?: string | null
  description: string
  quantity: number
  price_per_unit: number
  total_amount: number
  product?: {
    name: string
    description: string
    type: string
  }
  product_variant?: {
    size: number
    unit: string
    sku: string
  }
  isNew?: boolean
}

// Define the API response type that includes the client property
type InvoiceApiResponse = Database["public"]["Tables"]["invoices"]["Row"] & {
  client?: {
    company_name: string
    company_email: string
    phone?: string | null
    contact_person?: string | null
    address?: string | null
  }
}

interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  invoice_date: string
  due_date: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  total_amount: number
  discount: number
  vat: number
  final_amount: number
  notes?: string | null
  created_at: string
  created_by: string
  client?: {
    company_name: string
    company_email: string
    phone?: string | null
    contact_person?: string | null
    address?: string | null
  }
  items?: InvoiceItem[]
}

interface Client {
  id: string
  company_name: string
  company_email: string
  phone?: string | null
  contact_person?: string | null
  address?: string | null
}

interface Product {
  id: string
  name: string
  description: string | null
  type: Database["public"]["Enums"]["product_type"]
  created_at: string | null
  updated_at: string | null
  variants: {
    id: string
    product_id: string
    size: number
    unit: string
    cost_price: number | null
    selling_price: number
    sku: string | null
    created_at: string | null
    updated_at: string | null
  }[]
}

interface InvoicesClientProps {
  initialInvoices: Invoice[]
  initialClients: Client[]
  initialProducts: Product[]
  user: any // You can define a more specific type for user if needed
}

export default function InvoicesClient({
  initialInvoices,
  initialClients,
  initialProducts,
  user,
}: InvoicesClientProps) {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || [])
  const [clients, setClients] = useState<Client[]>(initialClients || [])
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("invoice_date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false)
  const [currentEditItem, setCurrentEditItem] = useState<InvoiceItem | null>(null)
  const [activeTab, setActiveTab] = useState<string>("list")

  // Create invoice state
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [creatingInvoice, setCreatingInvoice] = useState(false)
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
  })

  // Refresh data
  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await getInvoices()
      if (response.success && response.data) {
        // Cast the response data to the correct type that includes the client property
        const invoicesWithClient = response.data as unknown as InvoiceApiResponse[]

        // Map to our Invoice interface
        const typedInvoices: Invoice[] = invoicesWithClient.map((invoice) => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number || "",
          client_id: invoice.client_id,
          invoice_date: invoice.invoice_date || "",
          due_date: invoice.due_date,
          status: invoice.status as "draft" | "sent" | "paid" | "overdue" | "cancelled",
          total_amount: invoice.total_amount,
          discount: invoice.discount || 0,
          vat: invoice.vat || 0,
          final_amount: invoice.final_amount,
          notes: invoice.notes,
          created_at: invoice.created_at || "",
          created_by: invoice.created_by || "",
          client: invoice.client,
        }))

        setInvoices(typedInvoices)
        toast.success("Invoices refreshed successfully")
      } else {
        toast.error(response.error || "Failed to refresh data")
      }
    } catch (error) {
      toast.error("Failed to refresh data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // View invoice details
  const viewInvoiceDetails = async (invoiceId: string) => {
    setLoading(true)
    try {
      const response = await getInvoiceWithItems(invoiceId)
      if (response.success && response.data) {
        setSelectedInvoice(response.data as unknown as Invoice)
        setIsViewDialogOpen(true)
      } else {
        toast.error(response.error || "Failed to load invoice details")
      }
    } catch (error) {
      toast.error("Failed to load invoice details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Delete invoice
  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return

    setLoading(true)
    try {
      const response = await deleteInvoice(selectedInvoice.id)
      if (response.success) {
        setInvoices(invoices.filter((i) => i.id !== selectedInvoice.id))
        setIsDeleteDialogOpen(false)
        setSelectedInvoice(null)
        toast.success("Invoice deleted successfully")
      } else {
        toast.error(response.error || "Failed to delete invoice")
      }
    } catch (error) {
      toast.error("Failed to delete invoice")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Get status badge
  const getStatusBadge = (status: string | null): React.ReactElement | null => {
    if (!status) return null

    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Overdue
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <FileCheck className="h-3 w-3" />
            Sent
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Draft
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="text-destructive flex items-center gap-1">
            <Trash2 className="h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        )
    }
  }

  // Sort invoices
  const sortInvoices = (a: Invoice, b: Invoice) => {
    let comparison = 0

    switch (sortField) {
      case "invoice_number":
        comparison = a.invoice_number.localeCompare(b.invoice_number)
        break
      case "client":
        comparison = (a.client?.company_name || "").localeCompare(b.client?.company_name || "")
        break
      case "amount":
        comparison = a.final_amount - b.final_amount
        break
      case "invoice_date":
        comparison = new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime()
        break
      case "due_date":
        comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        break
      case "status":
        comparison = (a.status || "").localeCompare(b.status || "")
        break
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }

    return sortDirection === "asc" ? comparison : -comparison
  }

  // Filter invoices based on search term and status
  const filteredInvoices = invoices
    .filter((invoice) => {
      // Status filter
      if (statusFilter !== "all" && invoice.status !== statusFilter) {
        return false
      }

      // Search filter
      if (searchTerm) {
        return (
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.client?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      return true
    })
    .sort(sortInvoices)

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle input change for create invoice form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle product selection
  const handleProductSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, product_id: value, product_variant_id: "" }))

    // Reset price if product changes
    setFormData((prev) => ({
      ...prev,
      price_per_unit: 0,
    }))

    // Auto-fill description
    const selectedProduct = products.find((p) => p.id === value)
    if (selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        description: selectedProduct.name,
      }))
    }
  }

  // Handle variant selection
  const handleVariantSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, product_variant_id: value }))

    // Auto-fill price if variant is selected
    const selectedProduct = products.find((p) => p.id === formData.product_id)
    if (selectedProduct) {
      const selectedVariant = selectedProduct.variants?.find((v) => v.id === value)
      if (selectedVariant) {
        setFormData((prev) => ({
          ...prev,
          price_per_unit: selectedVariant.selling_price,
          description: `${selectedProduct.name} - ${selectedVariant.size} ${selectedVariant.unit}`,
        }))
      }
    }
  }

  // Add item to invoice
  const handleAddItem = () => {
    if (!formData.product_id || formData.quantity <= 0 || formData.price_per_unit <= 0) {
      toast.error("Please fill in all required fields with valid values")
      return
    }

    // Find product and variant for display
    const selectedProduct = products.find((p) => p.id === formData.product_id)
    const selectedVariant = selectedProduct?.variants?.find((v) => v.id === formData.product_variant_id)

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
    }

    setInvoiceItems((prev) => [...prev, newItem])

    // Reset form fields
    setFormData((prev) => ({
      ...prev,
      product_id: "",
      product_variant_id: "",
      description: "",
      quantity: 1,
      price_per_unit: 0,
    }))

    toast.success("Item added to invoice")
  }

  // Remove item from invoice
  const handleRemoveItem = (id: string | number) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id))
    toast.success("Item removed from invoice")
  }

  // Edit invoice item
  const handleEditItem = (item: InvoiceItem) => {
    setCurrentEditItem(item)
    setIsEditItemDialogOpen(true)
  }

  // Update edited item
  const handleUpdateItem = () => {
    if (!currentEditItem) return

    // Update the item in the list
    setInvoiceItems((prev) =>
      prev.map((item) =>
        item.id === currentEditItem.id
          ? { ...currentEditItem, total_amount: currentEditItem.quantity * currentEditItem.price_per_unit }
          : item,
      ),
    )

    setIsEditItemDialogOpen(false)
    setCurrentEditItem(null)
    toast.success("Item updated")
  }

  // Create invoice
  const handleCreateInvoice = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client")
      return
    }

    if (invoiceItems.length === 0) {
      toast.error("Please add at least one item to the invoice")
      return
    }

    try {
      setCreatingInvoice(true)

      // Calculate total amount
      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total_amount, 0)

      // Apply discount and VAT
      const discount = Number(formData.discount)
      const vat = (totalAmount * Number(formData.vat)) / 100
      const finalAmount = totalAmount - discount + vat

      // Prepare invoice data
      const invoiceData = {
        client_id: selectedClientId,
        invoice_date: formData.invoice_date.toISOString(),
        due_date: formData.due_date.toISOString(),
        status: "pending" as const,
        total_amount: totalAmount,
        discount: discount,
        vat: vat,
        final_amount: finalAmount,
        notes: formData.notes || null,
        created_by: user?.id || "",
      }

      // Create invoice
      const response = await createInvoice(
        invoiceData,
        invoiceItems.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          description: item.description,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          total_amount: item.total_amount,
        })),
      )

      if (response.success && response.invoice_id) {
        toast.success("Invoice created successfully")

        // Reset form
        resetForm()

        // Refresh invoices list and switch to list tab
        await refreshData()
        setActiveTab("list")
      } else {
        toast.error(response.error || "Failed to create invoice")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice")
    } finally {
      setCreatingInvoice(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setInvoiceItems([])
    setSelectedClientId("")
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
    })
  }

  // Calculate subtotal
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total_amount, 0)

  // Calculate discount amount
  const discountAmount = Number(formData.discount)

  // Calculate VAT amount
  const vatAmount = (subtotal * Number(formData.vat)) / 100

  // Calculate final total
  const finalTotal = subtotal - discountAmount + vatAmount

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage invoices for your clients</p>
        </div>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                  <CardDescription>Select the client for this invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
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
                        {clients.find((c) => c.id === selectedClientId)?.company_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {clients.find((c) => c.id === selectedClientId)?.company_email}
                      </p>
                      {clients.find((c) => c.id === selectedClientId)?.contact_person && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Contact: {clients.find((c) => c.id === selectedClientId)?.contact_person}
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
                  <CardDescription>Add products to your invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product" className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        Product
                      </Label>
                      <Select name="product_id" value={formData.product_id} onValueChange={handleProductSelect}>
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

                    {formData.product_id && products.find((p) => p.id === formData.product_id)?.variants && (
                      <div className="space-y-2">
                        <Label htmlFor="variant" className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Variant
                        </Label>
                        <Select value={formData.product_variant_id} onValueChange={handleVariantSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant" />
                          </SelectTrigger>
                          <SelectContent>
                            {products
                              .find((p) => p.id === formData.product_id)
                              ?.variants?.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.size} {variant.unit} - {formatCurrency(variant.selling_price)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="description" className="flex items-center gap-1">
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
                        <Label htmlFor="quantity" className="flex items-center gap-1">
                          <Calculator className="h-4 w-4" />
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price_per_unit" className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Price (KES)
                        </Label>
                        <Input
                          id="price_per_unit"
                          name="price_per_unit"
                          type="number"
                          value={formData.price_per_unit}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price_per_unit: Number(e.target.value) }))}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <Button type="button" onClick={handleAddItem} className="w-full">
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
                  <CardDescription>Configure dates, discount, VAT, and notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoice_date" className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Invoice Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.invoice_date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.invoice_date ? format(formData.invoice_date, "PPP") : <span>Pick a date</span>}
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
                        <Label htmlFor="due_date" className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.due_date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
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
                        <Label htmlFor="discount" className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          Discount (KES)
                        </Label>
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vat" className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          VAT (%)
                        </Label>
                        <Input
                          id="vat"
                          name="vat"
                          type="number"
                          value={formData.vat}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vat: Number(e.target.value) }))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes for the invoice"
                        rows={3}
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
                  <CardDescription>Review and finalize your invoice</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {invoiceItems.length === 0 ? (
                    <div className="text-center py-10 border-t">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">No items added yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Add items to your invoice using the form</p>
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
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price_per_unit)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.total_amount)}</TableCell>
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
                        <span className="text-muted-foreground">VAT ({formData.vat}%):</span>
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
                      disabled={creatingInvoice || invoiceItems.length === 0 || !selectedClientId}
                    >
                      {creatingInvoice ? (
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
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Invoice List</CardTitle>
                  <CardDescription>View and manage all your invoices</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search invoices..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
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
                        className={statusFilter === "draft" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("draft")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={statusFilter === "sent" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("sent")}
                      >
                        <FileCheck className="mr-2 h-4 w-4" />
                        Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={statusFilter === "paid" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("paid")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={statusFilter === "overdue" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("overdue")}
                      >
                        <Clock3 className="mr-2 h-4 w-4" />
                        Overdue
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={statusFilter === "cancelled" ? "bg-muted" : ""}
                        onClick={() => setStatusFilter("cancelled")}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancelled
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="icon" onClick={refreshData} disabled={loading} className="h-10 w-10">
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading invoices...</p>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-10 border rounded-md bg-muted/20 border-dashed">
                  {searchTerm || statusFilter !== "all" ? (
                    <>
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">No invoices found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try a different search term or filter</p>
                    </>
                  ) : (
                    <>
                      <Receipt className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">No invoices yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create your first invoice using the Create Invoice tab
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
                          <TableHead className="cursor-pointer" onClick={() => handleSortToggle("invoice_number")}>
                            <div className="flex items-center gap-1">
                              <Receipt className="h-4 w-4" />
                              Invoice #{sortField === "invoice_number" && <ArrowUpDown className="h-3 w-3 ml-1" />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSortToggle("client")}>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              Client
                              {sortField === "client" && <ArrowUpDown className="h-3 w-3 ml-1" />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSortToggle("invoice_date")}>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Date
                              {sortField === "invoice_date" && <ArrowUpDown className="h-3 w-3 ml-1" />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSortToggle("due_date")}>
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-4 w-4" />
                              Due Date
                              {sortField === "due_date" && <ArrowUpDown className="h-3 w-3 ml-1" />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer text-right" onClick={() => handleSortToggle("amount")}>
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4" />
                              Amount
                              {sortField === "amount" && <ArrowUpDown className="h-3 w-3 ml-1" />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSortToggle("status")}>
                            <div className="flex items-center gap-1">
                              <FileCheck className="h-4 w-4" />
                              Status
                              {sortField === "status" && <ArrowUpDown className="h-3 w-3 ml-1" />}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="group">
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{invoice.client?.company_name || "Unknown"}</TableCell>
                            <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(invoice.final_amount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                                  <DropdownMenuItem onClick={() => viewInvoiceDetails(invoice.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setIsDeleteDialogOpen(true)
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

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Details
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoice_number} - {formatDate(selectedInvoice?.invoice_date || null)}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading invoice details...</p>
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                  <p className="font-medium">{selectedInvoice.client?.company_name}</p>
                  <p className="text-sm">{selectedInvoice.client?.contact_person}</p>
                  <p className="text-sm">{selectedInvoice.client?.company_email}</p>
                  {selectedInvoice.client?.address && <p className="text-sm">{selectedInvoice.client.address}</p>}
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-muted-foreground">Invoice Details</h3>
                  <p className="font-medium">{selectedInvoice.invoice_number}</p>
                  <p className="text-sm">Issue Date: {formatDate(selectedInvoice.invoice_date)}</p>
                  <p className="text-sm">Due Date: {formatDate(selectedInvoice.due_date)}</p>
                  <div className="mt-1 flex justify-end">{getStatusBadge(selectedInvoice.status)}</div>
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
                              {item.product_variant.size} {item.product_variant.unit}
                              {item.product_variant.sku && ` (SKU: ${item.product_variant.sku})`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price_per_unit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_amount)}</TableCell>
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
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
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
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice Item</DialogTitle>
            <DialogDescription>Update the details of this invoice item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={currentEditItem?.description || ""}
                onChange={(e) => setCurrentEditItem((prev) => (prev ? { ...prev, description: e.target.value } : null))}
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
                    setCurrentEditItem((prev) => (prev ? { ...prev, quantity: Number(e.target.value) } : null))
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
                    setCurrentEditItem((prev) => (prev ? { ...prev, price_per_unit: Number(e.target.value) } : null))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {selectedInvoice?.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
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
  )
}
