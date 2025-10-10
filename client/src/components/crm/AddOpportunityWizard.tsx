import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Briefcase,
  Target
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface OpportunityWizardData {
  customerId?: string;
  title?: string;
  description?: string;
  stage?: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value?: number;
  probability?: number;
  expectedCloseDate?: string;
  source?: string;
  assignedTo?: string;
  tags?: string[];
  status?: 'active' | 'on_hold' | 'cancelled';
}

interface AddOpportunityWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (opportunityData: OpportunityWizardData) => void;
  customers?: Array<{ id: string; firstName: string; lastName: string; email: string; company?: string }>;
}

type WizardStep = 'welcome' | 'customer' | 'details' | 'value' | 'review';

const AddOpportunityWizard: React.FC<AddOpportunityWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  customers = []
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [opportunityData, setOpportunityData] = useState<OpportunityWizardData>({
    stage: 'lead',
    probability: 10,
    status: 'active',
    tags: []
  });

  const handleStepNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('customer');
        break;
      case 'customer':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('value');
        break;
      case 'value':
        setCurrentStep('review');
        break;
      case 'review':
        onComplete(opportunityData);
        handleReset();
        onClose();
        break;
      default:
        break;
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'customer':
        setCurrentStep('welcome');
        break;
      case 'details':
        setCurrentStep('customer');
        break;
      case 'value':
        setCurrentStep('details');
        break;
      case 'review':
        setCurrentStep('value');
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setCurrentStep('welcome');
    setOpportunityData({
      stage: 'lead',
      probability: 10,
      status: 'active',
      tags: []
    });
  };

  const updateOpportunityData = (field: keyof OpportunityWizardData, value: string | number | string[] | undefined) => {
    setOpportunityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStepProgress = () => {
    const steps = ['welcome', 'customer', 'details', 'value', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === opportunityData.customerId);
  };

  const calculateExpectedRevenue = () => {
    const value = opportunityData.value || 0;
    const probability = opportunityData.probability || 0;
    return (value * probability) / 100;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add Opportunity Wizard</h2>
              <p className="text-white/90 mt-1">Let's create your next big opportunity</p>
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="text-white/80 hover:text-white transition-colors"
              title="Close wizard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Progress */}
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-purple-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="bg-purple-100 p-6 rounded-full">
                    <Briefcase className="w-16 h-16 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Welcome to Opportunity Creation!</h3>
                <p className="text-lg text-gray-700 max-w-prose mx-auto">
                  An opportunity represents a potential sale or deal. Let's capture the details and track it through your sales pipeline!
                </p>
                <Button onClick={handleStepNext} className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-full">
                  Let's Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {currentStep === 'customer' && (
              <motion.div
                key="customer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Who is this opportunity for?</h3>
                <p className="text-gray-600 text-center">Select a customer from your CRM or you can add a new customer later</p>
                
                <div>
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <select
                    id="customerId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={opportunityData.customerId || ''}
                    onChange={(e) => updateOpportunityData('customerId', e.target.value)}
                    title="Select customer"
                  >
                    <option value="">Select a customer...</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} {customer.company ? `(${customer.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {opportunityData.customerId && getSelectedCustomer() && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          {getSelectedCustomer()?.firstName} {getSelectedCustomer()?.lastName}
                        </h4>
                        <p className="text-sm text-blue-700">{getSelectedCustomer()?.email}</p>
                        {getSelectedCustomer()?.company && (
                          <p className="text-sm text-blue-600">{getSelectedCustomer()?.company}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {currentStep === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Opportunity Details</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Opportunity Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.title || ''}
                      onChange={(e) => updateOpportunityData('title', e.target.value)}
                      placeholder="e.g., Q1 2024 Product Order"
                      title="Opportunity Title"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.description || ''}
                      onChange={(e) => updateOpportunityData('description', e.target.value)}
                      placeholder="Brief description of this opportunity"
                      title="Description"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Stage *
                    </label>
                    <select
                      id="stage"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.stage || 'lead'}
                      onChange={(e) => updateOpportunityData('stage', e.target.value)}
                      title="Opportunity Stage"
                    >
                      <option value="lead">Lead</option>
                      <option value="qualification">Qualification</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      id="source"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.source || ''}
                      onChange={(e) => updateOpportunityData('source', e.target.value)}
                      placeholder="e.g., Website, Referral, Cold Call"
                      title="Source"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'value' && (
              <motion.div
                key="value"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center">Value & Timeline</h3>
                <p className="text-gray-600 text-center">
                  Estimate the deal value and likelihood of closing
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Value ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="value"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={opportunityData.value || ''}
                        onChange={(e) => updateOpportunityData('value', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        title="Deal Value"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-2">
                      Probability (%) *
                    </label>
                    <input
                      type="number"
                      id="probability"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.probability || 10}
                      onChange={(e) => updateOpportunityData('probability', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder="10"
                      min="0"
                      max="100"
                      title="Probability"
                    />
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${opportunityData.probability || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Close Date *
                    </label>
                    <input
                      type="date"
                      id="expectedCloseDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.expectedCloseDate || ''}
                      onChange={(e) => updateOpportunityData('expectedCloseDate', e.target.value)}
                      title="Expected Close Date"
                    />
                  </div>

                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      id="assignedTo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={opportunityData.assignedTo || ''}
                      onChange={(e) => updateOpportunityData('assignedTo', e.target.value)}
                      placeholder="Sales Rep Name"
                      title="Assigned To"
                    />
                  </div>
                </div>

                <Card className="p-6 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Expected Revenue
                  </h4>
                  <div className="text-3xl font-bold text-green-700">
                    ${calculateExpectedRevenue().toFixed(2)}
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Based on {opportunityData.probability || 0}% probability of ${(opportunityData.value || 0).toFixed(2)} deal
                  </p>
                </Card>
              </motion.div>
            )}

            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="bg-green-100 p-6 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-green-600">Great! Your Opportunity is Ready!</h3>
                <p className="text-lg text-gray-700 max-w-prose mx-auto">
                  Review the details below and click "Create Opportunity" to add it to your pipeline!
                </p>

                <Card className="p-6 bg-gray-50 border border-gray-200 text-left space-y-3">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                    Opportunity Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">Title:</span>
                      <p className="text-gray-700">{opportunityData.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Customer:</span>
                      <p className="text-gray-700">
                        {getSelectedCustomer() ? 
                          `${getSelectedCustomer()?.firstName} ${getSelectedCustomer()?.lastName}` : 
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Stage:</span>
                      <p className="text-gray-700 capitalize">{opportunityData.stage?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Deal Value:</span>
                      <p className="text-gray-700">${(opportunityData.value || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Probability:</span>
                      <p className="text-gray-700">{opportunityData.probability || 0}%</p>
                    </div>
                    <div>
                      <span className="font-semibold">Expected Revenue:</span>
                      <p className="text-green-600 font-bold">${calculateExpectedRevenue().toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Expected Close:</span>
                      <p className="text-gray-700">
                        {opportunityData.expectedCloseDate ? 
                          new Date(opportunityData.expectedCloseDate).toLocaleDateString() : 
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Source:</span>
                      <p className="text-gray-700">{opportunityData.source || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
            {currentStep !== 'welcome' && (
              <Button
                variant="secondary"
                onClick={handleStepBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {currentStep === 'review' ? (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white ml-auto"
              >
                <CheckCircle className="w-4 h-4" /> Create Opportunity
              </Button>
            ) : (
              <Button
                onClick={handleStepNext}
                className="flex items-center gap-2 ml-auto"
                disabled={
                  (currentStep === 'customer' && !opportunityData.customerId) ||
                  (currentStep === 'details' && !opportunityData.title) ||
                  (currentStep === 'value' && (!opportunityData.value || !opportunityData.expectedCloseDate))
                }
              >
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddOpportunityWizard;

