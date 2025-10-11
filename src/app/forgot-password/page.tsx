"use client";

import type React from "react";

import { useState } from "react";
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
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRequestPasswordReset, useResetPassword } from "@/hooks/use-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [error, setError] = useState("");

  const requestResetMutation = useRequestPasswordReset();
  const resetPasswordMutation = useResetPassword();

  // Form validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateEmailForm = () => {
    if (!email) {
      setError("Please enter your email address");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validateResetForm = () => {
    if (!resetCode) {
      setError("Please enter the reset code");
      return false;
    }
    if (!newPassword) {
      setError("Please enter a new password");
      return false;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmailForm()) {
      return;
    }

    requestResetMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStep("reset");
        },
        onError: (error: any) => {
          setError(error.message || "Failed to send reset code");
        },
      }
    );
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateResetForm()) {
      return;
    }

    resetPasswordMutation.mutate(
      { email, code: resetCode, newPassword },
      {
        onError: (error: any) => {
          setError(error.message || "Failed to reset password");
        },
      }
    );
  };

  const handleBackToEmail = () => {
    setStep("email");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <div>
            <CardTitle className="text-2xl font-bold">
              {step === "email" ? "Forgot Password" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === "email"
                ? "Enter your email address and we'll send you a reset code"
                : `Enter the reset code sent to ${email} and your new password`}
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

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={requestResetMutation.isPending}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetCode">Reset Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={resetPasswordMutation.isPending}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the 6-digit reset code
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  required
                />
              </div>
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToEmail}
                  disabled={resetPasswordMutation.isPending}
                >
                  Back to Email
                </Button>
              </div>
            </form>
          )}

          {/* Success Message */}
          {step === "reset" && !error && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Reset code sent to {email}. Check your email and spam folder.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
