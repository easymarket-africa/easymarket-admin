"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { ApiError } from "@/types/api";

interface ErrorDisplayProps {
  error: ApiError | Error | unknown;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  title = "Something went wrong",
  description,
  showRetry = true,
  className = "",
}: ErrorDisplayProps) {
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object") {
      if ("message" in error) {
        return (error as Error).message;
      }
      if (
        "response" in error &&
        error.response &&
        typeof error.response === "object"
      ) {
        const response = error.response as {
          data?: { message?: string };
          message?: string;
        };
        return (
          response.data?.message || response.message || "An error occurred"
        );
      }
    }
    return "An unexpected error occurred";
  };

  const getErrorCode = (error: unknown): string | undefined => {
    if (error && typeof error === "object") {
      if ("code" in error) {
        return (error as ApiError).code;
      }
      if (
        "response" in error &&
        error.response &&
        typeof error.response === "object"
      ) {
        const response = error.response as {
          data?: { message?: string; code?: string };
          message?: string;
        };
        return response.data?.code;
      }
    }
    return undefined;
  };

  const isNetworkError = (error: unknown): boolean => {
    if (error && typeof error === "object") {
      if ("code" in error) {
        const code = (error as ApiError).code;
        return code === "NETWORK_ERROR" || code === "ECONNABORTED";
      }
      if ("message" in error) {
        const message = (error as Error).message.toLowerCase();
        return message.includes("network") || message.includes("fetch");
      }
    }
    return false;
  };

  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const isNetwork = isNetworkError(error);

  return (
    <div
      className={`flex items-center justify-center min-h-[200px] p-4 ${className}`}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            {isNetwork ? (
              <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{description || errorMessage}</p>
          {errorCode && (
            <p className="text-sm text-muted-foreground">
              Error Code: {errorCode}
            </p>
          )}
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorAlertProps {
  error: ApiError | Error | unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  error,
  onRetry,
  className = "",
}: ErrorAlertProps) {
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object") {
      if ("message" in error) {
        return (error as Error).message;
      }
      if (
        "response" in error &&
        error.response &&
        typeof error.response === "object"
      ) {
        const response = error.response as {
          data?: { message?: string };
          message?: string;
        };
        return (
          response.data?.message || response.message || "An error occurred"
        );
      }
    }
    return "An unexpected error occurred";
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{getErrorMessage(error)}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-2 h-8"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <WifiOff className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-xl">Connection Lost</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Please check your internet connection and try again.
          </p>
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <Wifi className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
