'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Play, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  MoreVertical,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    role: string;
    goal: string;
    backstory: string;
    agent_type: string;
    model_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    status?: string;
    tasks_completed?: number;
    average_response_time?: number;
  };
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onView: () => void;
}

export function AgentCard({ 
  agent, 
  viewMode, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onView 
}: AgentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-neon-green animate-pulse" />;
      case 'idle':
        return <Clock className="w-4 h-4 text-text-muted" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-coral-red" />;
      default:
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
    }
  };

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="group glass-panel p-6 border-2 border-transparent hover:border-electric-cyan/30 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-deep-space" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {agent.name}
              </h3>
              <p className="text-sm text-text-secondary mb-2">
                {agent.role}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>Model: {agent.model_name}</span>
                <span>Type: {agent.agent_type}</span>
                {agent.tasks_completed !== undefined && (
                  <span>Tasks: {agent.tasks_completed}</span>
                )}
                {agent.average_response_time !== undefined && (
                  <span>Avg: {formatTime(agent.average_response_time)}</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(agent.status)}
              <span className="text-sm text-text-secondary capitalize">
                {agent.status || 'Ready'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="p-2 text-text-secondary hover:text-electric-cyan transition-colors duration-200"
              title="View Agent"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-text-secondary hover:text-neon-green transition-colors duration-200"
              title="Edit Agent"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 text-text-secondary hover:text-amber transition-colors duration-200"
              title="Duplicate Agent"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-text-secondary hover:text-coral-red transition-colors duration-200"
              title="Delete Agent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group glass-panel border-2 border-transparent hover:border-electric-cyan/30 transition-all duration-300 relative"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-deep-space" />
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {agent.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {agent.role}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon(agent.status)}
            <span className="text-sm text-text-secondary capitalize">
              {agent.status || 'Ready'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Settings className="w-4 h-4" />
            <span>Model: {agent.model_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <User className="w-4 h-4" />
            <span>Type: {agent.agent_type}</span>
          </div>

          {agent.goal && (
            <div className="text-sm text-text-secondary">
              <span className="font-medium">Goal:</span> {agent.goal.substring(0, 100)}...
            </div>
          )}

          {agent.tasks_completed !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Tasks Completed</span>
              <span className="font-medium text-text-primary">{agent.tasks_completed}</span>
            </div>
          )}

          {agent.average_response_time !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Avg Response Time</span>
              <span className="font-medium text-text-primary">
                {formatTime(agent.average_response_time)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          <button
            onClick={onEdit}
            className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
          
          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="btn-secondary text-sm py-2 px-3"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-charcoal border border-gray-700 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-gray-700 hover:text-text-primary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-coral-red hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Active Badge */}
        {agent.is_active && (
          <div className="absolute top-4 right-4">
            <div className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs font-medium rounded-full">
              ACTIVE
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}