"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutDashboard, MessageSquare, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-md">
      <div className="flex h-14 items-center border-b px-4 py-4 shrink-0">
        <Link className="flex items-center gap-2 font-semibold" href="/" onClick={() => setOpen(false)}>
          <div className="bg-primary p-1.5 rounded-lg shadow-sm shadow-primary/30">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">OpenKB</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/95" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 shrink-0 border-t border-border/50">
        <Link
          href="#"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, shown on md and up) */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-muted/10 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Header (shown on mobile, hidden on md and up) */}
      <header className="flex md:hidden h-14 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 shrink-0 sticky top-0 z-40">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <div className="bg-primary p-1 rounded-md">
            <Bot className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">OpenKB</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-border/40 hover:bg-muted">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <NavContent />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
