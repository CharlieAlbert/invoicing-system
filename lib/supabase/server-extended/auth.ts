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

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        name,
        phone,
        password,
      },
    },
  });

  if (error) {
    console.error("OTP error:", error.message);

    if (error.message.includes("email") || error.message.includes("smtp")) {
      throw new Error("Email delivery issue. Please try again later.");
    }

    throw new Error("Unable to send verification code. Please try again.");
  }

  return { success: true, message: "Verification code sent to your email" };
}

type validateOtp = {
  email: string;
  otp: string;
  password?: string;
};

export async function ValidateOtp({ email, otp, password }: validateOtp) {
  const supabase = await createClient();

  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error || !data.user) {
    console.error("OTP verification error:", error);
    throw new Error("Invalid verification code. Please try again.");
  }

  if (data.user && data.user.identities?.length) {
    const userData = data.user.user_metadata;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
        },
      },
    });

    if (signUpError) {
      console.error("Account creation error:", signUpError.message);
      throw new Error("Failed to create account. Please try again.");
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error("Session refresh error:", sessionError?.message);
      throw new Error("Authentication failed after sign-up. Please log in.");
    }

    // Check if an account already exists for this email
    const { data: existingAccount } = await supabase
      .from("account")
      .select("id")
      .eq("email", email)
      .single();

    if (existingAccount) {
      console.warn("Account already exists for this email:", email);
      return { data: sessionData }; // Avoid duplicate entries
    }

    console.log("Auth ID before insert:", data.user.id); // Debugging

    const { error: accountError } = await supabase.from("account").insert([
      {
        email,
        name: userData.name,
        phone: userData.phone,
        role: "staff",
        auth_id: data.user.id,
      },
    ]);

    if (accountError) {
      console.error("Account record creation error:", accountError);
      throw new Error("Error finalizing your account. Please contact support.");
    }

    return { data: sessionData };
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
