'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, ShoppingCart, Quote, Brain, Target, MessageCircle, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const categoryIcons: Record<string, any> = {
  shopping: ShoppingCart,
  quotes: Quote,
  thoughts: Brain,
  goals: Target,
  reminders: MessageCircle,
  general: Plus,
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if the response is JSON or streaming
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Handle JSON response
        const data = await response.json();
        assistantMessage.content = data.content || 'No response received.';
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: assistantMessage.content }
              : msg
          )
        );
      } else {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            console.log('Received line:', line); // Debug log
            
            // Handle different streaming formats
            try {
              let content = '';
              
              // Try parsing as Vercel AI SDK format (0:"text")
              if (line.startsWith('0:')) {
                content = JSON.parse(line.slice(2));
                console.log('Parsed 0: format:', content); // Debug log
              }
              // Try parsing as plain text chunks
              else if (line.startsWith('"') && line.endsWith('"')) {
                content = JSON.parse(line);
                console.log('Parsed JSON format:', content); // Debug log
              }
              // Handle raw text
              else {
                content = line;
                console.log('Raw text:', content); // Debug log
              }
              
              if (content) {
                assistantMessage.content += content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.log('Parse error, treating as raw text:', line); // Debug log
              // If JSON parsing fails, treat as raw text
              assistantMessage.content += line + '\n';
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantMessage.content }
                    : msg
                )
              );
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full max-w-4xl p-4">
          <Card className="flex h-full flex-col shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold">📔 Journal Chat</CardTitle>
              <CardDescription className="text-blue-100">
                Add entries to your journal or query your existing entries
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 p-4">
                <div ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="text-6xl mb-4">📔</div>
                      <h2 className="text-2xl font-semibold text-muted-foreground">
                        Welcome to your Journal
                      </h2>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                          <strong>Try saying:</strong>
                          <ul className="mt-2 space-y-1 text-left">
                            <li>• "Remind me to buy eggs next time I'm at the supermarket"</li>
                            <li>• "Alice says 'Check out that new biryani place'"</li>
                            <li>• "What's in my shopping list?"</li>
                            <li>• "Show me my reminders"</li>
                          </ul>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          I'll automatically categorize and tag your entries for easy retrieval!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-white">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-current rounded-full animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </ScrollArea>
              {error && (
                <div className="border-t bg-destructive/10 p-4 text-sm text-destructive">
                  <strong>Error:</strong> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Add an entry or ask about your journal... (e.g., 'Remind me to buy eggs' or 'What's my shopping list?')"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Quick examples:</span>
                  <button 
                    type="button" 
                    onClick={() => setInput("Remind me to buy milk and eggs")}
                    className="hover:text-blue-600 underline"
                  >
                    Add reminder
                  </button>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => setInput("What's in my shopping list?")}
                    className="hover:text-blue-600 underline"
                  >
                    Check shopping list
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

