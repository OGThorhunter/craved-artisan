import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Search, Plus, Play, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';

export default function RunbooksToolsViewNew() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRunbook, setSelectedRunbook] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch runbooks
  const { data: runbooks = [], isLoading } = useQuery({
    queryKey: ['admin', 'ops', 'runbooks', 'search', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);

      const response = await fetch(`/api/admin/ops/runbooks/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch runbooks');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000
  });

  // Mark reviewed mutation
  const markReviewedMutation = useMutation({
    mutationFn: async (runbookId: string) => {
      const response = await fetch(`/api/admin/ops/runbooks/${runbookId}/review`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to mark as reviewed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'runbooks'] });
    }
  });

  // Start execution mutation
  const executeMutation = useMutation({
    mutationFn: async (runbookId: string) => {
      const response = await fetch(`/api/admin/ops/runbooks/${runbookId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to start execution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'runbooks'] });
      alert('Runbook execution started!');
    }
  });

  const isStale = (runbook: any) => {
    if (!runbook.lastReviewedAt || !runbook.reviewCadenceDays) return false;
    const daysSinceReview = (Date.now() - new Date(runbook.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceReview > runbook.reviewCadenceDays;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F232E] mx-auto"></div>
        <p className="text-[#4b4b4b] mt-3">Loading runbooks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-[#7F232E]" />
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Runbooks & Tools</h2>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Runbook
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4b4b4b]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search runbooks by title, content, or tags..."
          className="w-full pl-10 pr-4 py-2 border border-[#7F232E]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
        />
      </div>

      {/* Runbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runbooks.map((runbook: any) => (
          <Card key={runbook.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRunbook(runbook)}>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[#2b2b2b] flex-1">{runbook.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  v{runbook.version}
                </Badge>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {runbook.executable && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Executable
                  </Badge>
                )}
                {isStale(runbook) && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs Review
                  </Badge>
                )}
              </div>

              {/* Services */}
              {runbook.service && runbook.service.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {runbook.service.slice(0, 3).map((svc: string) => (
                    <Badge key={svc} variant="secondary" className="text-xs">
                      {svc}
                    </Badge>
                  ))}
                  {runbook.service.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{runbook.service.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-[#4b4b4b] space-y-1">
                {runbook.estimatedDuration && (
                  <div>Duration: ~{runbook.estimatedDuration}min</div>
                )}
                {runbook.lastReviewedAt && (
                  <div>Last reviewed: {new Date(runbook.lastReviewedAt).toLocaleDateString()}</div>
                )}
                {runbook.owner && (
                  <div>Owner: {runbook.owner.name || runbook.owner.email}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-[#7F232E]/10">
                {runbook.executable && (
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeMutation.mutate(runbook.id);
                    }}
                    disabled={executeMutation.isPending}
                    className="text-xs flex-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Execute
                  </Button>
                )}
                {isStale(runbook) && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      markReviewedMutation.mutate(runbook.id);
                    }}
                    disabled={markReviewedMutation.isPending}
                    className="text-xs flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Reviewed
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {runbooks.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-[#4b4b4b] mx-auto mb-3" />
          <p className="text-[#2b2b2b] font-medium">No runbooks found</p>
          <p className="text-sm text-[#4b4b4b] mt-1">Create your first runbook to get started</p>
        </Card>
      )}

      {/* Runbook Detail Modal */}
      {selectedRunbook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#2b2b2b]">{selectedRunbook.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedRunbook.severityFit && selectedRunbook.severityFit.length > 0 && (
                      <div className="flex gap-1">
                        {selectedRunbook.severityFit.map((sev: string) => (
                          <Badge key={sev} className="text-xs">{sev}</Badge>
                        ))}
                      </div>
                    )}
                    <Badge variant="secondary" className="text-xs">v{selectedRunbook.version}</Badge>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedRunbook(null)}>Close</Button>
              </div>

              {/* Quick Fields */}
              {(selectedRunbook.estimatedDuration || selectedRunbook.requiredRoles || selectedRunbook.prerequisites) && (
                <Card className="p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {selectedRunbook.estimatedDuration && (
                      <div>
                        <div className="text-[#4b4b4b] font-medium">Duration</div>
                        <div className="text-[#2b2b2b]">~{selectedRunbook.estimatedDuration} min</div>
                      </div>
                    )}
                    {selectedRunbook.requiredRoles && (
                      <div>
                        <div className="text-[#4b4b4b] font-medium">Required Roles</div>
                        <div className="text-[#2b2b2b]">{selectedRunbook.requiredRoles}</div>
                      </div>
                    )}
                    {selectedRunbook.prerequisites && (
                      <div>
                        <div className="text-[#4b4b4b] font-medium">Prerequisites</div>
                        <div className="text-[#2b2b2b] text-xs">{selectedRunbook.prerequisites}</div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedRunbook.contentMarkdown}
                </ReactMarkdown>
              </div>

              {/* Rollback Plan */}
              {selectedRunbook.rollbackPlan && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Rollback Plan</h4>
                  <p className="text-sm text-red-700">{selectedRunbook.rollbackPlan}</p>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#7F232E]/10">
                {selectedRunbook.executable && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      executeMutation.mutate(selectedRunbook.id);
                      setSelectedRunbook(null);
                    }}
                    disabled={executeMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Launch Runbook
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    markReviewedMutation.mutate(selectedRunbook.id);
                  }}
                  disabled={markReviewedMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Reviewed
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Form Modal - Placeholder */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Runbook</h2>
            <p className="text-[#4b4b4b] mb-4">Runbook creation form coming soon...</p>
            <Button onClick={() => setShowCreateForm(false)}>Close</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

