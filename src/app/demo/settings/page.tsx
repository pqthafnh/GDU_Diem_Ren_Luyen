"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href=".." className="p-2 -ml-2 text-muted hover:text-primary transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-[24px] md:text-[32px] font-bold text-ink">Cài đặt hệ thống</h1>
      </div>

      <section className="bg-surface rounded-xl border border-black/5 p-6 shadow-sm">
        <h2 className="text-[18px] font-bold text-ink mb-6">Giao diện (Theme)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              theme === "light" 
                ? "border-primary bg-primary-soft text-primary" 
                : "border-border hover:border-primary-muted text-muted hover:text-primary"
            }`}
          >
            <Sun className="h-8 w-8 mb-3" />
            <span className="font-semibold">Sáng (Light)</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              theme === "dark" 
                ? "border-primary bg-primary-soft text-primary" 
                : "border-border hover:border-primary-muted text-muted hover:text-primary"
            }`}
          >
            <Moon className="h-8 w-8 mb-3" />
            <span className="font-semibold">Tối (Dark)</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              theme === "system" 
                ? "border-primary bg-primary-soft text-primary" 
                : "border-border hover:border-primary-muted text-muted hover:text-primary"
            }`}
          >
            <Laptop className="h-8 w-8 mb-3" />
            <span className="font-semibold">Hệ thống (System)</span>
          </button>
        </div>
      </section>
    </div>
  );
}
