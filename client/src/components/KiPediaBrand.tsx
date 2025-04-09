import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Database, Sparkles, Brain } from 'lucide-react';

export interface KiPediaBrandProps {
  className?: string;
}

export function KiPediaBrand({ className }: KiPediaBrandProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex items-center gap-1 text-lg font-bold px-2 py-1 rounded-md",
        "hover:bg-primary/5 transition-colors cursor-pointer select-none",
        "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600",
        className
      )}
      title="KI.pedia - Advanced Intelligence Platform"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <Database className="h-5 w-5 text-blue-400" />
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Sparkles className="h-3 w-3 text-yellow-400" />
        </motion.div>
      </div>
      
      <span className="font-bold mr-0.5">KI</span>
      <span className="text-sm font-normal opacity-80">.pedia</span>
      
      <motion.div
        initial={{ opacity: 0, rotate: -30 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="ml-1"
      >
        <Brain className="h-5 w-5 text-purple-400" />
      </motion.div>
    </motion.div>
  );
}