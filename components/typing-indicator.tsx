'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4 justify-start"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#669BBC] to-[#003049] text-white shadow-lg">
        <Bot className="h-5 w-5 text-[#FDF0D5]" />
      </div>
      <div className="bg-[#FDF0D5]/95 dark:bg-[#003049]/95 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border border-[#669BBC]/30 dark:border-[#669BBC]/30">
        <div className="flex gap-2 items-center">
          <motion.div
            className="h-2 w-2 bg-[#669BBC] dark:bg-[#669BBC] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="h-2 w-2 bg-[#669BBC] dark:bg-[#669BBC] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 bg-[#669BBC] dark:bg-[#669BBC] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          />
          <span className="text-sm text-[#003049] dark:text-[#669BBC] ml-2">AI is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}