import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  actionLabel?: string;
  requireReason?: boolean;
  requireTypedConfirmation?: boolean;
  confirmationPhrase?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel = 'Confirm',
  requireReason = false,
  requireTypedConfirmation = false,
  confirmationPhrase = '',
  isDangerous = false,
  isLoading = false
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState('');
  const [typedPhrase, setTypedPhrase] = useState('');

  const canConfirm = () => {
    if (requireReason && !reason.trim()) return false;
    if (requireTypedConfirmation && typedPhrase !== confirmationPhrase) return false;
    return true;
  };

  const handleConfirm = () => {
    if (!canConfirm()) return;
    onConfirm(requireReason ? reason : undefined);
    setReason('');
    setTypedPhrase('');
  };

  const handleClose = () => {
    setReason('');
    setTypedPhrase('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#4b4b4b] hover:text-[#2b2b2b]"
          disabled={isLoading}
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {isDangerous && (
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-[#2b2b2b]">{title}</h3>
            <p className="text-sm text-[#4b4b4b] mt-1">{description}</p>
          </div>
        </div>

        {/* Reason input */}
        {requireReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">
              Reason (required for audit trail) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this action is necessary..."
              className="w-full px-3 py-2 border border-[#7F232E]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 min-h-[80px]"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Typed confirmation */}
        {requireTypedConfirmation && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2b2b2b] mb-2">
              Type <code className="px-2 py-1 bg-gray-100 rounded text-red-600 font-mono">{confirmationPhrase}</code> to confirm
            </label>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={confirmationPhrase}
              className="w-full px-3 py-2 border border-[#7F232E]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 font-mono"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Audit trail note */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Audit Trail:</strong> This action will be logged with your user ID, timestamp, and reason.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!canConfirm() || isLoading}
            className={isDangerous ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? 'Processing...' : actionLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

