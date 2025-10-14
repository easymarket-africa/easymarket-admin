"use client";

import type React from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import {
  useVerifyEmail,
  useResendVerification,
  usePendingVerificationEmail,
} from "@/hooks/use-auth";

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();
  const pendingEmail = usePendingVerificationEmail();

  // Redirect if no pending email
  useEffect(() => {
    if (!pendingEmail) {
      router.push("/login");
    }
  }, [pendingEmail, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    if (!pendingEmail) {
      setError("No pending verification found. Please try logging in again.");
      return;
    }

    verifyEmailMutation.mutate(
      { email: pendingEmail, code: verificationCode },
      {
        onError: (error: Error) => {
          setError(error.message || "Verification failed");
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!pendingEmail || resendCooldown > 0) return;

    resendVerificationMutation.mutate(
      { email: pendingEmail },
      {
        onSuccess: () => {
          setResendCooldown(60); // 60 second cooldown
        },
        onError: (error: Error) => {
          setError(error.message || "Failed to resend verification code");
        },
      }
    );
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("pending_verification_email");
    router.push("/login");
  };

  if (!pendingEmail) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <div>
            <CardTitle className="text-2xl font-bold">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">
                {pendingEmail}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {verifyEmailMutation.isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Email verified successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                disabled={verifyEmailMutation.isPending}
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">
                Check your email and spam folder for the verification code
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={
                verifyEmailMutation.isPending || verificationCode.length !== 6
              }
            >
              {verifyEmailMutation.isPending ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          {/* Resend Code Section */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Didn&apos;t receive the code?
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendCode}
              disabled={
                resendVerificationMutation.isPending || resendCooldown > 0
              }
            >
              {resendVerificationMutation.isPending ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-pulse" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              The verification code expires in 15 minutes. If you don&apos;t see
              the email, check your spam folder or try resending the code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
