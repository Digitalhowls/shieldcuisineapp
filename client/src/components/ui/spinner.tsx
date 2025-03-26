import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | string;
  variant?: "default" | "translucent";
  className?: string;
  icon?: React.ReactNode;
}

export function Spinner({
  className,
  size = "md",
  variant = "default",
  icon,
  ...props
}: SpinnerProps) {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // Permite pasar un tamaño personalizado como string "h-10 w-10"
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || size;

  const variantClasses = {
    default: "text-foreground",
    translucent: "text-foreground/50",
  };

  // Icono a utilizar
  const SpinnerIcon = icon || Loader2;

  return (
    <div
      className={cn("animate-spin", sizeClass, variantClasses[variant], className)}
      {...props}
    >
      {React.isValidElement(SpinnerIcon) ? (
        SpinnerIcon
      ) : (
        <SpinnerIcon className="h-full w-full" />
      )}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}