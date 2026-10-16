"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when dialog is open
  React.useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  // ESC key to close dialog
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!open || !mounted) return null

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={() => onOpenChange(false)} 
        aria-hidden="true" 
      />
      <div 
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] bg-surface rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden my-auto",
          className
        )}
      >
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col gap-1.5 p-4 sm:p-5 pr-12 border-b border-border shrink-0 bg-surface", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={cn("text-[16px] sm:text-[17px] font-bold text-ink leading-snug", className)}>{children}</h2>
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-4 sm:p-5 text-body text-[14px] flex-1 min-h-0 overflow-y-auto overscroll-contain", className)}>{children}</div>
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 p-4 sm:p-5 border-t border-border shrink-0 bg-surface", className)}>{children}</div>
}

export function DialogClose({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <button
      onClick={() => onOpenChange(false)}
      className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 rounded-full p-2 hover:bg-canvas text-muted hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary z-20"
      title="Đóng popup"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Đóng</span>
    </button>
  )
}
