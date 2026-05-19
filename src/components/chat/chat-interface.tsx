"use client"

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, User, Loader2, Copy, Trash2 } from 'lucide-react';
import { useDocStore, useChatStore } from '@/store/use-app-store';
import { toast } from 'sonner';
import Link from 'next/link';

export function ChatInterface() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { documents } = useDocStore();
  const { chatMessages, addChatMessage, updateLastAssistantMessage, clearChat } = useChatStore();

  useEffect(() => { setMounted(true); }, []);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-resize textarea
  const autoResize = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  };

  const docIds = mounted ? documents.map(d => d.id) : [];
  const hasDocuments = mounted && documents.length > 0;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text };
    addChatMessage(userMsg);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    addChatMessage({ id: assistantId, role: 'assistant', content: '' });

    const history = [...useChatStore.getState().chatMessages]
      .filter(m => m.id !== assistantId)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, docIds }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('0:')) {
            try { fullText += JSON.parse(line.slice(2)); }
            catch { fullText += line.slice(2).replace(/^"|"$/g, ''); }
            updateLastAssistantMessage(assistantId, fullText);
          }
        }
      }

      if (!fullText) {
        updateLastAssistantMessage(assistantId, 'Sorry, I received an empty response. Please try again.');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(msg);
      updateLastAssistantMessage(assistantId, `⚠️ Error: ${msg}`);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    // OUTER: fills 100% of parent height, never overflows
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      background: 'var(--background)',
    }}>

      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bot size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>AI Chat Assistant</span>
          {hasDocuments && (
            <span style={{
              fontSize: 11, background: 'color-mix(in srgb,var(--primary) 15%,transparent)',
              color: 'var(--primary)', padding: '2px 8px', borderRadius: 99,
            }}>
              {documents.length} doc{documents.length > 1 ? 's' : ''} loaded
            </span>
          )}
        </div>
        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
              color: 'var(--muted-foreground)', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
            }}
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      {/* ── MESSAGES (scrollable) ─────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {chatMessages.length === 0 ? (
          // Empty state
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', opacity: 0.6, paddingTop: 80,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', marginBottom: 16,
              background: 'color-mix(in srgb,var(--primary) 15%,transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              How can I help you today?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', maxWidth: 320 }}>
              {hasDocuments
                ? `${documents.length} document${documents.length > 1 ? 's' : ''} ready. Ask me anything!`
                : 'Go to Dashboard and upload a PDF first.'}
            </p>
          </div>
        ) : (
          chatMessages.map((m, i) => (
            <div key={m.id || i} style={{
              display: 'flex',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 10,
              maxWidth: 820,
              width: '100%',
              margin: '0 auto',
            }}>
              {/* Avatar */}
              <div style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: m.role === 'user'
                  ? 'var(--secondary)'
                  : 'color-mix(in srgb,var(--primary) 20%,transparent)',
              }}>
                {m.role === 'user'
                  ? <User size={16} />
                  : <Bot size={16} style={{ color: 'var(--primary)' }} />}
              </div>

              {/* Bubble */}
              <div style={{
                position: 'relative',
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: m.role === 'user'
                  ? 'var(--primary)'
                  : 'var(--muted)',
                color: m.role === 'user' ? 'var(--primary-foreground)' : 'var(--foreground)',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {m.content ? m.content : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7 }}>
                    <Loader2 size={14} className="animate-spin" /> Thinking…
                  </span>
                )}

                {/* Copy button for assistant */}
                {m.role === 'assistant' && m.content && (
                  <button
                    onClick={() => copyText(m.content)}
                    title="Copy"
                    style={{
                      position: 'absolute', top: 6, right: -30,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--muted-foreground)', padding: 4, borderRadius: 4,
                    }}
                  >
                    <Copy size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR (always pinned at bottom) ──────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
        padding: '12px 16px 16px',
      }}>
        {/* Warning if no docs */}
        {!hasDocuments && mounted && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#f59e0b', marginBottom: 8 }}>
            ⚠️ No documents loaded.{' '}
            <Link href="/dashboard" style={{ textDecoration: 'underline' }}>
              Upload a PDF
            </Link>{' '}
            to get started.
          </p>
        )}

        <div style={{
          maxWidth: 820, margin: '0 auto',
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '8px 8px 8px 16px',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents…"
            disabled={isLoading}
            autoFocus
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--foreground)',
              minHeight: 36,
              maxHeight: 200,
              overflowY: 'auto',
              fontFamily: 'inherit',
              padding: '4px 0',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              flexShrink: 0,
              width: 36, height: 36,
              borderRadius: 10,
              border: 'none',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              background: isLoading || !input.trim()
                ? 'var(--muted-foreground)'
                : 'var(--primary)',
              color: 'var(--primary-foreground)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isLoading || !input.trim() ? 0.4 : 1,
              transition: 'opacity 0.2s, background 0.2s',
            }}
          >
            {isLoading
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />}
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 11,
          color: 'var(--muted-foreground)', marginTop: 8,
        }}>
          Enter to send · Shift+Enter for new line · AI may make mistakes
        </p>
      </div>
    </div>
  );
}
