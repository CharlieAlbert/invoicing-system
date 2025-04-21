"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  X,
  Loader2,
  Package,
  Paintbrush,
  RefreshCw,
  DollarSign,
  Percent,
  Tag,
  Ruler,
  ShoppingBag,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  addProduct,
  getProducts,
} from "@/lib/supabase/server-extended/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Types
type ProductVariant = {
  id?: string;
  product_id?: string;
  size: number;
  unit: string;
  cost_price: number | null;
  selling_price: number;
  sku?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  isNew?: boolean;
};

type Product = {
  id?: string;
  name: string;
  description: string | null;
  type: "paint" | "equipment";
  created_at?: string | null;
  updated_at?: string | null;
  variants: ProductVariant[];
};

interface ProductsClientProps {
  initialProducts: Product[];
  user: any;
}

export default function ProductsClient({ initialProducts, user }: ProductsClientProps) {
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productData, setProductData] = useState<Product>({
    name: "",
    description: null,
    type: "paint",
    variants: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Common units and sizes for quick addition
  const commonPaintSizes = [
    { size: 20, unit: "Litre" },
    { size: 4, unit: "Litre" },
    { size: 1, unit: "Litre" },
  ];

  const commonUnits = ["Litre", "Kg", "Piece", "Box", "Roll", "Sheet"];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
      toast.success("Products refreshed successfully");
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new empty variant to the form
  const addVariant = (preset?: { size: number; unit: string }) => {
    setProductData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: preset?.size || 0,
          unit: preset?.unit || "",
          cost_price: null,
          selling_price: 0,
          isNew: true,
        },
      ],
    }));
  };

  // Add common paint sizes
  const addCommonPaintSizes = () => {
    setProductData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        ...commonPaintSizes.map((size) => ({
          size: size.size,
          unit: size.unit,
          cost_price: null,
          selling_price: 0,
          isNew: true,
        })),
      ],
    }));
  };

  // Remove a variant from the form
  const removeVariant = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Handle changes in the product form
  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in variant forms
  const handleVariantChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedVariants = [...productData.variants];

    if (name === "size") {
      updatedVariants[index] = {
        ...updatedVariants[index],
        [name]: parseFloat(value) || 0,
      };
    } else if (name === "cost_price" || name === "selling_price") {
      // Handle price inputs
      let parsedValue = value === "" ? null : parseFloat(value);
      
      // Ensure selling_price is never null
      if (name === "selling_price" && (parsedValue === null || isNaN(parsedValue))) {
        parsedValue = 0;
      }
      
      updatedVariants[index] = {
        ...updatedVariants[index],
        [name]: parsedValue,
      };
    } else {
      updatedVariants[index] = {
        ...updatedVariants[index],
        [name]: value,
      };
    }

    setProductData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  // Handle select change for variant unit
  const handleUnitChange = (index: number, value: string) => {
    const updatedVariants = [...productData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      unit: value,
    };

    setProductData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  // Handle product type selection
  const handleProductTypeChange = (value: "paint" | "equipment") => {
    setProductData((prev) => ({ ...prev, type: value }));
  };

  // Reset the form
  const resetForm = () => {
    setProductData({
      name: "",
      description: null,
      type: "paint",
      variants: [],
    });
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (productData.variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    try {
      setSubmitting(true);
      
      // Validate that all variants have required fields
      const invalidVariants = productData.variants.filter(
        (v) => !v.size || !v.unit || v.selling_price === 0
      );
      
      if (invalidVariants.length > 0) {
        toast.error("All variants must have size, unit, and selling price");
        return;
      }

      // Separate product data from variants data
      const { variants, ...productOnly } = productData;
      
      const result = await addProduct(productOnly, variants);
      
      if (result && result.success) {
        toast.success("Product added successfully");
        // Extract the product from the result object
        setProducts([...products, result.product]);
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate profit margin
  const calculateProfitMargin = (costPrice: number, sellingPrice: number) => {
    if (!costPrice || costPrice === 0) return "-";
    const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    return margin.toFixed(0);
  };

  // Filter products based on active tab
  const filteredProducts = activeTab === "all" 
    ? products 
    : products.filter(product => product.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Manage your products and their variants
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={fetchProducts}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          <Tabs
            defaultValue="all"
            className="mt-6"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="all" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="paint" className="flex items-center">
                <Paintbrush className="mr-2 h-4 w-4" />
                Paint
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Equipment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-muted/20 border-dashed">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "all"
                  ? "Get started by adding your first product"
                  : `No ${activeTab} products found`}
              </p>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredProducts.map((product) => (
                <AccordionItem key={product.id} value={product.id || ""}>
                  <AccordionTrigger className="hover:bg-muted/50 px-4 py-2 rounded-md">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center">
                        {product.type === "paint" ? (
                          <Paintbrush className="h-4 w-4 mr-2 text-muted-foreground" />
                        ) : (
                          <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        <span>{product.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {product.variants.length} variant
                          {product.variants.length !== 1 ? "s" : ""}
                        </Badge>
                        <Badge
                          variant={
                            product.type === "paint"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {product.type}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                <div className="flex items-center">
                                  <Ruler className="h-4 w-4 mr-1" />
                                  Size
                                </div>
                              </TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="text-right">
                                <div className="flex items-center justify-end">
                                  <Tag className="h-4 w-4 mr-1" />
                                  Cost
                                </div>
                              </TableHead>
                              <TableHead className="text-right">
                                <div className="flex items-center justify-end">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Price
                                </div>
                              </TableHead>
                              <TableHead className="text-right">
                                <div className="flex items-center justify-end">
                                  <Percent className="h-4 w-4 mr-1" />
                                  Margin
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {product.variants.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center text-muted-foreground"
                                >
                                  <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                                  <p className="text-sm">
                                    No variants for this product
                                  </p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              product.variants.map((variant) => {
                                const costPrice = variant.cost_price
                                  ? Number.parseFloat(
                                      variant.cost_price.toString()
                                    )
                                  : 0;
                                const sellingPrice = Number.parseFloat(
                                  variant.selling_price.toString()
                                );
                                const margin = variant.cost_price
                                  ? calculateProfitMargin(
                                      costPrice,
                                      sellingPrice
                                    )
                                  : "-";
                                const marginValue = Number.parseFloat(
                                  margin as string
                                );

                                return (
                                  <TableRow
                                    key={variant.id}
                                    className="hover:bg-muted/30"
                                  >
                                    <TableCell className="font-medium">
                                      {variant.size}
                                    </TableCell>
                                    <TableCell>{variant.unit}</TableCell>
                                    <TableCell className="text-right">
                                      {variant.cost_price
                                        ? costPrice.toFixed(2)
                                        : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {sellingPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {variant.cost_price ? (
                                        <Badge
                                          variant={
                                            marginValue < 20
                                              ? "destructive"
                                              : marginValue < 40
                                              ? "secondary"
                                              : "default"
                                          }
                                          className="ml-auto"
                                        >
                                          {margin}%
                                        </Badge>
                                      ) : (
                                        "-"
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {product.description && (
                      <div className="mt-4 px-4 py-3 bg-muted/20 rounded-md flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter product details and add variants
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Premium Wall Paint"
                    value={productData.name}
                    onChange={handleProductChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={productData.description || ""}
                    onChange={handleProductChange}
                    className="resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Product Type</Label>
                  <Select
                    value={productData.type}
                    onValueChange={(value: "paint" | "equipment") =>
                      handleProductTypeChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paint">
                        <div className="flex items-center">
                          <Paintbrush className="mr-2 h-4 w-4" />
                          Paint
                        </div>
                      </SelectItem>
                      <SelectItem value="equipment">
                        <div className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Equipment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Product Variants</Label>
                  <div className="flex gap-2">
                    {productData.type === "paint" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCommonPaintSizes}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add Common Paint Sizes
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => addVariant()}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Variant
                    </Button>
                  </div>
                </div>

                {productData.variants.length === 0 ? (
                  <div className="text-center py-6 border rounded-md border-dashed">
                    <p className="text-sm text-muted-foreground mb-2">
                      No variants added yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVariant()}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Variant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productData.variants.map((variant, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap gap-3 items-center p-3 border rounded-md relative group"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute -top-2 -right-2 bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>

                        <div className="w-20">
                          <Label
                            htmlFor={`variant-${index}-size`}
                            className="text-xs"
                          >
                            Size
                          </Label>
                          <Input
                            id={`variant-${index}-size`}
                            name="size"
                            type="number"
                            min="0"
                            step="any"
                            value={variant.size || ""}
                            onChange={(e) => handleVariantChange(index, e)}
                            required
                            className="h-8"
                          />
                        </div>

                        <div className="w-28">
                          <Label
                            htmlFor={`variant-${index}-unit`}
                            className="text-xs"
                          >
                            Unit
                          </Label>
                          <Select
                            value={variant.unit}
                            onValueChange={(value) =>
                              handleUnitChange(index, value)
                            }
                          >
                            <SelectTrigger
                              id={`variant-${index}-unit`}
                              className="h-8"
                            >
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonUnits.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-28">
                          <Label
                            htmlFor={`variant-${index}-cost`}
                            className="text-xs"
                          >
                            Cost Price (opt.)
                          </Label>
                          <Input
                            id={`variant-${index}-cost`}
                            name="cost_price"
                            type="number"
                            min="0"
                            step="any"
                            value={
                              variant.cost_price !== null
                                ? variant.cost_price
                                : ""
                            }
                            onChange={(e) => handleVariantChange(index, e)}
                            className="h-8"
                            placeholder="Optional"
                          />
                        </div>

                        <div className="w-28">
                          <Label
                            htmlFor={`variant-${index}-price`}
                            className="text-xs"
                          >
                            Selling Price
                          </Label>
                          <Input
                            id={`variant-${index}-price`}
                            name="selling_price"
                            type="number"
                            min="0"
                            step="any"
                            value={variant.selling_price || ""}
                            onChange={(e) => handleVariantChange(index, e)}
                            required
                            className="h-8"
                          />
                        </div>

                        <div className="w-full md:w-auto md:flex-1">
                          <Label
                            htmlFor={`variant-${index}-sku`}
                            className="text-xs"
                          >
                            SKU (Optional)
                          </Label>
                          <Input
                            id={`variant-${index}-sku`}
                            name="sku"
                            value={variant.sku || ""}
                            onChange={(e) => handleVariantChange(index, e)}
                            className="h-8"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
