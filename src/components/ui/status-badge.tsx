import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: string
  variant?: "success" | "warning" | "error" | "info" | "default" | "accent"
}

export function StatusBadge({ status, variant = "default", className, ...props }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
        {
          "bg-success/10 text-success": variant === "success",
          "bg-warning/10 text-warning": variant === "warning",
          "bg-error/10 text-error": variant === "error",
          "bg-info/10 text-info": variant === "info",
          "bg-accent-soft text-primary": variant === "accent",
          "bg-primary-soft text-primary": variant === "default",
        },
        className
      )}
      {...props}
    >
      {status}
    </div>
  )
}
