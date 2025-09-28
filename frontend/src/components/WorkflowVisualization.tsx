'use client';

import { useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowVisualizationProps {
  workflow: {
    id: string;
    name: string;
    tasks: any[];
    status: string;
    workflow_type: string;
  };
}

export function WorkflowVisualization({ workflow }: WorkflowVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Generate nodes and edges from workflow tasks
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    workflow.tasks.forEach((task, index) => {
      // Create node for each task
      const node: Node = {
        id: `task-${index}`,
        type: 'default',
        position: {
          x: 100 + (index % 3) * 300,
          y: 100 + Math.floor(index / 3) * 200,
        },
        data: {
          label: (
            <div className="p-4 bg-charcoal rounded-lg border border-gray-700 min-w-[200px]">
              <h4 className="font-semibold text-text-primary mb-2">{task.name || `Task ${index + 1}`}</h4>
              <p className="text-sm text-text-secondary mb-2">{task.description}</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'completed' ? 'bg-neon-green' :
                  task.status === 'running' ? 'bg-amber animate-pulse' :
                  task.status === 'failed' ? 'bg-coral-red' :
                  'bg-text-muted'
                }`}></div>
                <span className="text-xs text-text-secondary capitalize">
                  {task.status || 'pending'}
                </span>
              </div>
            </div>
          ),
        },
        style: {
          background: 'transparent',
          border: 'none',
        },
      };

      newNodes.push(node);

      // Create edges between sequential tasks
      if (index > 0) {
        const edge: Edge = {
          id: `edge-${index - 1}-${index}`,
          source: `task-${index - 1}`,
          target: `task-${index}`,
          type: 'smoothstep',
          animated: workflow.workflow_type === 'sequential',
          style: {
            stroke: '#00D4FF',
            strokeWidth: 2,
          },
        };

        newEdges.push(edge);
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow]);

  const onConnect = (params: Connection) => {
    const newEdge: Edge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: 'smoothstep',
      style: {
        stroke: '#00D4FF',
        strokeWidth: 2,
      },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  };

  return (
    <div className="h-[600px] bg-charcoal rounded-lg">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls className="bg-charcoal border-gray-700" />
          <MiniMap className="bg-charcoal" />
          <Background color="#8B9DC3" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}