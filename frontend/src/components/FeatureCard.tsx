'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientColor: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradientColor
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}></div>
      
      {/* Card content */}
      <div className="relative glass-panel p-8 h-full transition-all duration-300 group-hover:border-electric-cyan/30">
        {/* Icon */}
        <div className={`w-16 h-16 bg-gradient-to-r ${gradientColor} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-deep-space" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-display font-bold mb-4 text-text-primary">
          {title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary leading-relaxed">
          {description}
        </p>

        {/* Hover effect indicator */}
        <div className="mt-6 flex items-center text-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-sm font-medium">Learn more</span>
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}