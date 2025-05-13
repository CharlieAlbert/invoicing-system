import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignupClient } from "@/components/auth/signup-client";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function SignupPage() {
  // Check authentication on the server
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // If not authenticated, show the signup form
  return <SignupClient />;
}
