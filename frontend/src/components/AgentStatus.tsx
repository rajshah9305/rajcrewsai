'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Brain,
  Settings
} from 'lucide-react';

interface AgentStatusProps {
  agent: {
    id: string;
    name: string;
    role: string;
    status: string;
    model_name: string;
    tasks_completed: number;
    total_tasks: number;
    last_activity?: string;
    tokens_used: number;
    average_response_time: number;
  };
}

export function AgentStatus({ agent }: AgentStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-neon-green animate-pulse" />;
      case 'idle':
        return <Clock className="w-4 h-4 text-text-muted" />;
      case 'busy':
        return <Zap className="w-4 h-4 text-amber animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-coral-red" />;
      default:
        return <User className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-neon-green/30 bg-neon-green/10';
      case 'idle':
        return 'border-text-muted/30 bg-text-muted/10';
      case 'busy':
        return 'border-amber/30 bg-amber/10';
      case 'error':
        return 'border-coral-red/30 bg-coral-red/10';
      default:
        return 'border-gray-700 bg-charcoal';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const completionRate = agent.total_tasks > 0 
    ? Math.round((agent.tasks_completed / agent.total_tasks) * 100) 
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group glass-panel border-2 transition-all duration-300 ${getStatusColor(agent.status)}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-6 h-6 text-deep-space" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {agent.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {agent.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(agent.status)}
            <span className="text-sm font-medium text-text-primary capitalize">
              {agent.status}
            </span>
          </div>
        </div>

        {/* Model Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <Settings className="w-4 h-4" />
            <span>Model: {agent.model_name}</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-2xl font-display font-bold text-text-primary">
              {agent.tasks_completed}
            </div>
            <div className="text-sm text-text-secondary">
              Tasks Completed
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-display font-bold text-text-primary">
              {formatTime(agent.average_response_time)}
            </div>
            <div className="text-sm text-text-secondary">
              Avg Response
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
            <span>Completion Rate</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-charcoal rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-electric-cyan to-neon-green"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Total Tasks</span>
            <div className="font-medium text-text-primary">
              {agent.total_tasks}
            </div>
          </div>
          
          <div>
            <span className="text-text-secondary">Tokens Used</span>
            <div className="font-medium text-text-primary">
              {agent.tokens_used.toLocaleString()}
            </div>
          </div>
          
          {agent.last_activity && (
            <div className="col-span-2">
              <span className="text-text-secondary">Last Activity</span>
              <div className="font-medium text-text-primary">
                {new Date(agent.last_activity).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            agent.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
            agent.status === 'busy' ? 'bg-amber/20 text-amber' :
            agent.status === 'error' ? 'bg-coral-red/20 text-coral-red' :
            'bg-text-muted/20 text-text-muted'
          }`}>
            {agent.status.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}