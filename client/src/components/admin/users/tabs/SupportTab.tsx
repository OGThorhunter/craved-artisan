import React from 'react';
import { Ticket, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import Card from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface SupportTabProps {
  userId: string;
}

export default function SupportTab({ userId }: SupportTabProps) {
  const mockTickets = [
    {
      id: 't1',
      title: 'Payment processing issue',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 86400000).toISOString()
    }
  ];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'default';
      default: return 'secondary';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'warning';
      case 'IN_PROGRESS': return 'secondary';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'secondary';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Ticket className="w-5 h-5" />
            <span className="text-sm font-medium">Open Tickets</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">SLA Breaches</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </Card>
      </div>
      
      {/* Support Tickets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2b2b2b]">Support Tickets</h2>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#7F232E] text-white rounded-lg hover:bg-[#6b1e27] text-sm">
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="text-center py-12 text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No support tickets</p>
          </div>
        </div>
      </Card>
      
      {/* Linked Incidents */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Linked Incidents</h2>
        
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No linked incidents</p>
        </div>
      </Card>
      
      {/* Canned Responses */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
            <div className="font-medium text-gray-900">Send Account Verification Email</div>
            <div className="text-sm text-gray-500 mt-1">Resend verification link</div>
          </button>
          
          <button className="px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
            <div className="font-medium text-gray-900">Send Password Reset</div>
            <div className="text-sm text-gray-500 mt-1">Allow user to reset password</div>
          </button>
          
          <button className="px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
            <div className="font-medium text-gray-900">Send Welcome Email</div>
            <div className="text-sm text-gray-500 mt-1">Resend welcome message</div>
          </button>
          
          <button className="px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
            <div className="font-medium text-gray-900">Request Documents</div>
            <div className="text-sm text-gray-500 mt-1">Request KYC/compliance docs</div>
          </button>
        </div>
      </Card>
    </div>
  );
}

