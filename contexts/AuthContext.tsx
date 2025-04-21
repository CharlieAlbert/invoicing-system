"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Database } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { getSelfProfile } from "@/lib/supabase/server-extended/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AccountData = Database["public"]["Tables"]["account"]["Row"];

type AuthContextType = {
  user: AccountData | null;
  loading: boolean;
  error: string | null;
  revalidate: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  revalidate: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getSelfProfile();
      if (error) {
        setError(error);
        setUser(null);
      } else if (data) {
        setUser(data);
        setError(null);
        console.log("User logged in: ", data);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Failed to log out");
      console.error("Logout error:", err);
    }
  }, [supabase.auth, router]);

  useEffect(() => {
    fetchUser();

    // Prefetch important pages
    router.prefetch("/dashboard");
    router.prefetch("/auth/login");
    router.prefetch("/auth/signup");

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN") {
        await fetchUser();
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.refresh();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUser, router, supabase.auth]);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        error, 
        revalidate: fetchUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
