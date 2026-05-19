"use client"

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocStore } from '@/store/use-app-store';
import { toast } from 'sonner';
import { UploadModal } from '@/components/upload/upload-modal';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function DashboardPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { documents, removeDocument } = useDocStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show empty state during SSR to avoid hydration mismatch
  const visibleDocuments = mounted ? documents : [];


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

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Documents</h2>
          <p className="text-muted-foreground">Manage and query your knowledge base.</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      {visibleDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl border-muted-foreground/20 bg-muted/5">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">No documents yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            Upload your first PDF document to start querying it with AI.
          </p>
          <Button onClick={() => setIsUploadModalOpen(true)}>Upload PDF</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleDocuments.map((doc) => (
            <Card key={doc.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4 line-clamp-1" title={doc.name}>
                  {doc.name}
                </CardTitle>
                <CardDescription>
                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Uploaded {formatDistanceToNow(doc.createdAt, { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UploadModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} />
    </DashboardLayout>
  );
}
