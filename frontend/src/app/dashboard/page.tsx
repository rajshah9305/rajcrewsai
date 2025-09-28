'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Users, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Square,
  RefreshCw,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { DashboardCard } from '@/components/DashboardCard';
import { WorkflowStatus } from '@/components/WorkflowStatus';
import { AgentStatus } from '@/components/AgentStatus';
import { PerformanceChart } from '@/components/PerformanceChart';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useApi } from '@/hooks/useApi';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // WebSocket for real-time updates
  const { data: wsData, isConnected } = useWebSocket('ws://localhost:8000/ws/monitoring');
  
  // API data
  const { data: dashboardData, loading, error, refetch } = useApi('/api/monitoring/dashboard');
  const { data: performanceData } = useApi('/api/monitoring/performance');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'monitoring', label: 'Monitoring', icon: Settings },
  ];

  const quickActions = [
    { 
      name: 'Create Agent', 
      icon: Users, 
      action: () => router.push('/agents/create'),
      color: 'from-electric-cyan to-neon-green'
    },
    { 
      name: 'New Workflow', 
      icon: Zap, 
      action: () => router.push('/workflows/create'),
      color: 'from-neon-green to-amber'
    },
    { 
      name: 'View Analytics', 
      icon: BarChart3, 
      action: () => router.push('/monitoring'),
      color: 'from-amber to-coral-red'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-deep-space">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-16 h-16 text-coral-red mb-4" />
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Error Loading Dashboard</h2>
          <p className="text-text-secondary mb-6">{error.message}</p>
          <button 
            onClick={handleRefresh}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navigation />
      
      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
                Dashboard
              </h1>
              <p className="text-text-secondary">
                Monitor and manage your AI agent workflows
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-coral-red'} animate-pulse`}></div>
                <span className="text-sm text-text-secondary">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <button
                onClick={handleRefresh}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className="glass-panel p-4 text-left group hover:border-electric-cyan/30 transition-all duration-300"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-deep-space" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {action.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Get started quickly
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-electric-cyan text-deep-space'
                      : 'bg-charcoal text-text-secondary hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title="Active Agents"
                  value={dashboardData?.performance_summary?.total_agents || 0}
                  icon={Users}
                  color="from-electric-cyan to-neon-green"
                  trend={12}
                />
                <DashboardCard
                  title="Running Workflows"
                  value={dashboardData?.performance_summary?.active_workflows || 0}
                  icon={Activity}
                  color="from-neon-green to-amber"
                  trend={-5}
                />
                <DashboardCard
                  title="Success Rate"
                  value={`${dashboardData?.performance_summary?.success_rate || 0}%`}
                  icon={CheckCircle}
                  color="from-amber to-coral-red"
                  trend={8}
                />
                <DashboardCard
                  title="Total Executions"
                  value={dashboardData?.performance_summary?.total_executions || 0}
                  icon={Zap}
                  color="from-coral-red to-electric-cyan"
                  trend={15}
                />
              </div>

              {/* Performance Chart */}
              <div className="glass-panel p-6">
                <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                  Performance Overview
                </h2>
                <PerformanceChart data={performanceData} />
              </div>

              {/* Recent Activity */}
              <div className="glass-panel p-6">
                <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {dashboardData?.recent_executions?.slice(0, 5).map((execution: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-charcoal rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          execution.status === 'completed' ? 'bg-neon-green' :
                          execution.status === 'failed' ? 'bg-coral-red' :
                          'bg-amber'
                        }`}></div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {execution.task_name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {new Date(execution.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {execution.execution_time}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-text-primary">
                  Active Agents
                </h2>
                <button
                  onClick={() => router.push('/agents/create')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Create Agent
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.active_agents?.map((agent: any) => (
                  <AgentStatus key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-text-primary">
                  Active Workflows
                </h2>
                <button
                  onClick={() => router.push('/workflows/create')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Create Workflow
                </button>
              </div>
              
              <div className="space-y-4">
                {dashboardData?.active_workflows?.map((workflow: any) => (
                  <WorkflowStatus key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-text-primary">
                System Monitoring
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    System Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">CPU Usage</span>
                      <span className="text-text-primary">{performanceData?.system?.cpu_usage || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Memory Usage</span>
                      <span className="text-text-primary">{performanceData?.system?.memory_usage || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Disk Usage</span>
                      <span className="text-text-primary">{performanceData?.system?.disk_usage || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Queue Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Active Workflows</span>
                      <span className="text-text-primary">{performanceData?.system?.active_workflows || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Queue Size</span>
                      <span className="text-text-primary">{performanceData?.system?.queue_size || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Total Agents</span>
                      <span className="text-text-primary">{performanceData?.system?.total_agents || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}