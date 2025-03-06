"use server";

import { createClient } from "../server";
import { Database } from "../types";

type SignUp = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

type AccountData = Database["public"]["Tables"]["account"]["Row"];

export async function SignUpRequest({ email, password, name, phone }: SignUp) {
  const supabase = await createClient();

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        name,
        phone,
      },
    },
  });

  if (error) {
    console.error("OTP error");

    if (error.message.includes("email") || error.message.includes("smtp")) {
      throw new Error("Email delivery issue. Please try again later.");
    }
  }

  return { error: "Unable to sign in. Please contact admin." };
}

type validateOtp = {
  email: string;
  otp: string;
};

export async function ValidateOtp({ email, otp }: validateOtp) {
  const supabase = await createClient();

  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (!data.user || !data.session || error) {
    throw new Error("Error validating user.");
  }

  console.log("User: ", { user: data.user, session: data.session });

  return { data };
}

type LoginCredentials = {
  email: string;
  password: string;
};

export async function Login({ email, password }: LoginCredentials) {
  const supabase = await createClient();

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    throw new Error("Login failed. Please try again.");
  }

  if (!data.user || !data.session) {
    throw new Error("Login failed. Please try again.");
  }

  const { data: AccountData, error: AccountError } = await supabase
    .from("account")
    .select("*")
    .eq("auth_id", data.user.id)
    .single();

  if (AccountError) {
    console.error("Error fetching account:", AccountError);
    throw new Error("Failed to fetch account. Please try again later.");
  }

  return { user: data.user, session: data.session, account: AccountData };
}

export const getSelfProfile = async (): Promise<{
  data?: AccountData;
  error?: string;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: AuthError,
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not found" };

  if (AuthError) {
    console.error("Error fetching user:", AuthError);
    throw new Error("Error fetching user.");
  }

  const { data, error } = await supabase
    .from("account")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return { error: "encountered an error" };
  }

  return { data };
};

export async function Logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
