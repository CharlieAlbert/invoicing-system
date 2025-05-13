import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerifyOtpClient } from "@/components/auth/verify-otp-client";

// Enable revalidation every 60 seconds
export const revalidate = 60;

export default async function VerifyOtpPage() {
  // Check authentication on the server
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // If not authenticated, show the OTP verification form
  return <VerifyOtpClient />;
}
