"use server";

import { createClient } from "../server";
import { Database } from "../types";

type InsertClient = Database["public"]["Tables"]["client"]["Insert"];
type Client = Database["public"]["Tables"]["client"]["Row"];

export const addClient = async (clientData: InsertClient) => {
  const supabase = await createClient();

  console.log("Client data being inserted:", clientData);

  if (!clientData.company_name || !clientData.company_email) {
    throw new Error("Client name and email are required");
  }

  try {
    const { data: existingClient, error: fetchError } = await supabase
      .from("client")
      .select("company_email")
      .eq("company_email", clientData.company_email)
      .single();

    if (existingClient) {
      throw new Error("A client with this email already exists.");
    }

    const { data: client, error: clientError } = await supabase
      .from("client")
      .insert([clientData])
      .select()
      .single();

    if (clientError) {
      console.error("Supabase insert error:", clientError);
      throw new Error("Could not insert client");
    }

    return { success: true, message: "Client added successfully" };
  } catch (error) {
    console.error(
      "Error adding client:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Unable to add client. Please try again.");
  }
};

export const updateClient = async (id: string, clientData: InsertClient) => {
  const supabase = await createClient();

  if (!clientData.company_name || !clientData.company_email) {
    throw new Error("Client name and email are required");
  }

  try {
    const { data: client, error: clientError } = await supabase
      .from("client")
      .update(clientData)
      .eq("id", id)
      .select()
      .single();

    if (clientError) throw clientError;

    return { success: true, message: "Client updated successfully", client };
  } catch (error) {
    console.error(
      "Error updating client:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Unable to update client. Please try again.");
  }
};

export const getClients = async () => {
  const supabase = await createClient();

  try {
    const { data: clients, error: clientsError } = await supabase
      .from("client")
      .select();

    if (clientsError) throw clientsError;

    return clients as Client[];
  } catch (error) {
    console.error(
      "Error fetching clients:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Unable to fetch clients. Please try again.");
  }
};

export const getClientById = async (
  clientId: string
): Promise<Client | null> => {
  const supabase = await createClient();

  try {
    const { data: client, error: clientError } = await supabase
      .from("client")
      .select()
      .eq("id", clientId)
      .single();

    if (clientError) throw clientError;

    return client;
  } catch (error) {
    console.error(
      "Error fetching client:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Unable to fetch client. Please try again.");
  }
};

export const deleteClient = async (id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("client").delete().eq("id", id);

  if (error) {
    console.error("Error deleting client:", error.message);
    throw new Error("Error deleting client");
  }

  return { success: true, message: "Client deleted successfully" };
};
