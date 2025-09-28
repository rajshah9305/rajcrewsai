'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: number;
  subtitle?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`}></div>
      
      {/* Card content */}
      <div className="relative glass-panel p-6 h-full transition-all duration-300 group-hover:border-electric-cyan/30">
        <div className="flex items-center justify-between mb-4">
          {/* Icon */}
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-deep-space" />
          </div>

          {/* Trend indicator */}
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium ${
              trend >= 0 ? 'text-neon-green' : 'text-coral-red'
            }`}>
              <svg
                className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-3xl font-display font-bold text-text-primary mb-2">
          {value}
        </div>

        {/* Title */}
        <div className="text-sm font-medium text-text-secondary mb-1">
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-text-muted">
            {subtitle}
          </div>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl" 
             style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}>
        </div>
      </div>
    </motion.div>
  );
}