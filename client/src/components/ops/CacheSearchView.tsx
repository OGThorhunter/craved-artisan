import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Search, Trash2, Eye, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import ConfirmActionDialog from './ConfirmActionDialog';

export default function CacheSearchView() {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [flushDialog, setFlushDialog] = useState<{ open: boolean; namespace: string }>({ open: false, namespace: '' });
  const queryClient = useQueryClient();

  // Fetch cache data
  const { data: cacheData } = useQuery({
    queryKey: ['admin', 'ops', 'cache'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/cache');
      if (!response.ok) throw new Error('Failed to fetch cache data');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  // Fetch namespace keys
  const { data: namespaceKeys } = useQuery({
    queryKey: ['admin', 'ops', 'cache', 'namespace', selectedNamespace],
    queryFn: async () => {
      if (!selectedNamespace) return [];
      const response = await fetch(`/api/admin/ops/cache/namespaces/${selectedNamespace}/keys`);
      if (!response.ok) throw new Error('Failed to fetch keys');
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedNamespace
  });

  // Fetch key value
  const { data: keyValue } = useQuery({
    queryKey: ['admin', 'ops', 'cache', 'key', selectedKey],
    queryFn: async () => {
      if (!selectedKey) return null;
      const response = await fetch(`/api/admin/ops/cache/keys/${encodeURIComponent(selectedKey)}`);
      if (!response.ok) throw new Error('Failed to fetch key value');
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedKey
  });

  // Fetch search stats
  const { data: searchStats } = useQuery({
    queryKey: ['admin', 'ops', 'search'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/search/stats');
      if (!response.ok) throw new Error('Failed to fetch search stats');
      const result = await response.json();
      return result.data;
    }
  });

  // Flush mutation
  const flushMutation = useMutation({
    mutationFn: async ({ namespace, reason }: { namespace: string; reason: string }) => {
      const response = await fetch('/api/admin/ops/cache/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace, reason })
      });
      if (!response.ok) throw new Error('Failed to flush cache');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'cache'] });
      setFlushDialog({ open: false, namespace: '' });
    }
  });

  // Rebuild mutation
  const rebuildMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/ops/search/rebuild', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to rebuild search index');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'search'] });
    }
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Redis Memory Overview */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Redis Memory Overview</h3>
        {cacheData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-[#4b4b4b] mb-1">Used Memory</p>
              <p className="text-2xl font-bold text-[#2b2b2b]">
                {formatBytes(cacheData.stats.usedMemory)}
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">
                {cacheData.stats.usedMemoryPercent.toFixed(1)}% of max
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-[#4b4b4b] mb-1">Hit Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {cacheData.stats.hitRate.toFixed(1)}%
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">Cache efficiency</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-[#4b4b4b] mb-1">Miss Rate</p>
              <p className="text-2xl font-bold text-yellow-600">
                {cacheData.stats.missRate.toFixed(1)}%
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">Misses</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-[#4b4b4b] mb-1">Evicted Keys</p>
              <p className="text-2xl font-bold text-[#2b2b2b]">
                {cacheData.stats.evictedKeys}
              </p>
              <p className="text-xs text-[#4b4b4b] mt-1">Total evictions</p>
            </Card>
          </div>
        )}
      </div>

      {/* Namespaces */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Cache Namespaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cacheData?.namespaces?.map((ns: any) => (
            <Card key={ns.namespace} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#2b2b2b]">{ns.namespace}</h4>
                  <p className="text-sm text-[#4b4b4b]">{ns.description}</p>
                </div>
                <Badge variant="secondary">{ns.keyCount} keys</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedNamespace(ns.namespace)}
                  className="flex-1 text-sm"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Browse
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setFlushDialog({ open: true, namespace: ns.namespace })}
                  className="flex-1 text-sm text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Flush
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Browser */}
      {selectedNamespace && namespaceKeys && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2b2b2b]">
              Keys in {selectedNamespace}
            </h3>
            <Button
              variant="secondary"
              onClick={() => setSelectedNamespace('')}
            >
              Close
            </Button>
          </div>
          
          <Card className="p-4">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {namespaceKeys.map((key: string) => (
                <div
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className="p-2 border border-[#7F232E]/10 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <code className="text-sm">{key}</code>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Key Value Preview */}
      {selectedKey && keyValue && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2b2b2b]">Key Preview</h3>
            <Button variant="secondary" onClick={() => setSelectedKey('')}>
              Close
            </Button>
          </div>
          
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#4b4b4b]">Key:</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block">{selectedKey}</code>
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Type:</p>
                <Badge variant="secondary">{keyValue.type}</Badge>
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">TTL:</p>
                <span className="text-sm">{keyValue.ttl > 0 ? `${keyValue.ttl}s` : 'No expiry'}</span>
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b] mb-2">Value:</p>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-[200px]">
                  {JSON.stringify(keyValue.value, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search Index */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Search Index</h3>
        <Card className="p-6">
          {searchStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-[#4b4b4b] mb-1">Total Documents</p>
                  <p className="text-2xl font-bold text-[#2b2b2b]">
                    {searchStats.totalDocuments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#4b4b4b] mb-1">Products</p>
                  <p className="text-2xl font-bold text-[#2b2b2b]">
                    {searchStats.productCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#4b4b4b] mb-1">Vendors</p>
                  <p className="text-2xl font-bold text-[#2b2b2b]">
                    {searchStats.vendorCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[#7F232E]/10">
                <Button
                  variant="secondary"
                  onClick={() => rebuildMutation.mutate()}
                  disabled={rebuildMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${rebuildMutation.isPending ? 'animate-spin' : ''}`} />
                  Rebuild Index
                </Button>
                <Button
                  variant="secondary"
                  disabled={rebuildMutation.isPending}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Partial Refresh
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Flush Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={flushDialog.open}
        onClose={() => setFlushDialog({ open: false, namespace: '' })}
        onConfirm={(reason) => {
          if (reason) {
            flushMutation.mutate({ namespace: flushDialog.namespace, reason });
          }
        }}
        title={`Flush ${flushDialog.namespace} namespace`}
        description="This will permanently delete all keys in this namespace. This action cannot be undone."
        actionLabel="Flush Namespace"
        requireReason={true}
        isDangerous={true}
        isLoading={flushMutation.isPending}
      />
    </div>
  );
}

