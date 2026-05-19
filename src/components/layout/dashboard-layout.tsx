import { Sidebar } from './sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/20 px-6 lg:h-[60px]">
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
