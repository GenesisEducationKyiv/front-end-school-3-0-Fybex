import React from "react";
import {
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

const getErrorMessage = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  name: Path<TFieldValues>
): string | undefined => {
  const error = errors[name];
  if (error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
};

interface FormFieldProps<TFieldValues extends FieldValues>
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "name" | "id" | "form"
  > {
  name: Path<TFieldValues>;
  label: string;
  form: UseFormReturn<TFieldValues>;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  dataTestId?: string;
}

export default function FormField<TFieldValues extends FieldValues>({
  name,
  label,
  form,
  labelClassName = "text-right",
  errorClassName = "col-span-4 text-red-500 text-sm text-right",
  wrapperClassName = "grid grid-cols-4 items-center gap-4",
  className,
  dataTestId,
  ...inputProps
}: FormFieldProps<TFieldValues>) {
  const errorMessage = getErrorMessage(form.formState.errors, name);
  const hasError = !!errorMessage;

  return (
    <div className={wrapperClassName}>
      <Label className={labelClassName} htmlFor={name}>
        {label}
      </Label>
      <Input
        id={name}
        {...form.register(name)}
        aria-invalid={hasError ? "true" : "false"}
        className={cn("col-span-3", className)}
        data-testid={dataTestId}
        {...inputProps}
      />
      {hasError && (
        <p
          className={errorClassName}
          data-testid={`error-${name}`}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
