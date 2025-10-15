import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LegalDocument } from '../../services/legal';

interface LegalAgreementDisplayProps {
  document: LegalDocument;
  onAcceptChange: (accepted: boolean) => void;
  accepted: boolean;
  error?: string;
}

const LegalAgreementDisplay: React.FC<LegalAgreementDisplayProps> = ({
  document,
  onAcceptChange,
  accepted,
  error
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#5B6E02]" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{document.title}</h3>
            <p className="text-xs text-gray-500">Version {document.version}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 max-h-96 overflow-y-auto bg-gray-50">
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 text-gray-700" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                  // eslint-disable-next-line react/no-children-prop
                  li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-[#5B6E02] pl-4 italic my-3 text-gray-600" {...props} />
                  ),
                  hr: ({ node, ...props }) => <hr className="my-6 border-gray-300" {...props} />,
                }}
              >
                {document.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Acceptance Checkbox */}
      <div className={`p-4 border-t ${error ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAcceptChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#5B6E02] focus:ring-[#5B6E02] cursor-pointer"
          />
          <span className={`text-sm ${error ? 'text-red-700' : 'text-gray-700'} group-hover:text-gray-900`}>
            I have read and agree to the <strong>{document.title}</strong>
            {!isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(true);
                }}
                className="ml-1 text-[#5B6E02] hover:text-[#4A5D01] underline"
              >
                (click to read)
              </button>
            )}
          </span>
        </label>
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default LegalAgreementDisplay;

