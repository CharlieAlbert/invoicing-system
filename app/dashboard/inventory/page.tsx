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

export default function InventoryPage() {
  interface InventoryItem {
    id: number;
    product: string;
    quantity: string;
    location: string;
  }

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    location: "",
  });

  interface FormInputEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & {
      name: keyof typeof formData;
      value: string;
    };
  }

  const handleInputChange = (e: FormInputEvent): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInventory((prev) => [...prev, { ...formData, id: Date.now() }]);
    setFormData({ product: "", quantity: "", location: "" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Add Inventory Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                required
              />
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit">Add Item</Button>
          </form>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Inventory List</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
