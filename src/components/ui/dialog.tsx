"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./button"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={() => onOpenChange(false)} 
        aria-hidden="true" 
      />
      <div 
        role="dialog"
        className={cn(
          "relative z-50 w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] bg-surface rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden my-auto",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col gap-1.5 p-4 sm:p-5 border-b border-border shrink-0 bg-surface", className)}>{children}</div>
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
      className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 rounded-full p-2 hover:bg-canvas text-muted hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary z-10"
      title="Đóng popup"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Đóng</span>
    </button>
  )
}
