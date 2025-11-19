import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "lg" | "sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  className,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantClass: Record<ButtonVariant, string> = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 bg-white",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  const sizeClass: Record<ButtonSize, string> = {
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-11 px-6 py-3 text-base",
    sm: "h-9 px-3 text-xs",
  };

  return (
    <button
      className={cn(base, variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
};
