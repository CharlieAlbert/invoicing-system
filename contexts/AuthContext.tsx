"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Database } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { getSelfProfile } from "@/lib/supabase/server-extended/auth";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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

    // Prefetch important pages
    router.prefetch("/dashboard");
    router.prefetch("/auth/login");
    router.prefetch("/auth/signup");

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log("Auth state changed:", event);
        if (event === "SIGNED_IN") {
          await fetchUser();
          router.refresh();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          router.refresh();
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        revalidate: fetchUser,
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
