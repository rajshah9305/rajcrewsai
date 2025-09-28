'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  Play, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Users,
  FileText
} from 'lucide-react';
import { useState } from 'react';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    status: string;
    crew_id: string;
    workflow_type: string;
    tasks: any[];
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
  };
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExecute: () => void;
  onVisualize: () => void;
}

export function WorkflowCard({ 
  workflow, 
  viewMode, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onExecute,
  onVisualize
}: WorkflowCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-amber animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-coral-red" />;
      case 'paused':
        return <Clock className="w-4 h-4 text-amber" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
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

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`group glass-panel p-6 border-2 transition-all duration-300 ${getStatusColor(workflow.status)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-deep-space" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {workflow.name}
              </h3>
              <p className="text-sm text-text-secondary mb-2">
                {workflow.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>Type: {workflow.workflow_type}</span>
                <span>Tasks: {workflow.tasks?.length || 0}</span>
                <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(workflow.status)}
              <span className="text-sm text-text-secondary capitalize">
                {workflow.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onVisualize}
              className="p-2 text-text-secondary hover:text-electric-cyan transition-colors duration-200"
              title="Visualize Workflow"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onExecute}
              className="p-2 text-text-secondary hover:text-neon-green transition-colors duration-200"
              title="Execute Workflow"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-text-secondary hover:text-amber transition-colors duration-200"
              title="Edit Workflow"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 text-text-secondary hover:text-coral-red transition-colors duration-200"
              title="Duplicate Workflow"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-text-secondary hover:text-coral-red transition-colors duration-200"
              title="Delete Workflow"
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
      className={`group glass-panel border-2 transition-all duration-300 ${getStatusColor(workflow.status)}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-deep-space" />
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {workflow.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {workflow.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon(workflow.status)}
            <span className="text-sm text-text-secondary capitalize">
              {workflow.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Settings className="w-4 h-4" />
            <span>Type: {workflow.workflow_type}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <FileText className="w-4 h-4" />
            <span>Tasks: {workflow.tasks?.length || 0}</span>
          </div>

          {workflow.crew_id && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users className="w-4 h-4" />
              <span>Crew: {workflow.crew_id}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="w-4 h-4" />
            <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onVisualize}
            className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Visualize
          </button>
          <button
            onClick={onExecute}
            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" />
            Execute
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
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-gray-700 hover:text-text-primary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
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

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            workflow.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
            workflow.status === 'running' ? 'bg-amber/20 text-amber' :
            workflow.status === 'failed' ? 'bg-coral-red/20 text-coral-red' :
            'bg-text-muted/20 text-text-muted'
          }`}>
            {workflow.status.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}