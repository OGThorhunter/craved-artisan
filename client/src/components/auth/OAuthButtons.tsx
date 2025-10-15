import React, { useState } from 'react';
import { Chrome, Facebook, Apple } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OAuthButtonsProps {
  onStart?: () => void;
  onError?: (error: string) => void;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onStart, onError }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(provider);
    onStart?.();

    try {
      // Check if OAuth is configured
      const statusResponse = await fetch('/api/oauth/status');
      const statusData = await statusResponse.json();

      if (!statusData.providers[provider]?.configured) {
        throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet configured`);
      }

      // Redirect to OAuth endpoint
      window.location.href = `/api/oauth/${provider}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OAuth login failed';
      toast.error(message);
      onError?.(message);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        ) : (
          <>
            <Chrome className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Continue with Google</span>
          </>
        )}
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => handleOAuth('facebook')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-blue-600 rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'facebook' ? (
          <div className="w-5 h-5 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Facebook className="w-5 h-5 mr-2 fill-current" />
            <span className="text-sm font-medium">Continue with Facebook</span>
          </>
        )}
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleOAuth('apple')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center px-4 py-3 border border-black rounded-md shadow-sm bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'apple' ? (
          <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Apple className="w-5 h-5 mr-2 fill-current" />
            <span className="text-sm font-medium">Continue with Apple</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Minimal OAuth Button (for inline use)
 */
interface OAuthButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onStart?: () => void;
  onError?: (error: string) => void;
  fullWidth?: boolean;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({ 
  provider, 
  onStart, 
  onError,
  fullWidth = false 
}) => {
  const [loading, setLoading] = useState(false);

  const handleOAuth = async () => {
    setLoading(true);
    onStart?.();

    try {
      const statusResponse = await fetch('/api/oauth/status');
      const statusData = await statusResponse.json();

      if (!statusData.providers[provider]?.configured) {
        throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet configured`);
      }

      window.location.href = `/api/oauth/${provider}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OAuth login failed';
      toast.error(message);
      onError?.(message);
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (provider) {
      case 'google':
        return <Chrome className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 fill-current" />;
      case 'apple':
        return <Apple className="w-5 h-5 fill-current" />;
    }
  };

  const getStyles = () => {
    switch (provider) {
      case 'google':
        return 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
      case 'facebook':
        return 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700';
      case 'apple':
        return 'border-black bg-black text-white hover:bg-gray-900';
    }
  };

  const getLabel = () => {
    const name = provider.charAt(0).toUpperCase() + provider.slice(1);
    return `Continue with ${name}`;
  };

  return (
    <button
      type="button"
      onClick={handleOAuth}
      disabled={loading}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center px-4 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02]
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${getStyles()}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {getIcon()}
          <span className="ml-2 text-sm font-medium">{getLabel()}</span>
        </>
      )}
    </button>
  );
};

