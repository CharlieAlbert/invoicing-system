"use server";

import { createClient } from "../server";

type SignUp = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

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

  const { error: AccountError } = await supabase.from("account").insert({
    name: data.user.user_metadata?.name || email.split("@")[0],
    email: email,
    phone: data.user.user_metadata?.phone || null,
    role: "user",
    auth_id: data.user.id,
  });

  if (AccountError) {
    console.error("Error creating account:", AccountError);
    throw new Error("Failed to create account. Please try again later.");
  }

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
