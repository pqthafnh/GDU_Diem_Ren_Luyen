"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Laptop, ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const themes = [
    { id: "light", label: "Sáng (Light)", icon: Sun, desc: "Giao diện sáng mặc định" },
    { id: "dark", label: "Tối (Dark)", icon: Moon, desc: "Bảo vệ mắt trong bóng tối" },
    { id: "system", label: "Hệ thống (System)", icon: Laptop, desc: "Tự động theo thiết bị" },
  ];

  return (
    <div className="container py-8 max-w-3xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
        <Link href="/demo/student/profile" className="p-2 -ml-2 rounded-full text-muted hover:bg-canvas-soft hover:text-primary transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-ink leading-tight">Cài đặt hệ thống</h1>
          <p className="text-muted text-[14px] mt-1">Tùy chỉnh trải nghiệm cá nhân hóa trên thiết bị của bạn.</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border ">
            <h2 className="text-[16px] font-semibold text-ink">Giao diện (Theme)</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all overflow-hidden group",
                      isActive 
                        ? "border-primary  shadow-sm" 
                        : "border-border hover: bg-surface hover:bg-canvas-soft/50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-4 right-4 h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "p-3 rounded-lg mb-4 transition-colors",
                      isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-canvas text-muted group-hover:text-primary group-hover:"
                    )}>
                      <t.icon className="h-6 w-6" />
                    </div>
                    
                    <span className={cn(
                      "font-semibold text-[15px] mb-1 transition-colors",
                      isActive ? "text-primary" : "text-ink"
                    )}>
                      {t.label}
                    </span>
                    <span className="text-[13px] text-muted">
                      {t.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
