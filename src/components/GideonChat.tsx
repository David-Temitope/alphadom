import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type Message = { role: 'user' | 'assistant'; content: string };

// Product card component for chat
const ProductCard = memo(({ id, name, price, image }: { id: string; name: string; price: string; image: string }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="inline-flex items-center gap-2 bg-card border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors my-1"
      onClick={() => navigate(`/products/${id}`)}
    >
      <img 
        src={image || '/placeholder.svg'}
        alt={name}
        className="w-12 h-12 object-cover rounded"
        loading="lazy"
      />
      <div className="flex flex-col">
        <span className="text-xs font-medium line-clamp-1">{name}</span>
        <span className="text-xs text-primary font-bold">₦{Number(price).toLocaleString()}</span>
      </div>
    </div>
  );
});

// Vendor card component for chat - uses user_id for navigation since /pilots/:id expects user_id
const VendorCard = memo(({ id, name, image, userId }: { id: string; name: string; image?: string; userId?: string }) => {
  const navigate = useNavigate();
  
  // Navigate using userId (the vendor's user_id) for the pilots page
  const handleClick = () => {
    if (userId) {
      navigate(`/vendor/${userId}`);
    }
  };
  
  // Use placeholder if image is empty, 'none', or undefined
  const displayImage = image && image !== 'none' && image.trim() !== '' ? image : '/placeholder.svg';
  
  return (
    <div 
      className="inline-flex items-center gap-2 bg-card border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors my-1"
      onClick={handleClick}
    >
      <img 
        src={displayImage}
        alt={name}
        className="w-12 h-12 object-cover rounded-full"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      <div className="flex flex-col">
        <span className="text-xs font-medium line-clamp-1">{name}</span>
        <span className="text-xs text-muted-foreground">View Store</span>
      </div>
    </div>
  );
});

// Parse message content and render product cards
const MessageContent = memo(({ content }: { content: string }) => {
  const navigate = useNavigate();
  
  // Parse product cards: [[PRODUCT:id:name:price:image]]
  const productRegex = /\[\[PRODUCT:([^:]+):([^:]+):([^:]+):([^\]]*)\]\]/g;
  // Parse vendor cards: [[VENDOR:id:name:image:user_id]]
  const vendorRegex = /\[\[VENDOR:([^:]+):([^:]+):([^:]*):([^\]]*)\]\]/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  // First pass: extract all matches and their positions
  const matches: { index: number; length: number; element: React.ReactNode }[] = [];
  
  const tempContent = content;
  
  // Find product matches
  while ((match = productRegex.exec(tempContent)) !== null) {
    const [fullMatch, id, name, price, image] = match;
    matches.push({
      index: match.index,
      length: fullMatch.length,
      element: <ProductCard key={`product-${id}-${match.index}`} id={id} name={name} price={price} image={image} />
    });
  }
  
  // Find vendor matches
  while ((match = vendorRegex.exec(tempContent)) !== null) {
    const [fullMatch, id, name, image, userId] = match;
    matches.push({
      index: match.index,
      length: fullMatch.length,
      element: <VendorCard key={`vendor-${id}-${match.index}`} id={id} name={name} image={image} userId={userId} />
    });
  }
  
  // Sort by position
  matches.sort((a, b) => a.index - b.index);
  
  // Build parts array
  matches.forEach((m, i) => {
    if (m.index > lastIndex) {
      parts.push(<span key={`text-${i}`}>{content.slice(lastIndex, m.index)}</span>);
    }
    parts.push(m.element);
    lastIndex = m.index + m.length;
  });
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(<span key="text-end">{content.slice(lastIndex)}</span>);
  }
  
  if (parts.length === 0) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }
  
  return <div className="text-sm whitespace-pre-wrap">{parts}</div>;
});

export const GideonChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m Gideon, your platform assistant. How can I help you today? Ask me about products, vendors, or anything about Alphadom!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > 1 && prev[prev.length - 2]?.role === 'user') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-gideon`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          toast.error(error.error || 'Your AI access has been blocked');
        } else if (response.status === 429 || response.status === 402) {
          toast.error(error.error);
        } else {
          toast.error('Failed to get response from Gideon');
        }
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      if (!reader) throw new Error('No reader available');

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to connect to Gideon');
      setMessages(prev => prev.slice(0, -1));
      setIsLoading(false);
    }
  }, [input, isLoading, user, messages]);

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-2 border-white z-50 animate-[pulse_6s_ease-in-out_infinite] md:bottom-6"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white drop-shadow-lg" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-24 right-4 left-4 md:bottom-6 md:left-auto md:right-6 md:w-96 h-[500px] shadow-2xl z-50 flex flex-col max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Gideon AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, vendors..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
};