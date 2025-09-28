'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Settings,
  Play,
  Copy,
  Eye,
  Clock,
  Activity
} from 'lucide-react';
import { useState } from 'react';

interface AgentTemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    role: string;
    agent_type: string;
    category: string;
    suggested_model: string;
    suggested_tools: any[];
    created_at: string;
  };
  onUseTemplate: () => void;
}

export function AgentTemplateCard({ template, onUseTemplate }: AgentTemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'general': 'from-electric-cyan to-neon-green',
      'research': 'from-neon-green to-amber',
      'writing': 'from-amber to-coral-red',
      'analysis': 'from-coral-red to-electric-cyan',
      'coding': 'from-electric-cyan to-amber',
    };
    return colors[category] || 'from-electric-cyan to-neon-green';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group glass-panel border-2 border-transparent hover:border-electric-cyan/30 transition-all duration-300"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(template.category)} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <FileText className="w-6 h-6 text-deep-space" />
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {template.role}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-medium rounded-full">
            {template.category.toUpperCase()}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-text-secondary line-clamp-3">
            {template.description}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Users className="w-4 h-4" />
            <span>Type: {template.agent_type}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Settings className="w-4 h-4" />
            <span>Model: {template.suggested_model}</span>
          </div>

          {template.suggested_tools && template.suggested_tools.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Activity className="w-4 h-4" />
              <span>Tools: {template.suggested_tools.length} included</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onUseTemplate}
            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" />
            Use Template
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary text-sm py-2 px-3"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>

        {/* Created Date */}
        <div className="mt-4 text-xs text-text-muted text-center">
          Created {new Date(template.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-700 px-6 pb-6"
        >
          <div className="pt-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                Template Details
              </h4>
              <div className="text-sm text-text-secondary space-y-1">
                <div><strong>Role:</strong> {template.role}</div>
                <div><strong>Category:</strong> {template.category}</div>
                <div><strong>Recommended Model:</strong> {template.suggested_model}</div>
              </div>
            </div>

            {template.suggested_tools && template.suggested_tools.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">
                  Included Tools
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {template.suggested_tools.map((tool: any, index: number) => (
                    <div key={index} className="bg-charcoal p-2 rounded text-sm text-text-secondary">
                      {tool.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                How to Use
              </h4>
              <p className="text-sm text-text-secondary">
                Click "Use Template" to create a new agent based on this template. 
                You can customize the agent's configuration, tools, and behavior 
                during the creation process.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}