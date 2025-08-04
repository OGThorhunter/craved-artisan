import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Save, FileText } from 'lucide-react';

interface CreateVersionModalProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateVersionModal: React.FC<CreateVersionModalProps> = ({
  recipeId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const createVersionMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await axios.post(`/api/vendor/recipes/${recipeId}/version`, {
        notes: notes.trim() || undefined
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Version ${data.recipeVersion.version} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['recipe-versions', recipeId] });
      setNotes('');
      onClose();
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to create version');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVersionMutation.mutate(notes);
  };

  const handleClose = () => {
    if (!createVersionMutation.isPending) {
      setNotes('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Version</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={createVersionMutation.isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Version Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what changed in this version (e.g., 'Switched to organic sugar', 'Reduced salt content', 'Updated cooking instructions')"
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will help track the evolution of your recipe and the reasoning behind changes.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">What will be saved?</h3>
                <div className="mt-2 text-sm text-blue-800">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Current recipe state with all ingredients</li>
                    <li>Ingredient costs at the time of saving</li>
                    <li>Total recipe cost calculation</li>
                    <li>Your version notes</li>
                    <li>Creation timestamp and editor information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={createVersionMutation.isPending}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createVersionMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {createVersionMutation.isPending ? 'Creating...' : 'Create Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVersionModal; 