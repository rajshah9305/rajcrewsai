'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Activity
} from 'lucide-react';

interface WorkflowStatusProps {
  workflow: {
    id: string;
    name: string;
    status: string;
    progress: number;
    current_task?: string;
    current_agent?: string;
    started_at?: string;
    estimated_completion?: string;
    tokens_used: number;
    execution_time: number;
    agents?: any[];
    tasks?: any[];
  };
}

export function WorkflowStatus({ workflow }: WorkflowStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-5 h-5 text-amber animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-neon-green" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-coral-red" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-amber" />;
      default:
        return <Clock className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-amber/30 bg-amber/10';
      case 'completed':
        return 'border-neon-green/30 bg-neon-green/10';
      case 'failed':
        return 'border-coral-red/30 bg-coral-red/10';
      case 'paused':
        return 'border-amber/30 bg-amber/10';
      default:
        return 'border-text-muted/30 bg-text-muted/10';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel border-2 transition-all duration-300 ${getStatusColor(workflow.status)}`}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(workflow.status)}
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {workflow.name}
              </h3>
              <p className="text-sm text-text-secondary">
                ID: {workflow.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-charcoal rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${workflow.progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r from-electric-cyan to-neon-green`}
                />
              </div>
              <span className="text-sm text-text-secondary">
                {(workflow.progress * 100).toFixed(0)}%
              </span>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-text-secondary hover:text-electric-cyan transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
            <span>Progress</span>
            <span>{(workflow.progress * 100).toFixed(0)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-charcoal rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${workflow.progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-electric-cyan to-neon-green"
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Status</span>
            <div className="font-medium text-text-primary capitalize">
              {workflow.status}
            </div>
          </div>
          
          {workflow.current_task && (
            <div>
              <span className="text-text-secondary">Current Task</span>
              <div className="font-medium text-text-primary">
                {workflow.current_task}
              </div>
            </div>
          )}
          
          {workflow.current_agent && (
            <div>
              <span className="text-text-secondary">Current Agent</span>
              <div className="font-medium text-text-primary">
                {workflow.current_agent}
              </div>
            </div>
          )}
          
          <div>
            <span className="text-text-secondary">Execution Time</span>
            <div className="font-medium text-text-primary">
              {formatTime(workflow.execution_time)}
            </div>
          </div>
          
          <div>
            <span className="text-text-secondary">Tokens Used</span>
            <div className="font-medium text-text-primary">
              {workflow.tokens_used.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {workflow.status === 'running' && (
            <>
              <button className="btn-secondary text-xs px-3 py-1 flex items-center gap-1">
                <Pause className="w-3 h-3" />
                Pause
              </button>
              <button className="btn-secondary text-xs px-3 py-1 flex items-center gap-1">
                <Square className="w-3 h-3" />
                Stop
              </button>
            </>
          )}
          
          {workflow.status === 'paused' && (
            <button className="btn-primary text-xs px-3 py-1 flex items-center gap-1">
              <Play className="w-3 h-3" />
              Resume
            </button>
          )}
          
          {workflow.status === 'failed' && (
            <button className="btn-primary text-xs px-3 py-1 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-700 px-6 pb-6"
        >
          <div className="pt-6 space-y-6">
            {/* Agents */}
            {workflow.agents && workflow.agents.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-electric-cyan" />
                  Agents ({workflow.agents.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {workflow.agents.map((agent, index) => (
                    <div key={index} className="bg-charcoal p-3 rounded-lg">
                      <div className="font-medium text-text-primary">
                        {agent.name || agent.role}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {agent.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {workflow.tasks && workflow.tasks.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-electric-cyan" />
                  Tasks ({workflow.tasks.length})
                </h4>
                <div className="space-y-2">
                  {workflow.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between bg-charcoal p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-neon-green' :
                          task.status === 'running' ? 'bg-amber animate-pulse' :
                          task.status === 'failed' ? 'bg-coral-red' :
                          'bg-text-muted'
                        }`}></div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {task.name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {task.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary capitalize">
                        {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {workflow.started_at && (
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-3">
                  Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Started</span>
                    <span className="text-text-primary">
                      {new Date(workflow.started_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {workflow.estimated_completion && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Estimated Completion</span>
                      <span className="text-text-primary">
                        {new Date(workflow.estimated_completion).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Duration</span>
                    <span className="text-text-primary">
                      {formatTime(workflow.execution_time)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}