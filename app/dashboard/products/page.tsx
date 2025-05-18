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

export default function ProductsPage() {
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

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
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

    setProductData((prev) => {
      const updatedVariants = [...prev.variants];

      if (name === "size") {
        updatedVariants[index] = {
          ...updatedVariants[index],
          [name]: value === "" ? 0 : Number(value),
        };
      } else if (name === "cost_price") {
        updatedVariants[index] = {
          ...updatedVariants[index],
          [name]: value === "" ? null : Number(value),
        };
      } else if (name === "selling_price") {
        updatedVariants[index] = {
          ...updatedVariants[index],
          [name]: value === "" ? 0 : Number(value),
        };
      } else {
        updatedVariants[index] = {
          ...updatedVariants[index],
          [name]: value,
        };
      }

      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  // Handle select change for variant unit
  const handleUnitChange = (index: number, value: string) => {
    setProductData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        unit: value,
      };
      return {
        ...prev,
        variants: updatedVariants,
      };
    });
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
      toast.error("Please add at least one product variant");
      return;
    }

    try {
      setSubmitting(true);

      // Format the data for the API
      const product = {
        name: productData.name,
        description: productData.description,
        type: productData.type,
      };

      const variants = productData.variants.map((variant) => ({
        size: Number.parseFloat(variant.size.toString()),
        unit: variant.unit,
        cost_price: variant.cost_price
          ? Number.parseFloat(variant.cost_price.toString())
          : null,
        selling_price: Number.parseFloat(variant.selling_price.toString()),
      }));

      await addProduct(product, variants);

      // Reset form
      resetForm();
      setIsDialogOpen(false);

      // Fetch updated products
      await fetchProducts();

      toast.success("Product added successfully");
    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast.error("Failed to add product. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate profit margin
  const calculateProfitMargin = (costPrice: number, sellingPrice: number) => {
    if (!costPrice || costPrice === 0) return 0;
    const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    return margin.toFixed(2);
  };

  // Filter products by type
  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((product) => product.type === activeTab);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory and product catalog
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product with different size variants
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Product Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-medium">Product Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Product Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleProductChange}
                      placeholder="e.g., Covermatt"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Product Type
                    </Label>
                    <Select
                      value={productData.type}
                      onValueChange={handleProductTypeChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="paint"
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Paintbrush className="h-4 w-4" />
                            Paint
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="equipment"
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Equipment
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="flex items-center gap-1"
                  >
                    <Info className="h-4 w-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productData.description || ""}
                    onChange={handleProductChange}
                    placeholder="Product description"
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-medium">Product Variants</h3>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {productData.variants.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <Badge variant="outline" className="font-normal">
                          {productData.variants.length}
                        </Badge>
                        variants added
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        No variants added yet
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {productData.type === "paint" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCommonPaintSizes}
                        className="gap-1"
                      >
                        <Paintbrush className="h-4 w-4" />
                        Add Standard Paint Sizes
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVariant()}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Variant
                    </Button>
                  </div>
                </div>

                {productData.variants.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/20 border-dashed">
                    <Ruler className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">
                      No variants added yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add standard paint sizes or create custom variants
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productData.variants.map((variant, index) => (
                      <Card
                        key={index}
                        className="relative overflow-hidden border-l-4 border-l-primary"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-7 w-7 rounded-full"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`size-${index}`}
                                className="flex items-center gap-1"
                              >
                                <Ruler className="h-4 w-4" />
                                Size
                              </Label>
                              <Input
                                id={`size-${index}`}
                                name="size"
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.size}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="e.g., 20"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`unit-${index}`}
                                className="flex items-center gap-1"
                              >
                                <Tag className="h-4 w-4" />
                                Unit
                              </Label>
                              <Select
                                value={variant.unit}
                                onValueChange={(value) =>
                                  handleUnitChange(index, value)
                                }
                                required
                              >
                                <SelectTrigger id={`unit-${index}`}>
                                  <SelectValue placeholder="Select unit" />
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

                            <div className="space-y-2">
                              <Label
                                htmlFor={`cost-${index}`}
                                className="flex items-center gap-1"
                              >
                                <DollarSign className="h-4 w-4" />
                                Cost Price (KES)
                              </Label>
                              <Input
                                id={`cost-${index}`}
                                name="cost_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.cost_price || ""}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`selling-${index}`}
                                className="flex items-center gap-1"
                              >
                                <DollarSign className="h-4 w-4" />
                                Selling Price (KES)
                              </Label>
                              <Input
                                id={`selling-${index}`}
                                name="selling_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.selling_price}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="0.00"
                                required
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || productData.variants.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Product Catalog</CardTitle>
              <CardDescription>
                Manage your products and their variants
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
                disabled={loading}
                className="gap-1"
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="px-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="gap-1">
              <Package className="h-4 w-4" />
              All Products
            </TabsTrigger>
            <TabsTrigger value="paint" className="gap-1">
              <Paintbrush className="h-4 w-4" />
              Paint
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-1">
              <ShoppingBag className="h-4 w-4" />
              Equipment
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-muted/20 border-dashed">
              <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">
                No products found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "all"
                  ? "Add your first product using the button above"
                  : `No ${activeTab} products found. Add one using the button above`}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredProducts.map((product) => (
                <AccordionItem
                  key={product.id}
                  value={product.id || ""}
                  className="border rounded-md mb-3 overflow-hidden border-l-4 border-l-primary"
                >
                  <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 rounded-md">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {product.type === "paint" ? (
                          <Paintbrush className="h-5 w-5 text-primary" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <div className="font-medium text-left">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-muted-foreground text-left line-clamp-1 max-w-md">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {product.variants.length}{" "}
                          {product.variants.length === 1
                            ? "variant"
                            : "variants"}
                        </Badge>
                        <Badge
                          variant={
                            product.type === "paint" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {product.type}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 px-4 pb-4">
                    <div className="rounded-md border overflow-hidden bg-card">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="font-semibold">
                                <div className="flex items-center gap-1">
                                  <Ruler className="h-4 w-4" />
                                  Size
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold">
                                <div className="flex items-center gap-1">
                                  <Tag className="h-4 w-4" />
                                  Unit
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <DollarSign className="h-4 w-4" />
                                  Cost (KES)
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <DollarSign className="h-4 w-4" />
                                  Price (KES)
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <Percent className="h-4 w-4" />
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
                                  className="text-center py-2"
                                >
                                  <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
