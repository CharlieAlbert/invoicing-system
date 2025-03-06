"use client";

import { useState } from "react";
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

export default function ProductsPage() {
  interface Product {
    id: number;
    name: string;
    description: string;
    type: string;
    cost_price: string;
    selling_price: string;
    unit: string;
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    cost_price: "",
    selling_price: "",
    unit: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {
    preventDefault: () => void;
  }

  const handleSubmit = (e: FormSubmitEvent) => {
    e.preventDefault();
    setProducts((prev: Product[]) => [
      ...prev,
      { ...formData, id: Date.now() },
    ]);
    setFormData({
      name: "",
      description: "",
      type: "",
      cost_price: "",
      selling_price: "",
      unit: "",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={handleSelectChange("type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                value={formData.cost_price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="selling_price">Selling Price</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit">Add Product</Button>
          </form>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Product List</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.type}</TableCell>
                  <TableCell>${product.cost_price}</TableCell>
                  <TableCell>${product.selling_price}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
