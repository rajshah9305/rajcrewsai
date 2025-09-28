'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
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
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  X
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { WorkflowCard } from '@/components/WorkflowCard';
import { WorkflowVisualization } from '@/components/WorkflowVisualization';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showVisualization, setShowVisualization] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  
  // API data
  const { data: workflowsData, loading: workflowsLoading, error: workflowsError, refetch: refetchWorkflows } = useApi('/api/workflows');
  const { data: crewsData } = useApi('/api/crews');

  const filteredWorkflows = workflowsData?.workflows?.filter((workflow: any) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || workflow.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateWorkflow = () => {
    router.push('/workflows/create');
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        // API call to delete workflow would go here
        toast.success('Workflow deleted successfully');
        refetchWorkflows();
      } catch (error) {
        toast.error('Failed to delete workflow');
      }
    }
  };

  const handleDuplicateWorkflow = async (workflow: any) => {
    try {
      // API call to duplicate workflow would go here
      toast.success('Workflow duplicated successfully');
      refetchWorkflows();
    } catch (error) {
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleViewVisualization = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setShowVisualization(true);
  };

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

  if (workflowsLoading) {
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
                AI Workflows
              </h1>
              <p className="text-text-secondary">
                Orchestrate complex tasks with multi-agent workflows
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className={`btn-secondary flex items-center gap-2 ${
                  showVisualization ? 'bg-electric-cyan text-deep-space' : ''
                }`}
              >
                <Settings className="w-4 h-4" />
                Visualize
              </button>
              
              <button
                onClick={handleCreateWorkflow}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search workflows..."
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
              
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-text-primary focus:border-electric-cyan focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Workflow Visualization Modal */}
          {showVisualization && selectedWorkflow && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel max-w-6xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-text-primary">
                    Workflow Visualization
                  </h2>
                  <button
                    onClick={() => {
                      setShowVisualization(false);
                      setSelectedWorkflow(null);
                    }}
                    className="text-text-secondary hover:text-electric-cyan"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <WorkflowVisualization workflow={selectedWorkflow} />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-text-primary">
                {showVisualization ? 'Workflow Visualization' : 'Your Workflows'}
              </h2>
              <p className="text-text-secondary">
                {filteredWorkflows.length} workflows
              </p>
            </div>
            
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No Workflows Found
                </h3>
                <p className="text-text-secondary mb-6">
                  {searchQuery || selectedStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first workflow to get started'}
                </p>
                <button
                  onClick={handleCreateWorkflow}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredWorkflows.map((workflow: any) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    viewMode={viewMode}
                    onEdit={() => router.push(`/workflows/${workflow.id}/edit`)}
                    onDelete={() => handleDeleteWorkflow(workflow.id)}
                    onDuplicate={() => handleDuplicateWorkflow(workflow)}
                    onExecute={() => router.push(`/workflows/${workflow.id}/execute`)}
                    onVisualize={() => handleViewVisualization(workflow)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}