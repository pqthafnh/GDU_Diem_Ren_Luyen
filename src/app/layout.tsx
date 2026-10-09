import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleSwitcher } from "@/components/layout/role-switcher";

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
    <html lang="vi">
      <body className={inter.className}>
        {children}
        <RoleSwitcher />
      </body>
    </html>
  );
}
