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
        "flex items-center gap-1 text-xl font-bold px-3 py-1 rounded-md",
        "hover:bg-primary/5 transition-colors cursor-pointer select-none",
        "text-white",
        className
      )}
      title="KIAPEDIA - Advanced Intelligence Platform"
      whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)" }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="font-bold tracking-wider"
        animate={{ 
          textShadow: ["0 0 3px rgba(255,255,255,0.2)", "0 0 8px rgba(255,255,255,0.5)", "0 0 3px rgba(255,255,255,0.2)"]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        KIAPEDIA
      </motion.div>
    </motion.div>
  );
}