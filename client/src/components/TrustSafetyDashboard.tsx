import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  User,
  Flag,
  Link,
  BarChart3,
  RefreshCw,
  Ban,
  UserX,
  AlertCircle,
  CheckSquare,
  XSquare,
  ArrowUp,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

interface ModerationItem {
  id: string;
  type: 'product' | 'vendor' | 'review' | 'event' | 'user' | 'content';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  reportedBy?: string;
  reportedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  targetId: string;
  targetType: string;
  targetData: any;
  evidence: ModerationEvidence[];
  actions: ModerationAction[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ModerationEvidence {
  id: string;
  type: 'screenshot' | 'text' | 'url' | 'metadata';
  content: string;
  description?: string;
  submittedBy: string;
  submittedAt: Date;
}

interface ModerationAction {
  id: string;
  type: 'approve' | 'reject' | 'escalate' | 'warn' | 'suspend' | 'ban' | 'remove_content';
  performedBy: string;
  performedAt: Date;
  reason: string;
  details?: any;
  duration?: number;
}

interface AccountLink {
  id: string;
  userId: string;
  linkedUserId: string;
  linkType: 'email' | 'phone' | 'address' | 'payment' | 'device' | 'ip' | 'behavioral';
  confidence: number;
  evidence: string[];
  riskScore: number;
  status: 'active' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

interface TrustSafetyMetrics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: number;
  topViolationTypes: Array<{ type: string; count: number }>;
  accountLinks: {
    total: number;
    highRisk: number;
    investigating: number;
  };
  actions: {
    warnings: number;
    suspensions: number;
    bans: number;
    contentRemovals: number;
  };
}

interface UserRiskProfile {
  userId: string;
  riskScore: number;
  riskFactors: string[];
  accountLinks: AccountLink[];
  moderationHistory: ModerationItem[];
  actions: ModerationAction[];
  kycStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  kybStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  lastRiskAssessment: Date;
}

export default function TrustSafetyDashboard() {
  const [activeTab, setActiveTab] = useState<'moderation' | 'account-links' | 'metrics' | 'users'>('moderation');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [moderationFilters, setModerationFilters] = useState({
    status: 'pending' as const,
    type: undefined as string | undefined,
    priority: undefined as string | undefined,
    page: 1,
    pageSize: 20
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch trust & safety metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['admin', 'trust-safety', 'metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/trust-safety/metrics');
      if (!response.ok) throw new Error('Failed to fetch trust & safety metrics');
      const result = await response.json();
      return result.data as TrustSafetyMetrics;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch moderation queue
  const { data: moderationData, isLoading: moderationLoading, refetch: refetchModeration } = useQuery({
    queryKey: ['admin', 'trust-safety', 'moderation', moderationFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(moderationFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/admin/trust-safety/moderation?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch moderation queue');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch account link graph
  const { data: accountLinksData, refetch: refetchAccountLinks } = useQuery({
    queryKey: ['admin', 'trust-safety', 'account-links', selectedUser],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedUser) params.append('userId', selectedUser);
      
      const response = await fetch(`/api/admin/trust-safety/account-links?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch account link graph');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch selected moderation item
  const { data: moderationItem } = useQuery({
    queryKey: ['admin', 'trust-safety', 'moderation', selectedItem?.id],
    queryFn: async () => {
      if (!selectedItem) return null;
      const response = await fetch(`/api/admin/trust-safety/moderation/${selectedItem.id}`);
      if (!response.ok) throw new Error('Failed to fetch moderation item');
      const result = await response.json();
      return result.data as ModerationItem;
    },
    enabled: !!selectedItem,
  });

  // Fetch user risk profile
  const { data: userRiskProfile } = useQuery({
    queryKey: ['admin', 'trust-safety', 'users', selectedUser, 'risk-profile'],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await fetch(`/api/admin/trust-safety/users/${selectedUser}/risk-profile`);
      if (!response.ok) throw new Error('Failed to fetch user risk profile');
      const result = await response.json();
      return result.data as UserRiskProfile;
    },
    enabled: !!selectedUser,
  });

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ['admin', 'trust-safety', 'users', 'search', userSearchQuery],
    queryFn: async () => {
      if (!userSearchQuery || userSearchQuery.length < 2) return [];
      const response = await fetch(`/api/admin/trust-safety/users/search?q=${encodeURIComponent(userSearchQuery)}`);
      if (!response.ok) throw new Error('Failed to search users');
      const result = await response.json();
      return result.data;
    },
    enabled: userSearchQuery.length >= 2,
  });

  // Take moderation action mutation
  const moderationActionMutation = useMutation({
    mutationFn: async ({ itemId, action }: { itemId: string; action: any }) => {
      const response = await fetch(`/api/admin/trust-safety/moderation/${itemId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (!response.ok) throw new Error('Failed to take moderation action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trust-safety', 'moderation'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'trust-safety', 'metrics'] });
      setSelectedItem(null);
    },
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'escalated': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'destructive';
    if (riskScore >= 60) return 'warning';
    if (riskScore >= 40) return 'secondary';
    return 'success';
  };

  const renderModerationTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b4b4b]" />
              <input
                type="text"
                placeholder="Search moderation items..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={moderationFilters.status}
              onChange={(e) => setModerationFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
              className="px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="escalated">Escalated</option>
            </select>
            
            <select
              value={moderationFilters.type || ''}
              onChange={(e) => setModerationFilters(prev => ({ ...prev, type: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="vendor">Vendor</option>
              <option value="review">Review</option>
              <option value="event">Event</option>
              <option value="user">User</option>
              <option value="content">Content</option>
            </select>
            
            <select
              value={moderationFilters.priority || ''}
              onChange={(e) => setModerationFilters(prev => ({ ...prev, priority: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Moderation Items */}
      {moderationData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {moderationData.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedItem?.id === item.id ? 'ring-2 ring-[#7F232E]' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8CBAE] flex items-center justify-center text-[#7F232E] font-semibold">
                        {item.type.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2b2b2b] capitalize">{item.type}</h3>
                        <p className="text-sm text-[#4b4b4b]">{item.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(item.priority) as any}>
                        {item.priority}
                      </Badge>
                      <Badge variant={getStatusColor(item.status) as any}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-[#4b4b4b]">
                    <div className="flex items-center justify-between">
                      <span>Reported:</span>
                      <span>{formatDate(item.reportedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Target:</span>
                      <span className="font-medium">{item.targetType} {item.targetId}</span>
                    </div>
                    {item.reportedBy && (
                      <div className="flex items-center justify-between">
                        <span>Reported by:</span>
                        <span className="font-medium">{item.reportedBy}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {/* Pagination */}
            {moderationData.pageCount > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setModerationFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={moderationData.page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#4b4b4b]">
                  Page {moderationData.page} of {moderationData.pageCount}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setModerationFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={moderationData.page >= moderationData.pageCount}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div>
            {selectedItem && moderationItem ? (
              <Card className="p-6 sticky top-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2b2b2b]">Moderation Details</h3>
                    <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-[#2b2b2b] capitalize">{moderationItem.type}</h4>
                      <p className="text-sm text-[#4b4b4b]">{moderationItem.reason}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#4b4b4b]">Priority:</span>
                        <p className="font-medium capitalize">{moderationItem.priority}</p>
                      </div>
                      <div>
                        <span className="text-[#4b4b4b]">Status:</span>
                        <p className="font-medium capitalize">{moderationItem.status}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-[#4b4b4b] text-sm">Evidence:</span>
                      <div className="space-y-2 mt-2">
                        {moderationItem.evidence.map(evidence => (
                          <div key={evidence.id} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium capitalize">{evidence.type}</p>
                            <p className="text-[#4b4b4b]">{evidence.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm text-[#4b4b4b]">
                        <span>Reported:</span>
                        <span>{formatDate(moderationItem.reportedAt)}</span>
                      </div>
                      {moderationItem.reportedBy && (
                        <div className="flex items-center justify-between text-sm text-[#4b4b4b]">
                          <span>By:</span>
                          <span>{moderationItem.reportedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-[#2b2b2b] mb-3">Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => moderationActionMutation.mutate({
                          itemId: moderationItem.id,
                          action: { type: 'approve', reason: 'Content approved' }
                        })}
                        disabled={moderationActionMutation.isPending}
                        className="text-sm"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => moderationActionMutation.mutate({
                          itemId: moderationItem.id,
                          action: { type: 'reject', reason: 'Content rejected' }
                        })}
                        disabled={moderationActionMutation.isPending}
                        className="text-sm"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => moderationActionMutation.mutate({
                          itemId: moderationItem.id,
                          action: { type: 'escalate', reason: 'Escalated for review' }
                        })}
                        disabled={moderationActionMutation.isPending}
                        className="text-sm"
                      >
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Escalate
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => moderationActionMutation.mutate({
                          itemId: moderationItem.id,
                          action: { type: 'warn', reason: 'Warning issued' }
                        })}
                        disabled={moderationActionMutation.isPending}
                        className="text-sm"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Warn
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-[#4b4b4b]">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a moderation item to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAccountLinksTab = () => (
    <div className="space-y-6">
      {/* User Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b4b4b]" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-[#7F232E]/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
              />
            </div>
          </div>
        </div>
        
        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user: any) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUser === user.id ? 'border-[#7F232E] bg-[#7F232E]/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedUser(user.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2b2b2b]">{user.name}</p>
                    <p className="text-sm text-[#4b4b4b]">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(user.riskScore) as any}>
                      Risk: {user.riskScore}
                    </Badge>
                    <Badge variant="secondary">
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Account Link Graph */}
      {accountLinksData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Account Link Graph</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nodes */}
            <div>
              <h4 className="font-medium text-[#2b2b2b] mb-3">Connected Accounts</h4>
              <div className="space-y-2">
                {accountLinksData.nodes.map((node: any) => (
                  <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        node.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {node.type === 'user' ? 'U' : 'V'}
                      </div>
                      <div>
                        <p className="font-medium text-[#2b2b2b]">{node.label}</p>
                        <p className="text-sm text-[#4b4b4b] capitalize">{node.type}</p>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(node.riskScore) as any}>
                      {node.riskScore}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-medium text-[#2b2b2b] mb-3">Connection Types</h4>
              <div className="space-y-2">
                {accountLinksData.links.map((link: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-[#2b2b2b] capitalize">{link.type}</p>
                      <p className="text-sm text-[#4b4b4b]">
                        {link.source} → {link.target}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#2b2b2b]">{link.confidence}%</p>
                      <Badge variant={getRiskColor(link.riskScore) as any}>
                        {link.riskScore}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* User Risk Profile */}
      {selectedUser && userRiskProfile && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">User Risk Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-[#2b2b2b] mb-3">Risk Assessment</h4>
              <div className="space-y-3">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    userRiskProfile.riskScore >= 80 ? 'bg-red-100' :
                    userRiskProfile.riskScore >= 60 ? 'bg-yellow-100' :
                    userRiskProfile.riskScore >= 40 ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      userRiskProfile.riskScore >= 80 ? 'text-red-600' :
                      userRiskProfile.riskScore >= 60 ? 'text-yellow-600' :
                      userRiskProfile.riskScore >= 40 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {userRiskProfile.riskScore}
                    </span>
                  </div>
                  <p className="text-sm text-[#4b4b4b]">Risk Score</p>
                </div>
                
                <div>
                  <span className="text-[#4b4b4b] text-sm">KYC Status:</span>
                  <Badge variant={userRiskProfile.kycStatus === 'verified' ? 'success' : 'warning'}>
                    {userRiskProfile.kycStatus}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-[#4b4b4b] text-sm">KYB Status:</span>
                  <Badge variant={userRiskProfile.kybStatus === 'verified' ? 'success' : 'warning'}>
                    {userRiskProfile.kybStatus}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-[#2b2b2b] mb-3">Risk Factors</h4>
              <div className="space-y-2">
                {userRiskProfile.riskFactors.map((factor, index) => (
                  <div key={index} className="p-2 bg-red-50 rounded text-sm">
                    <p className="text-red-800">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-[#2b2b2b] mb-3">Recent Actions</h4>
              <div className="space-y-2">
                {userRiskProfile.actions.map((action, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{action.type}</span>
                      <span className="text-[#4b4b4b]">{formatDate(action.performedAt)}</span>
                    </div>
                    <p className="text-[#4b4b4b]">{action.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2b2b2b]">{metrics.totalReports}</p>
                <p className="text-sm text-[#4b4b4b]">Total Reports</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{metrics.pendingReports}</p>
                <p className="text-sm text-[#4b4b4b]">Pending</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.resolvedReports}</p>
                <p className="text-sm text-[#4b4b4b]">Resolved</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.averageResolutionTime.toFixed(1)}h</p>
                <p className="text-sm text-[#4b4b4b]">Avg Resolution</p>
              </div>
            </Card>
          </div>

          {/* Violation Types */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Top Violation Types</h3>
            <div className="space-y-3">
              {metrics.topViolationTypes.map((violation, index) => (
                <div key={violation.type} className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">{violation.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#7F232E] h-2 rounded-full"
                        style={{ width: `${(violation.count / metrics.totalReports) * 100}%` } as React.CSSProperties}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{violation.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Account Links & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Account Links</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Links</span>
                  <span className="font-medium">{metrics.accountLinks.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">High Risk</span>
                  <span className="font-medium text-red-600">{metrics.accountLinks.highRisk}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Investigating</span>
                  <span className="font-medium text-orange-600">{metrics.accountLinks.investigating}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Actions Taken</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Warnings</span>
                  <span className="font-medium">{metrics.actions.warnings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Suspensions</span>
                  <span className="font-medium text-orange-600">{metrics.actions.suspensions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Bans</span>
                  <span className="font-medium text-red-600">{metrics.actions.bans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Content Removals</span>
                  <span className="font-medium">{metrics.actions.contentRemovals}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  if (metricsLoading || moderationLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Trust & Safety</h2>
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Trust & Safety</h2>
          <p className="text-[#4b4b4b] mt-1">Content moderation, account security, and risk management</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            {(['moderation', 'account-links', 'metrics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#7F232E] text-white'
                    : 'text-[#4b4b4b] hover:text-[#7F232E]'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              refetchMetrics();
              refetchModeration();
              refetchAccountLinks();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'moderation' && renderModerationTab()}
      {activeTab === 'account-links' && renderAccountLinksTab()}
      {activeTab === 'metrics' && renderMetricsTab()}
    </div>
  );
}
