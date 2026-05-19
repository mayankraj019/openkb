import { Sidebar } from './sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Only show dashboard header on desktop, since mobile has the Sidebar top header */}
        <header className="hidden md:flex h-14 items-center gap-4 border-b bg-muted/25 px-6 lg:h-[60px] shrink-0 bg-background/50 backdrop-blur-md">
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg text-foreground">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
