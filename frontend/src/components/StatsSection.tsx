'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface StatsSectionProps {
  stats: StatItem[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  const [animatedStats, setAnimatedStats] = useState<StatItem[]>(
    stats.map(stat => ({ ...stat, value: '0' }))
  );

  useEffect(() => {
    // Animate numbers on mount
    const timers = stats.map((stat, index) => {
      const targetValue = parseInt(stat.value.replace(/[^\d]/g, ''));
      const isPercentage = stat.value.includes('%');
      const isDecimal = stat.value.includes('.');
      
      return setTimeout(() => {
        animateValue(index, targetValue, isPercentage, isDecimal);
      }, index * 200);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [stats]);

  const animateValue = (index: number, target: number, isPercentage: boolean, isDecimal: boolean) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      let formattedValue = '';
      if (isDecimal) {
        formattedValue = current.toFixed(1) + (isPercentage ? '%' : 's');
      } else {
        formattedValue = Math.floor(current).toLocaleString() + (isPercentage ? '%' : '');
      }
      
      setAnimatedStats(prev => {
        const newStats = [...prev];
        newStats[index] = { ...newStats[index], value: formattedValue };
        return newStats;
      });
    }, 20);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-text-primary">
          Trusted by Developers Worldwide
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Join thousands of developers building the future of AI-powered applications
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {animatedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel p-6 text-center group hover:border-electric-cyan/30 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-deep-space" />
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2"
              >
                {stat.value}
              </motion.div>
              
              <div className="text-sm text-text-secondary font-medium">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}