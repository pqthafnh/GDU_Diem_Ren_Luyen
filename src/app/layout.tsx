import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["vietnamese"] });

export const metadata: Metadata = {
  title: "GDU Event & Training Points",
  description: "Hệ thống quản lý sự kiện, điểm danh và điểm rèn luyện sinh viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <RoleSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
