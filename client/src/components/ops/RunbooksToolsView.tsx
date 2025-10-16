import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BookOpen, Wrench, DollarSign, BarChart3, Mail, Search, FileText, Play } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import ConfirmActionDialog from './ConfirmActionDialog';

export default function RunbooksToolsView() {
  const [selectedTool, setSelectedTool] = useState<{
    open: boolean;
    tool: string;
    title: string;
    description: string;
  }>({ open: false, tool: '', title: '', description: '' });

  const [toolResult, setToolResult] = useState<any>(null);

  const { data: runbooks } = useQuery({
    queryKey: ['admin', 'ops', 'runbooks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/runbooks');
      if (!response.ok) throw new Error('Failed to fetch runbooks');
      const result = await response.json();
      return result.data;
    }
  });

  const toolMutation = useMutation({
    mutationFn: async ({ tool, params }: { tool: string; params?: any }) => {
      const response = await fetch(`/api/admin/ops/tools/${tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      });
      if (!response.ok) throw new Error('Failed to execute tool');
      return response.json();
    },
    onSuccess: (data) => {
      setToolResult(data.data);
      setSelectedTool({ open: false, tool: '', title: '', description: '' });
    }
  });

  const tools = [
    {
      id: 'rebuild-revenue',
      title: 'Rebuild Revenue Snapshots',
      description: 'Recalculate revenue snapshots for the last 30 days',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'recompute-metrics',
      title: 'Recompute Vendor Metrics',
      description: 'Recalculate vendor performance metrics for the last 24 hours',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'resend-verifications',
      title: 'Resend Verification Emails',
      description: 'Queue verification emails for unverified users',
      icon: Mail,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'reindex-products',
      title: 'Reindex Products/Vendors',
      description: 'Rebuild search index for all products and vendors',
      icon: Search,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'test-sar',
      title: 'Test SAR Export',
      description: 'Trigger a Subject Access Request export for testing',
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    setToolResult(null);
    setSelectedTool({
      open: true,
      tool: tool.id,
      title: tool.title,
      description: tool.description
    });
  };

  const confirmToolExecution = () => {
    toolMutation.mutate({ tool: selectedTool.tool });
  };

  return (
    <div className="space-y-6">
      {/* On-Call Rota */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">On-Call Rota</h3>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#4b4b4b]">Current On-Call</p>
              <p className="text-lg font-medium text-[#2b2b2b] mt-1">Not configured</p>
            </div>
            <Button variant="secondary">Configure</Button>
          </div>
        </Card>
      </div>

      {/* Runbooks */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Operational Runbooks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {runbooks?.map((runbook: any) => (
            <Card key={runbook.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-[#4b4b4b] mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-[#2b2b2b]">{runbook.title}</h4>
                  <Badge variant="secondary" className="mt-2">{runbook.incidentType}</Badge>
                  <p className="text-sm text-[#4b4b4b] mt-2 line-clamp-2">
                    {runbook.content.substring(0, 100)}...
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {(!runbooks || runbooks.length === 0) && (
            <Card className="p-8 text-center col-span-2">
              <BookOpen className="h-12 w-12 text-[#4b4b4b] mx-auto mb-3" />
              <p className="text-[#4b4b4b]">No runbooks configured</p>
            </Card>
          )}
        </div>
      </div>

      {/* One-Click Tools */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">One-Click Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${tool.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2b2b2b]">{tool.title}</h4>
                    <p className="text-sm text-[#4b4b4b] mt-1">{tool.description}</p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => handleToolClick(tool)}
                  disabled={toolMutation.isPending}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tool Result */}
      {toolResult && (
        <div>
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Last Execution Result</h3>
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={toolResult.success ? 'success' : 'destructive'}>
                  {toolResult.success ? 'Success' : 'Failed'}
                </Badge>
                <span className="text-sm text-[#4b4b4b]">
                  Duration: {toolResult.duration}ms
                </span>
              </div>

              <p className="text-sm text-[#2b2b2b]">{toolResult.message}</p>

              {toolResult.details && (
                <div className="pt-3 border-t border-[#7F232E]/10">
                  <p className="text-xs text-[#4b4b4b] mb-2">Details:</p>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(toolResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tool Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={selectedTool.open}
        onClose={() => setSelectedTool({ open: false, tool: '', title: '', description: '' })}
        onConfirm={confirmToolExecution}
        title={selectedTool.title}
        description={selectedTool.description + ' This may take several minutes to complete.'}
        actionLabel="Execute Tool"
        requireReason={false}
        isDangerous={false}
        isLoading={toolMutation.isPending}
      />
    </div>
  );
}

