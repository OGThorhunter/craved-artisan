import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  Mail,
  Calendar,
  Target
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  steps: WorkflowStep[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
  successRate: number;
}

interface WorkflowAutomationProps {
  workflows: Workflow[];
  onWorkflowCreate: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'runCount' | 'successRate'>) => void;
  onWorkflowUpdate: (workflow: Workflow) => void;
  onWorkflowDelete: (id: string) => void;
  onWorkflowToggle: (id: string, status: 'active' | 'paused') => void;
  onWorkflowRun: (id: string) => void;
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  workflows,
  onWorkflowCreate,
  onWorkflowUpdate,
  onWorkflowDelete,
  onWorkflowToggle,
  onWorkflowRun
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'new_customer',
    status: 'draft' as const
  });

  const triggerOptions = [
    { value: 'new_customer', label: 'New Customer Registration', icon: Users },
    { value: 'purchase_completed', label: 'Purchase Completed', icon: CheckCircle },
    { value: 'abandoned_cart', label: 'Abandoned Cart', icon: AlertCircle },
    { value: 'email_opened', label: 'Email Opened', icon: Mail },
    { value: 'date_based', label: 'Date-Based Trigger', icon: Calendar },
    { value: 'custom_event', label: 'Custom Event', icon: Zap }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return Pause;
      case 'draft': return Edit;
      default: return Edit;
    }
  };

  const handleCreateWorkflow = () => {
    if (newWorkflow.name.trim()) {
      onWorkflowCreate(newWorkflow);
      setNewWorkflow({ name: '', description: '', trigger: 'new_customer', status: 'draft' });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
          <p className="text-gray-600">Create automated workflows to streamline your CRM processes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Workflow className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Pause className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Paused</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Edit className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Workflows</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => {
            const StatusIcon = getStatusIcon(workflow.status);
            const TriggerIcon = triggerOptions.find(t => t.value === workflow.trigger)?.icon || Zap;
            
            return (
              <div key={workflow.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Workflow className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{workflow.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {workflow.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <TriggerIcon className="h-4 w-4 mr-1" />
                          {triggerOptions.find(t => t.value === workflow.trigger)?.label}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {workflow.runCount} runs
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Target className="h-4 w-4 mr-1" />
                          {workflow.successRate}% success
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onWorkflowRun(workflow.id)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Run Workflow"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onWorkflowToggle(workflow.id, workflow.status === 'active' ? 'paused' : 'active')}
                      className="p-2 text-gray-400 hover:text-yellow-600"
                      title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Edit Workflow"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onWorkflowDelete(workflow.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete Workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter workflow description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trigger</label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;










