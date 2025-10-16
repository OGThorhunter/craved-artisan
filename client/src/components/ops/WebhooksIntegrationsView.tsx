import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Webhook, CheckCircle, XCircle, RotateCcw, Key, Mail } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import ConfirmActionDialog from './ConfirmActionDialog';

export default function WebhooksIntegrationsView() {
  const [rotateDialog, setRotateDialog] = useState<{ open: boolean; endpointId: string }>({ open: false, endpointId: '' });
  const queryClient = useQueryClient();

  const { data: webhooks } = useQuery({
    queryKey: ['admin', 'ops', 'webhooks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      const result = await response.json();
      return result.data;
    }
  });

  const rotateMutation = useMutation({
    mutationFn: async (endpointId: string) => {
      const response = await fetch(`/api/admin/ops/webhooks/${endpointId}/rotate-secret`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to rotate secret');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ops', 'webhooks'] });
      setRotateDialog({ open: false, endpointId: '' });
      
      // Show instructions in console or alert
      console.log('New secret:', data.data.newSecret);
      console.log('Instructions:', data.data.instructions);
      alert('Secret rotated! Check console for new secret and instructions.');
    }
  });

  const getStatusColor = (status?: number) => {
    if (!status) return 'secondary';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400) return 'destructive';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Incoming Webhooks */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Incoming Webhooks</h3>
        <div className="space-y-3">
          {webhooks?.map((endpoint: any) => (
            <Card key={endpoint.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Webhook className="h-5 w-5 text-[#4b4b4b]" />
                  <div>
                    <h4 className="font-medium text-[#2b2b2b]">{endpoint.provider}</h4>
                    <p className="text-sm text-[#4b4b4b]">{endpoint.url}</p>
                  </div>
                </div>
                <Badge variant={endpoint.isActive ? 'success' : 'secondary'}>
                  {endpoint.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-[#4b4b4b]">Last Delivery</p>
                  <p className="text-sm font-medium text-[#2b2b2b]">
                    {endpoint.lastDelivery 
                      ? new Date(endpoint.lastDelivery).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#4b4b4b]">Last Status</p>
                  <Badge variant={getStatusColor(endpoint.lastStatus) as any}>
                    {endpoint.lastStatus || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-[#4b4b4b]">Last Error</p>
                  <p className="text-sm text-red-600">
                    {endpoint.lastError || 'None'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#7F232E]/10">
                <Button
                  variant="secondary"
                  onClick={() => setRotateDialog({ open: true, endpointId: endpoint.id })}
                  className="text-sm"
                >
                  <Key className="h-3 w-3 mr-1" />
                  Rotate Secret
                </Button>
              </div>
            </Card>
          ))}

          {(!webhooks || webhooks.length === 0) && (
            <Card className="p-8 text-center">
              <Webhook className="h-12 w-12 text-[#4b4b4b] mx-auto mb-3" />
              <p className="text-[#4b4b4b]">No webhook endpoints configured</p>
            </Card>
          )}
        </div>
      </div>

      {/* Outbound Integrations */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Outbound Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">Email Provider (SendGrid)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b4b4b]">Status</p>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Delivery Rate</p>
                <p className="text-lg font-bold text-green-600">98.5%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="h-5 w-5 text-[#4b4b4b]" />
              <h4 className="font-medium text-[#2b2b2b]">SMS Provider (Twilio)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b4b4b]">Status</p>
                <Badge variant="secondary">Not Configured</Badge>
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Delivery Rate</p>
                <p className="text-lg font-bold text-gray-400">N/A</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Rotate Secret Dialog */}
      <ConfirmActionDialog
        isOpen={rotateDialog.open}
        onClose={() => setRotateDialog({ open: false, endpointId: '' })}
        onConfirm={() => rotateMutation.mutate(rotateDialog.endpointId)}
        title="Rotate Webhook Secret"
        description="This will generate a new webhook secret. You must update your provider's configuration with the new secret immediately."
        actionLabel="Rotate Secret"
        requireReason={false}
        requireTypedConfirmation={true}
        confirmationPhrase="ROTATE SECRET"
        isDangerous={true}
        isLoading={rotateMutation.isPending}
      />
    </div>
  );
}

