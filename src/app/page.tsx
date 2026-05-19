import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Database, Search, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">OpenKB</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors flex items-center" href="/dashboard">
            Dashboard
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="rounded-full px-4">Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48 relative overflow-hidden flex items-center justify-center">
          {/* Background glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Your <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Intelligent</span> Knowledge Base
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Upload your documents and chat with them instantly. Powered by advanced RAG, Pinecone, and Llama 3.1. Get grounded answers with zero hallucinations.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 rounded-full text-md">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-md">
                    View GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Vector Storage</h3>
                <p className="text-muted-foreground">Seamlessly chunk and store your PDFs in Pinecone for lightning-fast semantic retrieval.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Retrieval</h3>
                <p className="text-muted-foreground">Ask questions and retrieve only the most relevant document chunks to ground the AI.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Answers</h3>
                <p className="text-muted-foreground">Powered by OpenRouter and Llama 3.1, get streaming responses directly from your docs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2026 OpenKB Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
