'use client';

import { motion } from 'framer-motion';
import { Bot, User, ShoppingCart, Quote, Brain, Target, MessageCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React from 'react';

const categoryIcons: Record<string, any> = {
  shopping: ShoppingCart,
  quotes: Quote,
  thoughts: Brain,
  goals: Target,
  reminders: MessageCircle,
  general: Plus,
};

const categoryColors: Record<string, string> = {
  shopping: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  quotes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
  thoughts: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200',
  goals: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  reminders: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
};

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    category?: string;
    timestamp?: Date;
  };
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: index * 0.1 
      }}
      className={`flex gap-4 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <motion.div 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#669BBC] to-[#003049] text-white shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Bot className="h-5 w-5 text-[#FDF0D5]" />
        </motion.div>
      )}
      
      <motion.div
        className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm relative overflow-hidden ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-[#669BBC] to-[#003049] text-[#FDF0D5]'
            : 'bg-[#FDF0D5]/95 dark:bg-[#003049]/95 text-[#003049] dark:text-[#FDF0D5] border border-[#669BBC]/30 dark:border-[#669BBC]/30'
        }`}
        whileHover={{ 
          scale: 1.02,
          boxShadow: message.role === 'user' 
            ? "0 10px 25px rgba(102, 155, 188, 0.3)"
            : "0 10px 25px rgba(102, 155, 188, 0.2)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Animated background for assistant messages */}
        {message.role === 'assistant' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#669BBC]/10 to-[#C1121F]/10"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          />
        )}
        
        <div className="relative z-10">
          <motion.div 
            className="whitespace-pre-wrap break-words"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message.content}
          </motion.div>
          
          {message.category && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              className="mt-3"
            >
              <Badge 
                variant="secondary" 
                className={`${categoryColors[message.category] || categoryColors.general} border-0 shadow-sm`}
              >
                {React.createElement(categoryIcons[message.category] || Plus, { 
                  className: "h-3 w-3 mr-1" 
                })}
                {message.category}
              </Badge>
            </motion.div>
          )}
          
          {message.timestamp && (
            <motion.div 
              className="text-xs opacity-70 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.7 }}
            >
              {message.timestamp.toLocaleTimeString()}
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {message.role === 'user' && (
        <motion.div 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C1121F] to-[#780000] text-white shadow-lg"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <User className="h-5 w-5 text-[#FDF0D5]" />
        </motion.div>
      )}
    </motion.div>
  );
}