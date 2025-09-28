'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

interface PerformanceChartProps {
  data?: {
    system?: any;
    agents?: any[];
    workflows?: any[];
    summary?: any;
  };
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('executions');

  // Generate sample data for demonstration
  useEffect(() => {
    const sampleData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      sampleData.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        executions: Math.floor(Math.random() * 50) + 10,
        tokens: Math.floor(Math.random() * 10000) + 1000,
        response_time: Math.floor(Math.random() * 500) + 100,
        success_rate: Math.floor(Math.random() * 20) + 80,
      });
    }
    
    setChartData(sampleData);
  }, []);

  const metrics = [
    { id: 'executions', label: 'Executions', color: '#00D4FF' },
    { id: 'tokens', label: 'Tokens Used', color: '#39FF14' },
    { id: 'response_time', label: 'Response Time (ms)', color: '#FFB000' },
    { id: 'success_rate', label: 'Success Rate (%)', color: '#FF6B6B' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border border-electric-cyan/30">
          <p className="text-text-primary font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-text-secondary">
              <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedMetric === metric.id
                ? 'bg-electric-cyan text-deep-space'
                : 'bg-charcoal text-text-secondary hover:bg-gray-700'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-6"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(139, 157, 195, 0.2)" 
              />
              <XAxis 
                dataKey="time" 
                stroke="#8B9DC3"
                fontSize={12}
              />
              <YAxis 
                stroke="#8B9DC3"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={metrics.find(m => m.id === selectedMetric)?.color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGradient)"
                name={metrics.find(m => m.id === selectedMetric)?.label}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-display font-bold text-text-primary mb-1">
            {data?.summary?.total_executions || 0}
          </div>
          <div className="text-sm text-text-secondary">
            Total Executions
          </div>
        </div>
        
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-display font-bold text-text-primary mb-1">
            {data?.summary?.success_rate || 0}%
          </div>
          <div className="text-sm text-text-secondary">
            Success Rate
          </div>
        </div>
        
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-display font-bold text-text-primary mb-1">
            {data?.summary?.total_tokens_used || 0}
          </div>
          <div className="text-sm text-text-secondary">
            Total Tokens
          </div>
        </div>
        
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-display font-bold text-text-primary mb-1">
            {data?.summary?.average_execution_time || 0}ms
          </div>
          <div className="text-sm text-text-secondary">
            Avg Response Time
          </div>
        </div>
      </div>
    </div>
  );
}