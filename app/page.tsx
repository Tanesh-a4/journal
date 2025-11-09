'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { MessageBubble } from '@/components/message-bubble';
import { TypingIndicator } from '@/components/typing-indicator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faCartShopping, faSearch, faFaceGrinWide, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'

import { 
  Send, 
  Bot, 
  User, 
  ShoppingCart, 
  Quote, 
  Brain, 
  Target, 
  MessageCircle, 
  Plus,
  Sparkles,
  BookOpen,
  Settings,
  Search,
  Calendar
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTheme } from 'next-themes';

const categoryIcons: Record<string, any> = {
  shopping: ShoppingCart,
  quotes: Quote,
  thoughts: Brain,
  goals: Target,
  reminders: MessageCircle,
  general: Plus,
};

const categoryColors: Record<string, string> = {
  shopping: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  quotes: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200',
  thoughts: 'bg-green-200 text-green-900 dark:bg-green-800/30 dark:text-green-300',
  goals: 'bg-gray-200 text-gray-900 dark:bg-gray-700/30 dark:text-gray-300',
  reminders: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  timestamp?: Date;
}

const MotionCard = motion(Card);
const MotionDiv = motion.div;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredPrompt, setHoveredPrompt] = useState<number | null>(null);
  const { theme } = useTheme();

  const { ref: headerRef, inView: headerInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
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
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
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
        timestamp: new Date(),
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
            
            try {
              let content = '';
              
              // Try parsing as Vercel AI SDK format (0:"text")
              if (line.startsWith('0:')) {
                content = JSON.parse(line.slice(2));
              }
              // Try parsing as plain text chunks
              else if (line.startsWith('"') && line.endsWith('"')) {
                content = JSON.parse(line);
              }
              // Handle raw text
              else {
                content = line;
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
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const quickPrompts = [
    { 
      text: "Remind me to buy milk and eggs", 
      icon: (isHovered: boolean, isDark: boolean) => (
        <FontAwesomeIcon 
          icon={faCartShopping} 
          style={{ 
            color: isDark ? (isHovered ? "#000000" : "#EEEEEE") : "#000000", 
            fontSize: "20px" 
          }} 
        />
      ), 
      category: "shopping" 
    },
    { 
      text: "What's in my shopping list?", 
      icon: (isHovered: boolean, isDark: boolean) => (
        <FontAwesomeIcon 
          icon={faSearch} 
          style={{ 
            color: isDark ? (isHovered ? "#000000" : "#EEEEEE") : "#000000", 
            fontSize: "20px" 
          }} 
        />
      ), 
      category: "query" 
    },
    { 
      text: "I had an interesting thought today", 
      icon: (isHovered: boolean, isDark: boolean) => (
        <FontAwesomeIcon 
          icon={faFaceGrinWide} 
          style={{ 
            color: isDark ? (isHovered ? "#000000" : "#EEEEEE") : "#000000", 
            fontSize: "20px" 
          }} 
        />
      ), 
      category: "thoughts" 
    },
    { 
      text: "Show me my reminders", 
      icon: (isHovered: boolean, isDark: boolean) => (
        <FontAwesomeIcon 
          icon={faCalendarCheck} 
          style={{ 
            color: isDark ? (isHovered ? "#000000" : "#EEEEEE") : "#000000", 
            fontSize: "20px" 
          }} 
        />
      ), 
      category: "query" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEEEEE] via-[#08CB00]/20 to-[#000000]/30 dark:from-[#000000] dark:via-[#08CB00]/20 dark:to-[#08CB00]/30">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MotionDiv
          className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-[#08CB00]/20 to-[#000000]/20 dark:from-[#08CB00]/20 dark:to-[#EEEEEE]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <MotionDiv
          className="absolute -bottom-4 -left-4 w-96 h-96 bg-gradient-to-tr from-[#000000]/20 to-[#08CB00]/20 dark:from-[#08CB00]/30 dark:to-[#000000]/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 flex h-screen flex-col">
        {/* Header */}
        <MotionDiv
          ref={headerRef}
          initial={{ y: -50, opacity: 0 }}
          animate={headerInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="border-b bg-[#EEEEEE]/90 dark:bg-[#000000]/90 backdrop-blur-xl sticky top-0 z-20 border-[#08CB00]/30 dark:border-[#08CB00]/30"
        >
          <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MotionDiv
                className="bg-[#4C585B] p-2 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
               <FontAwesomeIcon
                icon={faBook}
                style={{ color: "#5aec55" }}
              />
              </MotionDiv>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#08CB00] to-[#000000] dark:from-[#08CB00] dark:to-[#EEEEEE] bg-clip-text text-transparent">
                  Journal Chat
                </h1>
                <p className="text-sm text-[#000000]/70 dark:text-[#EEEEEE]/70">Your intelligent journal companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* <Button variant="outline" size="icon" className="border-[#669BBC]/40 hover:bg-[#669BBC]/10">
                <Settings className="h-4 w-4 text-[#003049] dark:text-[#669BBC]" />
              </Button> */}
            </div>
          </div>
        </MotionDiv>

        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto h-full max-w-4xl p-4">
            <MotionCard 
              className="flex h-full flex-col shadow-2xl border-0 bg-[#EEEEEE]/95 dark:bg-[#000000]/95 backdrop-blur-xl border border-[#08CB00]/20 dark:border-[#08CB00]/20"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
                <ScrollArea className="flex-1 p-6">
                  <div ref={scrollRef}>
                    {messages.length === 0 ? (
                      <MotionDiv 
                        className="flex h-full items-center justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <div className="text-center space-y-8 max-w-2xl">
                          <MotionDiv
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 260, 
                              damping: 20,
                              delay: 0.6 
                            }}
                            className="relative"
                          >
                            <div className="text-8xl mb-6 relative">
                              📔
                              <MotionDiv
                                className="absolute -top-2 -right-2"
                                animate={{ 
                                  rotate: [0, 15, -15, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <Sparkles className="h-8 w-8 text-yellow-500" />
                              </MotionDiv>
                            </div>
                          </MotionDiv>
                          
                          <MotionDiv
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            <h2 className="text-3xl font-bold text-[#000000] dark:text-[#EEEEEE] mb-2">
                              Welcome to your Journal
                            </h2>
                            <p className="text-lg text-[#08CB00] dark:text-[#08CB00]">
                              Start a conversation with your personal AI journal assistant
                            </p>
                          </MotionDiv>

                          <MotionDiv
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8"
                          >
                            {quickPrompts.map((prompt, index) => (
                              <MotionDiv
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2 + index * 0.1 }}
                                whileHover={{ 
                                  scale: 1.02, 
                                  boxShadow: "0 10px 25px rgba(102, 155, 188, 0.15)" 
                                }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  variant="outline"
                                  onClick={() => setInput(prompt.text)}
                                  onMouseEnter={() => setHoveredPrompt(index)}
                                  onMouseLeave={() => setHoveredPrompt(null)}
                                  className="w-full p-4 h-auto  rounded-2xl flex items-center gap-3 text-left bg-gradient-to-r from-[#EEEEEE] to-[#08CB00]/30 dark:from-[#000000]/50 dark:to-[#08CB00]/30 border-[#08CB00]/40 dark:border-[#08CB00]/40 hover:from-[#08CB00]/20 hover:to-[#000000]/20 dark:hover:from-[#08CB00]/30 dark:hover:to-[#EEEEEE]/20 transition-all duration-200 group"
                                >
                                  <div className="flex-shrink-0">
                                    {prompt.icon(hoveredPrompt === index, theme === 'dark')}
                                  </div>
                                  <span className="text-sm text-[#000000] dark:text-[#EEEEEE] group-hover:text-[#000000] dark:group-hover:text-[#000000]">{prompt.text}</span>
                                </Button>
                              </MotionDiv>
                            ))}
                          </MotionDiv>

                          <MotionDiv
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6 }}
                            className="text-xs text-[#000000] dark:text-[#EEEEEE] bg-gradient-to-r from-[#EEEEEE] to-[#08CB00]/20 dark:from-[#000000]/30 dark:to-[#08CB00]/20 p-4 rounded-lg border border-[#08CB00]/30 dark:border-[#08CB00]/30"
                          >
                            <p className="mb-2 font-medium text-[#08CB00] dark:text-[#08CB00]">💡 AI-Powered Features:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                              <span>• Automatic categorization</span>
                              <span>• Smart tagging</span>
                              <span>• Intelligent search</span>
                              <span>• Context-aware responses</span>
                            </div>
                          </MotionDiv>
                        </div>
                      </MotionDiv>
                    ) : (
                      <div className="space-y-6">
                        <AnimatePresence>
                          {messages.map((message: any, index) => (
                            <MessageBubble key={message.id} message={message} index={index} />
                          ))}
                        </AnimatePresence>
                        
                        {isTyping && <TypingIndicator />}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <AnimatePresence>
                  {error && (
                    <MotionDiv
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400 border-[#08CB00]/20 dark:border-[#08CB00]/20"
                    >
                      <strong>Error:</strong> {error}
                    </MotionDiv>
                  )}
                </AnimatePresence>

                <Separator />
                
                <MotionDiv
                  className="p-6"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={input}
                          onChange={handleInputChange}
                          placeholder="Add an entry or ask about your journal..."
                          className="pr-12 h-12 text-base bg-[#EEEEEE]/80 dark:bg-[#000000]/50 backdrop-blur-sm border-[#08CB00]/50 dark:border-[#08CB00]/50 focus:border-[#08CB00] dark:focus:border-[#08CB00] rounded-xl text-[#000000] dark:text-[#EEEEEE] placeholder:text-[#08CB00]/60 dark:placeholder:text-[#08CB00]/60"
                          disabled={isLoading}
                        />
                        <MotionDiv
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <Button 
                            type="submit" 
                            size="icon"
                            disabled={isLoading || !input || !input.trim()}
                            className="h-8 w-8 bg-gradient-to-r from-[#08CB00] to-[#08CB00] dark:from-[#08CB00] dark:to-[#08CB00] hover:from-[#06A500] hover:to-[#06A500] dark:hover:from-[#0AE000] dark:hover:to-[#0AE000] rounded-lg shadow-lg transition-colors duration-200 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600"
                          >
                            <Send className="h-4 w-4 text-[#000000] dark:text-[#000000]" />
                          </Button>
                        </MotionDiv>
                      </div>
                    </div>
                    
                    {messages.length === 0 && (
                      <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-2 text-xs text-[#08CB00] dark:text-[#08CB00]"
                      >
                        <span>Quick start:</span>
                        {quickPrompts.slice(0, 2).map((prompt, index) => (
                          <MotionDiv key={index} whileHover={{ scale: 1.05 }}>
                            <button 
                              type="button" 
                              onClick={() => setInput(prompt.text)}
                              className="hover:text-[#000000] dark:hover:text-[#EEEEEE] underline transition-colors"
                            >
                              {prompt.text.split(' ').slice(0, 3).join(' ')}...
                            </button>
                          </MotionDiv>
                        ))}
                      </MotionDiv>
                    )}
                  </form>
                </MotionDiv>
              </CardContent>
            </MotionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

