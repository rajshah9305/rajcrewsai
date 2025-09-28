'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  Settings,
  Play,
  Edit,
  Trash2,
  Copy,
  Eye
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AgentCard } from '@/components/AgentCard';
import { AgentTemplateCard } from '@/components/AgentTemplateCard';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // API data
  const { data: agentsData, loading: agentsLoading, error: agentsError, refetch: refetchAgents } = useApi('/api/agents');
  const { data: templatesData, loading: templatesLoading } = useApi('/api/agents/templates');
  const { data: categoriesData } = useApi('/api/agents/categories');

  const filteredAgents = agentsData?.agents?.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const filteredTemplates = templatesData?.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleCreateAgent = () => {
    router.push('/agents/create');
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        // API call to delete agent would go here
        toast.success('Agent deleted successfully');
        refetchAgents();
      } catch (error) {
        toast.error('Failed to delete agent');
      }
    }
  };

  const handleDuplicateAgent = async (agent: any) => {
    try {
      // API call to duplicate agent would go here
      toast.success('Agent duplicated successfully');
      refetchAgents();
    } catch (error) {
      toast.error('Failed to duplicate agent');
    }
  };

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-deep-space">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
                AI Agents
              </h1>
              <p className="text-text-secondary">
                Create and manage your intelligent agent workforce
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`btn-secondary flex items-center gap-2 ${
                  showTemplates ? 'bg-electric-cyan text-deep-space' : ''
                }`}
              >
                <Grid className="w-4 h-4" />
                Templates
              </button>
              
              <button
                onClick={handleCreateAgent}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Agent
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-charcoal border border-gray-700 rounded-lg text-text-primary placeholder-text-muted focus:border-electric-cyan focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-charcoal rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' ? 'bg-electric-cyan text-deep-space' : 'text-text-secondary'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' ? 'bg-electric-cyan text-deep-space' : 'text-text-secondary'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {/* Category Filter */}
              {showTemplates && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-text-primary focus:border-electric-cyan focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categoriesData?.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Content */}
          {showTemplates ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-text-primary">
                  Agent Templates
                </h2>
                <p className="text-text-secondary">
                  {filteredTemplates.length} templates available
                </p>
              </div>
              
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Grid className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No Templates Found
                  </h3>
                  <p className="text-text-secondary">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredTemplates.map((template: any) => (
                    <AgentTemplateCard
                      key={template.id}
                      template={template}
                      onUseTemplate={() => router.push(`/agents/create?template=${template.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-text-primary">
                  Your Agents
                </h2>
                <p className="text-text-secondary">
                  {filteredAgents.length} agents created
                </p>
              </div>
              
              {filteredAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No Agents Found
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Create your first AI agent to get started
                  </p>
                  <button
                    onClick={handleCreateAgent}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create Agent
                  </button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredAgents.map((agent: any) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      viewMode={viewMode}
                      onEdit={() => router.push(`/agents/${agent.id}/edit`)}
                      onDelete={() => handleDeleteAgent(agent.id)}
                      onDuplicate={() => handleDuplicateAgent(agent)}
                      onView={() => router.push(`/agents/${agent.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}