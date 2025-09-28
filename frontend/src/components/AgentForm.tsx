'use client';

import { useState } from 'react';
import { 
  User, 
  Settings, 
  Zap, 
  CheckCircle,
  ChevronRight,
  Plus,
  X,
  Search
} from 'lucide-react';

interface AgentFormProps {
  currentStep: number;
  agentData: any;
  models: any[];
  validationErrors: Record<string, string>;
  onUpdate: (field: string, value: any) => void;
}

const availableTools = [
  { id: 'serper_dev', name: 'Web Search', description: 'Search the web for information', category: 'research' },
  { id: 'scrape_website', name: 'Web Scraper', description: 'Extract content from websites', category: 'research' },
  { id: 'file_read', name: 'File Reader', description: 'Read and process files', category: 'utility' },
  { id: 'file_write', name: 'File Writer', description: 'Create and write files', category: 'utility' },
  { id: 'calculator', name: 'Calculator', description: 'Perform mathematical calculations', category: 'utility' },
  { id: 'code_interpreter', name: 'Code Interpreter', description: 'Execute code snippets', category: 'development' },
];

export function AgentForm({ 
  currentStep, 
  agentData, 
  models, 
  validationErrors, 
  onUpdate 
}: AgentFormProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
              Basic Agent Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agentData.name}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-charcoal border rounded-lg text-text-primary placeholder-text-muted focus:outline-none ${
                    validationErrors.name ? 'border-coral-red' : 'border-gray-700 focus:border-electric-cyan'
                  }`}
                  placeholder="Enter a unique name for your agent"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-coral-red">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={agentData.role}
                  onChange={(e) => onUpdate('role', e.target.value)}
                  className={`w-full px-4 py-3 bg-charcoal border rounded-lg text-text-primary placeholder-text-muted focus:outline-none ${
                    validationErrors.role ? 'border-coral-red' : 'border-gray-700 focus:border-electric-cyan'
                  }`}
                  placeholder="e.g., Senior Research Analyst, Creative Writer"
                />
                {validationErrors.role && (
                  <p className="mt-1 text-sm text-coral-red">{validationErrors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Goal *
                </label>
                <textarea
                  value={agentData.goal}
                  onChange={(e) => onUpdate('goal', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 bg-charcoal border rounded-lg text-text-primary placeholder-text-muted focus:outline-none resize-none ${
                    validationErrors.goal ? 'border-coral-red' : 'border-gray-700 focus:border-electric-cyan'
                  }`}
                  placeholder="Describe what this agent aims to accomplish"
                />
                {validationErrors.goal && (
                  <p className="mt-1 text-sm text-coral-red">{validationErrors.goal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Backstory *
                </label>
                <textarea
                  value={agentData.backstory}
                  onChange={(e) => onUpdate('backstory', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-charcoal border rounded-lg text-text-primary placeholder-text-muted focus:outline-none resize-none ${
                    validationErrors.backstory ? 'border-coral-red' : 'border-gray-700 focus:border-electric-cyan'
                  }`}
                  placeholder="Provide context and personality traits for the agent"
                />
                {validationErrors.backstory && (
                  <p className="mt-1 text-sm text-coral-red">{validationErrors.backstory}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1: // Configuration
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
              Agent Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  AI Model *
                </label>
                <select
                  value={agentData.model_name}
                  onChange={(e) => onUpdate('model_name', e.target.value)}
                  className={`w-full px-4 py-3 bg-charcoal border rounded-lg text-text-primary focus:outline-none ${
                    validationErrors.model_name ? 'border-coral-red' : 'border-gray-700 focus:border-electric-cyan'
                  }`}
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.id})
                    </option>
                  ))}
                </select>
                {validationErrors.model_name && (
                  <p className="mt-1 text-sm text-coral-red">{validationErrors.model_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Agent Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['worker', 'manager', 'researcher'].map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdate('agent_type', type)}
                      className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                        agentData.agent_type === type
                          ? 'border-electric-cyan bg-electric-cyan/10'
                          : 'border-gray-700 hover:border-electric-cyan/50'
                      }`}
                    >
                      <div className="font-medium text-text-primary capitalize mb-1">
                        {type}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {type === 'worker' && 'Executes specific tasks and operations'}
                        {type === 'manager' && 'Coordinates and delegates to other agents'}
                        {type === 'researcher' && 'Gathers and analyzes information'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Max Iterations
                  </label>
                  <input
                    type="number"
                    value={agentData.config.max_iterations}
                    onChange={(e) => onUpdate('config', { ...agentData.config, max_iterations: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-charcoal border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-electric-cyan"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Max Execution Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={agentData.config.max_execution_time}
                    onChange={(e) => onUpdate('config', { ...agentData.config, max_execution_time: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-charcoal border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-electric-cyan"
                    min="30"
                    max="3600"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agentData.config.verbose}
                    onChange={(e) => onUpdate('config', { ...agentData.config, verbose: e.target.checked })}
                    className="w-4 h-4 text-electric-cyan bg-charcoal border-gray-700 rounded focus:ring-electric-cyan"
                  />
                  <span className="text-text-primary">Enable verbose logging</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agentData.config.allow_delegation}
                    onChange={(e) => onUpdate('config', { ...agentData.config, allow_delegation: e.target.checked })}
                    className="w-4 h-4 text-electric-cyan bg-charcoal border-gray-700 rounded focus:ring-electric-cyan"
                  />
                  <span className="text-text-primary">Allow task delegation (Manager agents only)</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 2: // Tools
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
              Agent Tools
            </h2>
            
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-charcoal border border-gray-700 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-electric-cyan"
                />
              </div>
              
              <p className="text-sm text-text-secondary">
                Select the tools your agent will use to accomplish tasks. Start with essential tools and add more as needed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => {
                const isSelected = agentData.tools.some((t: any) => t.id === tool.id);
                
                return (
                  <div
                    key={tool.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-gray-700 hover:border-electric-cyan/50'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        onUpdate('tools', agentData.tools.filter((t: any) => t.id !== tool.id));
                      } else {
                        onUpdate('tools', [...agentData.tools, tool]);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-electric-cyan" />
                        <h4 className="font-medium text-text-primary">{tool.name}</h4>
                      </div>
                      
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      )}
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-2">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-charcoal text-xs text-text-secondary rounded">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {agentData.tools.length > 0 && (
              <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <h4 className="font-medium text-neon-green mb-2">
                  Selected Tools ({agentData.tools.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {agentData.tools.map((tool: any) => (
                    <span
                      key={tool.id}
                      className="px-3 py-1 bg-charcoal text-sm text-text-primary rounded-full flex items-center gap-2"
                    >
                      {tool.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate('tools', agentData.tools.filter((t: any) => t.id !== tool.id));
                        }}
                        className="text-text-muted hover:text-coral-red"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
              Review Agent Configuration
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-charcoal rounded-lg">
                <h3 className="font-semibold text-text-primary mb-3">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Name:</span>
                    <span className="text-text-primary">{agentData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Role:</span>
                    <span className="text-text-primary">{agentData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary capitalize">{agentData.agent_type}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-charcoal rounded-lg">
                <h3 className="font-semibold text-text-primary mb-3">Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Model:</span>
                    <span className="text-text-primary">{agentData.model_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Max Iterations:</span>
                    <span className="text-text-primary">{agentData.config.max_iterations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Max Execution Time:</span>
                    <span className="text-text-primary">{agentData.config.max_execution_time}s</span>
                  </div>
                </div>
              </div>

              {agentData.tools.length > 0 && (
                <div className="p-4 bg-charcoal rounded-lg">
                  <h3 className="font-semibold text-text-primary mb-3">
                    Selected Tools ({agentData.tools.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {agentData.tools.map((tool: any) => (
                      <div key={tool.id} className="text-sm text-text-secondary">
                        • {tool.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <h3 className="font-semibold text-neon-green">Ready to Create</h3>
                </div>
                <p className="text-sm text-text-secondary">
                  Your agent configuration is complete. Click "Create Agent" to bring your AI agent to life.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[600px]">
      {renderStepContent()}
    </div>
  );
}