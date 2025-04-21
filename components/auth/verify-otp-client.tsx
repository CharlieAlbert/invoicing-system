"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidateOtp } from "@/lib/supabase/server-extended/auth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function VerifyOtpClient() {
  const router = useRouter();
  const { user, revalidate } = useAuth();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("signUpEmail");

    if (!storedEmail) {
      toast.error("No email found. Please sign up first.");
      setTimeout(() => {
        router.push("/auth/signup");
      }, 100);
      return;
    }

    setEmail(storedEmail);
    setPassword(sessionStorage.getItem("signUpPassword") || "");

    if (user) {
      router.push("/dashboard");
    }
  }, [router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await ValidateOtp({
        email,
        otp,
        password,
      });

      // Clear session storage
      sessionStorage.removeItem("signUpEmail");
      sessionStorage.removeItem("signUpPassword");
      
      toast.success("Account verified successfully!");
      
      // Revalidate auth context
      await revalidate();
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
      toast.error(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 my-4">
            {error && (
              <div className="rounded bg-red-100 p-2 text-red-600">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter the 6-digit code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify and Login"}
            </Button>
            <div className="text-center text-sm">
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="text-primary underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
