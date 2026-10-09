"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./button"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => onOpenChange(false)} 
        aria-hidden="true" 
      />
      <div 
        role="dialog"
        className="relative z-50 w-full max-w-lg bg-surface rounded-xl shadow-lg border border-border animate-in zoom-in-95 duration-200"
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col gap-1.5 p-5 border-b border-border", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={cn("text-[16px] font-semibold text-ink leading-none", className)}>{children}</h2>
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-5 text-body text-[14px]", className)}>{children}</div>
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex items-center justify-end gap-3 p-5 border-t border-border", className)}>{children}</div>
}

export function DialogClose({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <button
      onClick={() => onOpenChange(false)}
      className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-canvas text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Đóng</span>
    </button>
  )
}
