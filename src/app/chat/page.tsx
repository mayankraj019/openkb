"use client"

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { Sidebar } from '@/components/layout/sidebar';
import { useDocStore } from '@/store/use-app-store';
import { FileText, Trash2, Plus, MessageSquare, Files, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { UploadModal } from '@/components/upload/upload-modal';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showDocsSidebar, setShowDocsSidebar] = useState(true);
  const [mobileTab, setMobileTab] = useState<'chat' | 'docs'>('chat');
  const [searchQuery, setSearchQuery] = useState('');

  const { documents, removeDocument } = useDocStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        removeDocument(id);
        toast.success('Document deleted successfully');
      } else {
        throw new Error('Failed to delete document');
      }
    } catch {
      toast.error('Could not delete document');
    }
  };

  const visibleDocuments = mounted ? documents : [];
  const filteredDocuments = visibleDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar (Responsive Mobile Header / Desktop Left Navigation) */}
      <Sidebar />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Sub-Navigation Tabs (Only shown on mobile) */}
        <div className="flex md:hidden items-center justify-between border-b bg-muted/20 px-4 py-2 shrink-0">
          <div className="flex w-full bg-muted/60 p-1 rounded-xl gap-1">
            <button
              onClick={() => setMobileTab('chat')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200",
                mobileTab === 'chat'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              AI Chat
            </button>
            <button
              onClick={() => setMobileTab('docs')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200",
                mobileTab === 'docs'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Files className="h-3.5 w-3.5" />
              Documents ({visibleDocuments.length})
            </button>
          </div>
        </div>

        {/* Dynamic Split Layout Body */}
        <div className="flex-1 flex h-full overflow-hidden relative">
          
          {/* Document Section/Panel */}
          <div
            className={cn(
              "border-r bg-muted/10 flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-10",
              // Desktop layout logic: toggleable sidebar
              showDocsSidebar ? "md:w-80 md:flex" : "md:w-0 md:hidden",
              // Mobile layout logic: Tab based display
              mobileTab === 'docs' ? "w-full flex" : "hidden md:flex"
            )}
          >
            {/* Header for Document Section */}
            <div className="p-4 border-b flex items-center justify-between bg-card/30 backdrop-blur-md shrink-0">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Files className="h-4 w-4 text-primary" />
                  Active Documents
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {visibleDocuments.length} document{visibleDocuments.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-lg shrink-0"
                onClick={() => setIsUploadOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Document Search Bar */}
            {visibleDocuments.length > 0 && (
              <div className="p-3 border-b bg-card/10 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-muted/40 border border-border/40 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredDocuments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                  <FileText className="h-10 w-10 text-muted-foreground/60 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium">
                    {searchQuery ? 'No matching documents' : 'No documents loaded'}
                  </p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
                    {searchQuery 
                      ? 'Try adjusting your search filter.' 
                      : 'Upload a PDF to ground your AI assistant.'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsUploadOpen(true)}
                      className="mt-4 gap-1.5 text-xs rounded-lg"
                    >
                      <Plus className="h-3 w-3" /> Upload PDF
                    </Button>
                  )}
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="group relative flex items-start gap-3 p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/40 hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-medium truncate text-foreground" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="absolute right-2 top-2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Toggle Expand/Collapse Sidebar Tab Button (Desktop Only) */}
          <button
            onClick={() => setShowDocsSidebar(!showDocsSidebar)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-16 w-4 items-center justify-center bg-card border-y border-r rounded-r-lg shadow-md border-border/60 hover:bg-muted hover:text-foreground text-muted-foreground transition-all duration-200"
            style={{
              transform: showDocsSidebar ? 'translateX(319px) translateY(-50%)' : 'translateX(0px) translateY(-50%)',
              transition: 'transform 300ms ease-in-out, background-color 200ms',
            }}
            title={showDocsSidebar ? "Collapse Documents" : "Expand Documents"}
          >
            {showDocsSidebar ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {/* Chat Interface Panel */}
          <div
            className={cn(
              "flex-1 h-full overflow-hidden",
              // Mobile layout logic: Tab based display
              mobileTab === 'chat' ? "flex" : "hidden md:flex"
            )}
          >
            <ChatInterface />
          </div>
        </div>

      </div>

      {/* Upload Modal Manager */}
      <UploadModal open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
}
