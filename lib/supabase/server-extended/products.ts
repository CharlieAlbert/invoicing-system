"use server";

import { createClient } from "../server";
import { Database } from "../types";

type InsertProduct = Database["public"]["Tables"]["products"]["Insert"];
type InsertProductVariant =
  Database["public"]["Tables"]["product_variants"]["Insert"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductWithVariants = Product & { variants: ProductVariant[] };

export const addProduct = async (
  productData: Omit<InsertProduct, "id">,
  variantsData: Omit<InsertProductVariant, "id" | "product_id">[]
) => {
  const supabase = await createClient();

  // Validate product data
  if (!productData.name || !productData.type) {
    throw new Error("Product name and type are required");
  }

  // Validate variants data
  if (!variantsData.length) {
    throw new Error("At least one product variant is required");
  }

  for (const variant of variantsData) {
    if (!variant.size || !variant.unit || !variant.selling_price) {
      throw new Error(
        "Size, unit, and selling price are required for all variants"
      );
    }
  }

  // Start a transaction using RPC (if available) or handle manually
  try {
    // Insert the product first
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (productError) throw productError;

    // Insert all variants with the product_id
    const variantsWithProductId = variantsData.map((variant) => ({
      ...variant,
      product_id: product.id,
    }));

    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsWithProductId)
      .select();

    if (variantsError) throw variantsError;

    return {
      success: true,
      message: "Product added successfully",
      product: { ...product, variants },
    };
  } catch (error: any) {
    console.error("Error adding product with variants:", error.message);
    throw new Error(error.message || "Error adding product");
  }
};

// Get all products with their variants
export const getProducts = async () => {
  const supabase = await createClient();

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        variants:product_variants (*)
      `
      )
      .order("name");

    if (error) throw error;

    return products as (Product & { variants: ProductVariant[] })[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

export const getProductById = async (id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting product:", error.message);
    throw new Error("Error getting product");
  }

  return data;
};

export const editProduct = async (
  id: string,
  product: Product,
  variants: ProductVariant[]
) => {
  const supabase = await createClient();

  if (!product.name || !product.type) {
    throw new Error("Product name and type are required");
  }

  if (!variants.length) {
    throw new Error("At least one product variant is required");
  }

  for (const variant of variants) {
    if (!variant.size || !variant.unit || !variant.selling_price) {
      throw new Error(
        "Size, unit, and selling price are required for all variants"
      );
    }
  }

  try {
    const { data: updatedProduct, error: productError } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single();

    if (productError) throw productError;

    const updatedVariants = await Promise.all(
      variants.map(async (variant) => {
        const { data, error } = await supabase
          .from("product_variants")
          .update(variant)
          .eq("id", variant.id)
          .select()
          .single();

        if (error) throw error;

        return data;
      })
    );

    return {
      success: true,
      message: "Product updated successfully",
      product: { ...updatedProduct, variants: updatedVariants },
    };
  } catch (error: any) {
    console.error("Error updating product with variants:", error.message);
    throw new Error(error.message || "Error updating product");
  }
};

export const deleteProduct = async (id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error.message);
    throw new Error("Error deleting product");
  }

  return { success: true, message: "Product deleted successfully" };
};
