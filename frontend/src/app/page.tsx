'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Brain, 
  Users, 
  Activity, 
  ChevronRight,
  Play,
  Settings,
  BarChart3
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { FeatureCard } from '@/components/FeatureCard';
import { StatsSection } from '@/components/StatsSection';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'Cerebras AI Integration',
      description: 'Harness lightning-fast inference with Cerebras industry-leading AI models for optimal agent performance.',
      color: 'from-electric-cyan to-neon-green',
    },
    {
      icon: Users,
      title: 'Multi-Agent Orchestration',
      description: 'Coordinate teams of specialized AI agents working together seamlessly on complex tasks and workflows.',
      color: 'from-neon-green to-amber',
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Monitor agent activities, track performance metrics, and visualize workflows in real-time.',
      color: 'from-amber to-coral-red',
    },
    {
      icon: Settings,
      title: 'Visual Workflow Designer',
      description: 'Create and customize agent workflows with an intuitive drag-and-drop interface.',
      color: 'from-coral-red to-electric-cyan',
    },
  ];

  const stats = [
    { label: 'Active Agents', value: '1,247', icon: Users },
    { label: 'Workflows Executed', value: '15,892', icon: Play },
    { label: 'Success Rate', value: '98.7%', icon: BarChart3 },
    { label: 'Avg Response Time', value: '0.3s', icon: Zap },
  ];

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-deep-space">
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection
        title="CrewNexus"
        subtitle="Multi-Agent Orchestration Platform"
        description="Build, manage, and monitor AI agent workflows with CrewAI and Cerebras AI integration. Experience lightning-fast inference and seamless multi-agent collaboration."
        onGetStarted={handleGetStarted}
        isLoading={isLoading}
      />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-electric-cyan to-neon-green bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Everything you need to build sophisticated AI agent workflows with enterprise-grade reliability and performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradientColor={feature.color}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <StatsSection stats={stats} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-12"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of developers building the next generation of AI-powered applications with CrewNexus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-6 h-6"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Get Started Now
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/docs')}
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                View Documentation
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}