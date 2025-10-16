import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, Info } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  scope: string;
  rolloutPercentage: number;
  notes?: string;
  updatedBy?: {
    name: string;
    email: string;
  };
  updatedAt: string;
}

interface FeatureFlagsTableProps {
  flags: FeatureFlag[];
}

export default function FeatureFlagsTable({ flags }: FeatureFlagsTableProps) {
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const response = await fetch(`/api/admin/ops/feature-flags/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      if (!response.ok) throw new Error('Failed to toggle feature flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'feature-flags'] });
    }
  });

  const updateRolloutMutation = useMutation({
    mutationFn: async ({ key, rolloutPercentage }: { key: string; rolloutPercentage: number }) => {
      const response = await fetch(`/api/admin/ops/feature-flags/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolloutPercentage })
      });
      if (!response.ok) throw new Error('Failed to update rollout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'feature-flags'] });
    }
  });

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'GLOBAL': return 'bg-blue-100 text-blue-800';
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'VENDOR': return 'bg-green-100 text-green-800';
      case 'CUSTOMER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <Card key={flag.key} className="p-4">
          <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-[#4b4b4b]" />
                <div>
                  <h4 className="font-semibold text-[#2b2b2b]">{flag.key}</h4>
                  {flag.notes && (
                    <p className="text-sm text-[#4b4b4b]">{flag.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getScopeColor(flag.scope)}>
                  {flag.scope}
                </Badge>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <span className="sr-only">Toggle {flag.key}</span>
                  <input
                    type="checkbox"
                    checked={flag.enabled}
                    onChange={(e) => toggleMutation.mutate({ key: flag.key, enabled: e.target.checked })}
                    disabled={toggleMutation.isPending}
                    className="sr-only peer"
                    aria-label={`Toggle ${flag.key} feature flag`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7F232E]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7F232E]"></div>
                </label>
              </div>
            </div>

            {/* Rollout Percentage */}
            {flag.enabled && flag.rolloutPercentage < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4b4b4b]">Rollout</span>
                  <span className="text-sm font-medium text-[#2b2b2b]">{flag.rolloutPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={flag.rolloutPercentage}
                  onChange={(e) => updateRolloutMutation.mutate({
                    key: flag.key,
                    rolloutPercentage: parseInt(e.target.value)
                  })}
                  disabled={updateRolloutMutation.isPending}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7F232E]"
                  aria-label={`Rollout percentage for ${flag.key}`}
                />
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-[#4b4b4b]">
              <div className="flex items-center gap-4">
                {flag.updatedBy && (
                  <span>Updated by: {flag.updatedBy.name}</span>
                )}
                <span>{new Date(flag.updatedAt).toLocaleString()}</span>
              </div>
              
              <button
                onClick={() => setExpandedFlag(expandedFlag === flag.key ? null : flag.key)}
                className="flex items-center gap-1 text-[#7F232E] hover:underline"
              >
                <Info className="h-3 w-3" />
                {expandedFlag === flag.key ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {/* Expanded Details */}
            {expandedFlag === flag.key && (
              <div className="pt-3 border-t border-[#7F232E]/10">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4b4b4b]">Flag ID:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{flag.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4b4b4b]">Scope:</span>
                    <span className="font-medium">{flag.scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4b4b4b]">Rollout:</span>
                    <span className="font-medium">{flag.rolloutPercentage}%</span>
                  </div>
                  {flag.updatedBy && (
                    <div className="flex justify-between">
                      <span className="text-[#4b4b4b]">Last Updated By:</span>
                      <span className="font-medium">{flag.updatedBy.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {flags.length === 0 && (
        <Card className="p-8 text-center">
          <Flag className="h-12 w-12 text-[#4b4b4b] mx-auto mb-3" />
          <p className="text-[#4b4b4b]">No feature flags defined</p>
        </Card>
      )}
    </div>
  );
}

