import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../../ui/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'destructive';
  icon?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  icon
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4">
          {icon ? (
            <div className="w-12 h-12 rounded-full bg-[#7F232E]/10 flex items-center justify-center">
              {icon}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#4b4b4b] mb-6">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

