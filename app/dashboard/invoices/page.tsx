"use client";

import { useState } from "react";
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

type InvoiceItems = {
  id: number;
  product: string;
  quantity: string;
  price: string;
};

export default function InvoicesPage() {
  const [invoiceItems, setInvoiceItems] = useState<Array<InvoiceItems>>([]);
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    price: "",
  });

  interface FormInputEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & {
      name: keyof typeof formData;
      value: string;
    };
  }

  const handleInputChange = (e: FormInputEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string): void => {
    setFormData((prev) => ({ ...prev, product: value }));
  };

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInvoiceItems((prev) => [...prev, { ...formData, id: Date.now() }]);
    setFormData({ product: "", quantity: "", price: "" });
  };

  const handleCreateInvoice = () => {
    // This is where you'd implement invoice creation logic
    console.log("Creating invoice...");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Invoice</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Add Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <Select
                name="product"
                value={formData.product}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product1">Product 1</SelectItem>
                  <SelectItem value="product2">Product 2</SelectItem>
                  <SelectItem value="product3">Product 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit">Add Item</Button>
          </form>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Invoice Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    ${(Number(item.quantity) * Number(item.price)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-right">
            <p className="text-lg font-semibold">
              Total: $
              {invoiceItems
                .reduce(
                  (sum, item) =>
                    sum + Number(item.quantity) * Number(item.price),
                  0
                )
                .toFixed(2)}
            </p>
          </div>
          <Button onClick={handleCreateInvoice} className="mt-4">
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
