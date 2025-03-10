"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Database } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { getSelfProfile } from "@/lib/supabase/server-extended/auth";

type AccountData = Database["public"]["Tables"]["account"]["Row"];

type AuthContextType = {
  user: AccountData | null;
  loading: boolean;
  error: string | null;
  revalidate: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  revalidate: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUser = async () => {
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
  };

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, revalidate: fetchUser }}
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
