'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Zap, 
  Brain,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText
} from 'lucide-react';

interface AgentPreviewProps {
  agentData: {
    name: string;
    role: string;
    goal: string;
    backstory: string;
    agent_type: string;
    model_name: string;
    tools: any[];
    config: {
      max_iterations: number;
      max_execution_time: number;
      verbose: boolean;
      allow_delegation: boolean;
    };
  };
}

export function AgentPreview({ agentData }: AgentPreviewProps) {
  const getStatusIcon = () => {
    return <Activity className="w-5 h-5 text-neon-green animate-pulse" />;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-display font-bold text-text-primary">
        Agent Preview
      </h2>

      {/* Agent Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 border-2 border-neon-green/30 bg-neon-green/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-electric-cyan to-neon-green rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-deep-space" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-text-primary">
                {agentData.name || 'Unnamed Agent'}
              </h3>
              <p className="text-lg text-text-secondary">
                {agentData.role || 'No role specified'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-neon-green font-medium">READY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-display font-bold text-text-primary mb-1">
              {agentData.agent_type.toUpperCase()}
            </div>
            <div className="text-sm text-text-secondary">Agent Type</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-display font-bold text-text-primary mb-1">
              {agentData.tools.length}
            </div>
            <div className="text-sm text-text-secondary">Tools Equipped</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-display font-bold text-text-primary mb-1">
              {formatTime(agentData.config.max_execution_time)}
            </div>
            <div className="text-sm text-text-secondary">Max Runtime</div>
          </div>
        </div>
      </motion.div>

      {/* Agent Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-electric-cyan" />
            Agent Identity
          </h4>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-text-secondary">Role:</span>
              <p className="text-text-primary font-medium">{agentData.role}</p>
            </div>
            
            <div>
              <span className="text-sm text-text-secondary">Goal:</span>
              <p className="text-text-primary">{agentData.goal}</p>
            </div>
            
            <div>
              <span className="text-sm text-text-secondary">Backstory:</span>
              <p className="text-text-primary">{agentData.backstory}</p>
            </div>
          </div>
        </motion.div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6"
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-electric-cyan" />
            Configuration
          </h4>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-text-secondary">AI Model:</span>
              <span className="text-text-primary font-medium">{agentData.model_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Max Iterations:</span>
              <span className="text-text-primary font-medium">{agentData.config.max_iterations}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Verbose Logging:</span>
              <span className="text-text-primary font-medium">
                {agentData.config.verbose ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Task Delegation:</span>
              <span className="text-text-primary font-medium">
                {agentData.config.allow_delegation ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tools */}
      {agentData.tools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-electric-cyan" />
            Equipped Tools ({agentData.tools.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentData.tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-charcoal rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-electric-cyan" />
                  <span className="font-medium text-text-primary">{tool.name}</span>
                </div>
                <p className="text-sm text-text-secondary">{tool.description}</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-gray-700 text-xs text-text-secondary rounded">
                    {tool.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Behavior Simulation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-6"
      >
        <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-electric-cyan" />
          Expected Behavior
        </h4>
        
        <div className="space-y-4 text-sm text-text-secondary">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Task Execution:</span>
              This agent will approach tasks with the role of {agentData.role}, 
              focusing on {agentData.goal.toLowerCase()}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Decision Making:</span>
              Using the {agentData.model_name} model, it will process information and make decisions 
              based on its backstory and configured capabilities
            </div>
          </div>
          
          {agentData.tools.length > 0 && (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
              <div>
                <span className="font-medium text-text-primary">Tool Usage:</span>
                The agent will utilize {agentData.tools.length} specialized tool{agentData.tools.length > 1 ? 's' : ''} 
                to gather information, process data, and execute tasks
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-neon-green mt-0.5" />
            <div>
              <span className="font-medium text-text-primary">Performance:</span>
              Expected to complete tasks within {formatTime(agentData.config.max_execution_time)} 
              with up to {agentData.config.max_iterations} iteration attempts
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel p-6 border-2 border-amber/30 bg-amber/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-amber" />
          <h4 className="text-lg font-semibold text-amber">
            Ready for Deployment
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-text-primary mb-2">Next Steps:</h5>
            <ul className="space-y-1 text-sm text-text-secondary">
              <li>• Review all configurations</li>
              <li>• Test in development environment</li>
              <li>• Monitor initial performance</li>
              <li>• Scale to production workflows</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-text-primary mb-2">Best Practices:</h5>
            <ul className="space-y-1 text-sm text-text-secondary">
              <li>• Start with simple tasks</li>
              <li>• Monitor token usage</li>
              <li>• Iterate based on performance</li>
              <li>• Document successful patterns</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}