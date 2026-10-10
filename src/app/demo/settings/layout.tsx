import { AppHeader, MobileNavigation } from "@/components/layout/navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas pb-16 md:pb-0">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
