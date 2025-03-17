"use client";

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
} from "@/components/ui/dialog";
import { Plus, X, Loader2, Edit, ChevronDown } from "lucide-react";
import {
  addProduct,
  getProducts,
} from "@/lib/supabase/server-extended/products";
import { toast } from "sonner";

export default function ProductsPage() {
  // Types
  type ProductVariant = {
    id?: string;
    size: string;
    unit: string;
    cost_price: string;
    selling_price: string;
    isNew?: boolean;
  };

  type Product = {
    id?: string;
    name: string;
    description: string;
    type: "paint" | "equipment";
    variants: ProductVariant[];
  };

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productData, setProductData] = useState<Product>({
    name: "",
    description: "",
    type: "paint",
    variants: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Common units and sizes for quick addition
  const commonPaintSizes = [
    { size: "20", unit: "Litre" },
    { size: "4", unit: "Litre" },
    { size: "1", unit: "Litre" },
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
  const addVariant = (preset?: { size: string; unit: string }) => {
    setProductData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: preset?.size || "",
          unit: preset?.unit || "",
          cost_price: "",
          selling_price: "",
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
          cost_price: "",
          selling_price: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [name]: value } : variant
      ),
    }));
  };

  // Handle select change for variant unit
  const handleVariantUnitChange = (index: number, value: string) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, unit: value } : variant
      ),
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
      description: "",
      type: "paint",
      variants: [],
    });
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (productData.variants.length === 0) {
      toast.error("Please add atleast one product variant");
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
        size: parseFloat(variant.size),
        unit: variant.unit,
        cost_price: variant.cost_price ? parseFloat(variant.cost_price) : null,
        selling_price: parseFloat(variant.selling_price),
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product with different size variants
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Product Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
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
                    <Label htmlFor="type">Product Type</Label>
                    <Select
                      value={productData.type}
                      onValueChange={handleProductTypeChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paint">Paint</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleProductChange}
                    placeholder="Product description"
                    rows={2}
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Product Variants
                  </Label>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCommonPaintSizes}
                    >
                      Add Standard Paint Sizes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVariant()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                </div>

                {productData.variants.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">
                      No variants added yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add standard paint sizes or create custom variants
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productData.variants.map((variant, index) => (
                      <Card key={index} className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div className="space-y-2">
                              <Label htmlFor={`size-${index}`}>Size</Label>
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
                              <Label htmlFor={`unit-${index}`}>Unit</Label>
                              <Select
                                value={variant.unit}
                                onValueChange={(value) =>
                                  handleVariantUnitChange(index, value)
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
                              <Label htmlFor={`cost-${index}`}>
                                Cost Price (kes)
                              </Label>
                              <Input
                                id={`cost-${index}`}
                                name="cost_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.cost_price}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`selling-${index}`}>
                                Selling Price (Kes)
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

              <div className="flex justify-end gap-2 pt-2">
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
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Product List</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first product using the button above
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {products.map((product) => (
                <AccordionItem key={product.id} value={product.id || ""}>
                  <AccordionTrigger className="hover:bg-muted/50 px-4 py-2 rounded-md">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.variants.length}{" "}
                        {product.variants.length === 1 ? "variant" : "variants"}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2">
                    <div className="rounded-md border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">
                                Size
                              </TableHead>
                              <TableHead className="font-semibold">
                                Unit
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Cost (Kes)
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Price (Kes)
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Margin (%)
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
                              product.variants.map((variant) => (
                                <TableRow key={variant.id}>
                                  <TableCell>{variant.size}</TableCell>
                                  <TableCell>{variant.unit}</TableCell>
                                  <TableCell className="text-right">
                                    {variant.cost_price
                                      ? `$${parseFloat(
                                          variant.cost_price.toString()
                                        ).toFixed(2)}`
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    Kes
                                    {parseFloat(
                                      variant.selling_price.toString()
                                    ).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {variant.cost_price
                                      ? `${calculateProfitMargin(
                                          parseFloat(
                                            variant.cost_price.toString()
                                          ),
                                          parseFloat(
                                            variant.selling_price.toString()
                                          )
                                        )}%`
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {product.description && (
                      <div className="mt-4 px-4 py-2 bg-muted/20 rounded-md">
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
