import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginClient } from "@/components/auth/login-client";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function LoginPage() {
  // Check authentication on the server
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // If not authenticated, show the login form
  return <LoginClient />;
}
