import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LegalDocument } from '../../services/legal';

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
  loading?: boolean;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {document?.title || 'Legal Document'}
              </h2>
              {document && (
                <p className="text-sm text-gray-500 mt-1">
                  Version {document.version} • Type: {document.type}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                <span className="ml-3 text-gray-600">Loading document...</span>
              </div>
            ) : document ? (
              <div className="prose prose-gray max-w-none">
                <div 
                  className="legal-document-content"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdown(document.content) 
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Document not available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Simple markdown-like formatting for legal documents
 * Converts basic markdown to HTML for display
 */
function formatMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6 text-gray-900">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    
    // Links (but make them non-functional in modal)
    .replace(/\[([^\]]+)\]\([^)]+\)/gim, '<span class="text-brand-green font-medium">$1</span>')
    
    // Lists
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    .replace(/(<li.*<\/li>)/gims, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
    
    // Tables (basic support)
    .replace(/\|(.+)\|/gim, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      if (cells.some((cell: string) => cell.includes('---'))) {
        return ''; // Skip separator rows
      }
      const cellsHtml = cells.map((cell: string) => `<td class="px-3 py-2 border border-gray-300">${cell}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>)/gims, '<table class="min-w-full border-collapse border border-gray-300 my-4">$1</table>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-6 border-gray-300" />')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-brand-green pl-4 py-2 my-4 bg-gray-50 italic">$1</blockquote>')
    
    // Line breaks
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/\n/gim, '<br />')
    
    // Wrap in paragraphs
    .replace(/^(?!<[h1-6]|<ul|<ol|<table|<hr|<blockquote)(.+)$/gim, '<p class="mb-4">$1</p>')
    
    // Clean up empty paragraphs and fix nested issues
    .replace(/<p class="mb-4"><\/p>/gim, '')
    .replace(/<p class="mb-4">(<[^>]+>)/gim, '$1')
    .replace(/(<\/[^>]+>)<\/p>/gim, '$1');
}
