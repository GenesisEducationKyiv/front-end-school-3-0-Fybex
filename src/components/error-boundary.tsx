import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  title?: string;
  description?: string;
  resetErrorBoundary: () => void;
}

function DefaultErrorFallback({
  error,
  title = "Something went wrong",
  description,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md text-center">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="mb-4">
        {description ?? (error.message || "An unexpected error occurred")}
      </p>
      <Button size="sm" variant="destructive" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  title?: string;
  description?: string;
}

export default function AppErrorBoundary({
  children,
  fallback,
  title,
  description,
}: AppErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  const fallbackRender = (props: ErrorFallbackProps) => {
    if (fallback) {
      return fallback(props);
    }

    const fallbackProps: ErrorFallbackProps = {
      error: props.error,
      resetErrorBoundary: props.resetErrorBoundary,
      ...(title && { title }),
      ...(description && { description }),
    };

    return <DefaultErrorFallback {...fallbackProps} />;
  };

  return (
    <ReactErrorBoundary fallbackRender={fallbackRender} onReset={reset}>
      {children}
    </ReactErrorBoundary>
  );
}
