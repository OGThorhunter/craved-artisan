import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/Button';

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description?: string;
  actionLabel?: string;
  minLength?: number;
}

export const ReasonModal: React.FC<ReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel = 'Confirm',
  minLength = 10
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < minLength) {
      setError(`Reason must be at least ${minLength} characters`);
      return;
    }

    onConfirm(reason);
    setReason('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-[#4b4b4b] mb-4">
            {description}
          </p>
        )}

        {/* Reason input */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-[#2b2b2b]">
            Reason for change *
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="Explain why this change is being made..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 text-sm"
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <p className="text-xs text-[#4b4b4b]">
            Minimum {minLength} characters. This will be audited.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={reason.trim().length < minLength}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

