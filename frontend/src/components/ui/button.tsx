import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-[0_1px_2px_rgba(0,0,0,0.05)]":
              variant === "primary",
            "bg-primary-soft text-primary hover:bg-primary-muted":
              variant === "secondary",
            "border  text-ink hover:bg-canvas hover:border-border-strong shadow-[0_1px_2px_rgba(0,0,0,0.02)]":
              variant === "outline",
            "hover:bg-canvas hover:text-ink text-muted":
              variant === "ghost",
            "bg-accent text-ink hover:bg-accent-hover active:bg-accent-active shadow-[0_1px_2px_rgba(0,0,0,0.05)]":
              variant === "accent",
            "bg-error text-white hover:bg-error/90 shadow-[0_1px_2px_rgba(0,0,0,0.05)]": variant === "danger",
            "h-10 px-5 text-[15px]": size === "default",
            "h-8 px-3 text-sm": size === "sm",
            "h-11 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
