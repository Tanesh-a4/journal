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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#08CB00] to-[#000000] dark:from-[#08CB00] dark:to-[#000000] text-white shadow-lg">
        <Bot className="h-5 w-5 text-[#EEEEEE] dark:text-[#000000]" />
      </div>
      <div className="bg-[#EEEEEE]/95 dark:bg-[#000000]/95 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border border-[#08CB00]/30 dark:border-[#08CB00]/30">
        <div className="flex gap-2 items-center">
          <motion.div
            className="h-2 w-2 bg-[#08CB00] dark:bg-[#08CB00] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="h-2 w-2 bg-[#08CB00] dark:bg-[#08CB00] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 bg-[#08CB00] dark:bg-[#08CB00] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          />
          <span className="text-sm text-[#000000] dark:text-[#EEEEEE] ml-2">AI is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}