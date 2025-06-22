import { AppSidebar, MobileAppHeader } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <div className="min-h-screen w-full grid grid-cols-1 sm:grid-cols-[240px_1fr]">
  {/* Sidebar */}
  <aside className="hidden sm:block bg-muted border-r border-border">
    <AppSidebar />
  </aside>

  {/* Right content area (header + main) */}
  <div className="flex flex-col">
    <div className="block sm:hidden">
      <MobileAppHeader />
    </div>
    <div className="hidden sm:block">
      <AppHeader />
    </div>
  <main className="flex-1 overflow-auto bg-background px-4 py-4 lg:px-6 lg:py-6">
  <div className="w-full max-w-[800px] mx-auto">
    {children}
  </div>
</main>
  </div>
</div>

  );
}
