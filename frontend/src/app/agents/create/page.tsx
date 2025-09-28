'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Settings, 
  Save, 
  RotateCcw,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AgentForm } from '@/components/AgentForm';
import { AgentPreview } from '@/components/AgentPreview';
import { useApi } from '@/hooks/useApi';
import { useMutation } from '@/hooks/useApi';
import toast from 'react-hot-toast';

interface AgentFormData {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  agent_type: 'worker' | 'manager' | 'researcher';
  model_name: string;
  tools: any[];
  config: any;
}

const defaultAgentData: AgentFormData = {
  name: '',
  role: '',
  goal: '',
  backstory: '',
  agent_type: 'worker',
  model_name: 'llama-4-scout-17b-16e-instruct',
  tools: [],
  config: {
    max_iterations: 5,
    max_execution_time: 300,
    verbose: true,
    allow_delegation: false,
  },
};

export default function CreateAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [agentData, setAgentData] = useState<AgentFormData>(defaultAgentData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch available models
  const { data: modelsData } = useApi('/api/models');
  
  // Fetch template if specified
  const { data: templateData } = useApi(
    templateId ? `/api/agents/templates/${templateId}` : null
  );

  // Create agent mutation
  const { mutate: createAgent, loading: isCreating } = useMutation('post', '/api/agents');

  // Load template data
  useEffect(() => {
    if (templateData) {
      setAgentData({
        ...defaultAgentData,
        name: `${templateData.name} (Copy)`,
        role: templateData.role,
        goal: templateData.goal_template,
        backstory: templateData.backstory_template,
        agent_type: templateData.agent_type,
        model_name: templateData.suggested_model,
        tools: templateData.suggested_tools || [],
      });
    }
  }, [templateData]);

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: User },
    { id: 'configuration', title: 'Configuration', icon: Settings },
    { id: 'tools', title: 'Tools', icon: Zap },
    { id: 'review', title: 'Review', icon: CheckCircle },
  ];

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 0) {
      if (!agentData.name.trim()) errors.name = 'Name is required';
      if (!agentData.role.trim()) errors.role = 'Role is required';
      if (!agentData.goal.trim()) errors.goal = 'Goal is required';
      if (!agentData.backstory.trim()) errors.backstory = 'Backstory is required';
    }
    
    if (step === 1) {
      if (!agentData.model_name) errors.model_name = 'Model is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Please fix the validation errors');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAgent = async () => {
    if (!validateStep(steps.length - 1)) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const result = await createAgent(agentData);
      toast.success('Agent created successfully!');
      router.push(`/agents/${result.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create agent');
    }
  };

  const handleReset = () => {
    setAgentData(defaultAgentData);
    setCurrentStep(0);
    setValidationErrors({});
  };

  const updateAgentData = (field: keyof AgentFormData, value: any) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-deep-space">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
                {templateId ? 'Create Agent from Template' : 'Create New Agent'}
              </h1>
              <p className="text-text-secondary">
                Configure your AI agent with specific roles, goals, and capabilities
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`btn-secondary flex items-center gap-2 ${
                  isPreviewMode ? 'bg-electric-cyan text-deep-space' : ''
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isClickable = index <= currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => isClickable && setCurrentStep(index)}
                      disabled={!isClickable}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-electric-cyan text-deep-space'
                          : isCompleted
                          ? 'bg-neon-green text-deep-space'
                          : 'bg-charcoal text-text-secondary hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {step.title}
                    </button>

                    {index < steps.length - 1 && (
                      <ChevronRight className={`w-5 h-5 mx-2 ${
                        isCompleted ? 'text-neon-green' : 'text-text-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="glass-panel p-6">
                {isPreviewMode ? (
                  <AgentPreview agentData={agentData} />
                ) : (
                  <AgentForm
                    currentStep={currentStep}
                    agentData={agentData}
                    models={modelsData?.models || []}
                    validationErrors={validationErrors}
                    onUpdate={updateAgentData}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className={`btn-secondary flex items-center gap-2 ${
                      currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-4">
                    {currentStep === steps.length - 1 ? (
                      <button
                        onClick={handleSaveAgent}
                        disabled={isCreating}
                        className="btn-primary flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <div className="loading-spinner w-4 h-4"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Create Agent
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextStep}
                        className="btn-primary flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Step Information */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Step {currentStep + 1}: {steps[currentStep].title}
                </h3>
                
                <div className="space-y-4 text-sm text-text-secondary">
                  {currentStep === 0 && (
                    <>
                      <p>Define the basic identity of your AI agent:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Name: A unique identifier for your agent</li>
                        <li>Role: The primary function or expertise area</li>
                        <li>Goal: What the agent aims to accomplish</li>
                        <li>Backstory: Context and personality traits</li>
                      </ul>
                    </>
                  )}
                  
                  {currentStep === 1 && (
                    <>
                      <p>Configure the agent's behavior and capabilities:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>AI Model: Choose from available Cerebras models</li>
                        <li>Agent Type: Worker, Manager, or Researcher</li>
                        <li>Execution Settings: Limits and behavior controls</li>
                      </ul>
                    </>
                  )}
                  
                  {currentStep === 2 && (
                    <>
                      <p>Equip your agent with specialized tools:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Search tools for web research</li>
                        <li>File operations for document handling</li>
                        <li>API integrations for external services</li>
                        <li>Custom tools for specific tasks</li>
                      </ul>
                    </>
                  )}
                  
                  {currentStep === 3 && (
                    <>
                      <p>Review your agent configuration:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Verify all settings are correct</li>
                        <li>Check tool assignments</li>
                        <li>Preview agent behavior</li>
                        <li>Create the agent when ready</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Validation Status */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="glass-panel p-6 border-2 border-coral-red/30 bg-coral-red/10">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-coral-red" />
                    <h3 className="text-lg font-semibold text-coral-red">
                      Validation Errors
                    </h3>
                  </div>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field} className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-coral-red" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Tips */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Quick Tips
                </h3>
                <div className="space-y-3 text-sm text-text-secondary">
                  {currentStep === 0 && (
                    <>
                      <p>• Be specific about the agent's role and goals</p>
                      <p>• The backstory helps shape the agent's personality</p>
                      <p>• Use clear, actionable language</p>
                    </>
                  )}
                  
                  {currentStep === 1 && (
                    <>
                      <p>• Choose models based on your task complexity</p>
                      <p>• Managers can delegate tasks to other agents</p>
                      <p>• Set reasonable execution limits</p>
                    </>
                  )}
                  
                  {currentStep === 2 && (
                    <>
                      <p>• Start with essential tools only</p>
                      <p>• Add tools based on your specific use case</p>
                      <p>• Too many tools can slow down execution</p>
                    </>
                  )}
                  
                  {currentStep === 3 && (
                    <>
                      <p>• Double-check all configurations</p>
                      <p>• Test the agent in a safe environment first</p>
                      <p>• Monitor performance after creation</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}