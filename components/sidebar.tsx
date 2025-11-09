'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Bookmark, 
  Tag, 
  Calendar,
  TrendingUp,
  Clock,
  ShoppingCart, 
  Quote, 
  Brain, 
  Target, 
  MessageCircle
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  shopping: ShoppingCart,
  quotes: Quote,
  thoughts: Brain,
  goals: Target,
  reminders: MessageCircle,
};

const categoryColors: Record<string, string> = {
  shopping: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  quotes: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  thoughts: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  goals: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  reminders: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const recentCategories = ['thoughts', 'shopping', 'reminders', 'goals'];
  const stats = [
    { label: 'Total Entries', value: '127', icon: Calendar },
    { label: 'This Week', value: '12', icon: TrendingUp },
    { label: 'Today', value: '3', icon: Clock },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-border z-50 md:relative md:z-0"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Journal Insights</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
              ✕
            </Button>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Statistics</h3>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <stat.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
            <div className="space-y-2">
              {recentCategories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-auto p-3"
                  >
                    <div className="p-1 rounded bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                      {React.createElement(categoryIcons[category], { className: "h-4 w-4" })}
                    </div>
                    <span className="capitalize">{category}</span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto ${categoryColors[category]} border-0 text-xs`}
                    >
                      {Math.floor(Math.random() * 20) + 1}
                    </Badge>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-3">
                <History className="h-4 w-4" />
                View History
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Bookmark className="h-4 w-4" />
                Bookmarked
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Tag className="h-4 w-4" />
                All Tags
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}