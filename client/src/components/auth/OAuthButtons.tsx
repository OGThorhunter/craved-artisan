import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface OAuthButtonsProps {
  disabled?: boolean;
  className?: string;
}

type OAuthProvider = 'google' | 'facebook' | 'linkedin' | 'twitter';

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ disabled = false, className = '' }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      setLoading(provider);
      
      // Check if OAuth is configured for this provider
      const statusResponse = await fetch('/api/oauth/status', {
        credentials: 'include'
      });
      
      const providerNames: Record<OAuthProvider, string> = {
        google: 'Google',
        facebook: 'Facebook',
        linkedin: 'LinkedIn',
        twitter: 'X (Twitter)'
      };
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (!statusData.providers[provider]?.configured) {
          toast.error(`${providerNames[provider]} OAuth is not configured on this server`);
          setLoading(null);
          return;
        }
      }
      
      // Redirect to OAuth provider
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      window.location.href = `${baseUrl}/api/oauth/${provider}`;
      
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      const providerNames: Record<OAuthProvider, string> = {
        google: 'Google',
        facebook: 'Facebook',
        linkedin: 'LinkedIn',
        twitter: 'X (Twitter)'
      };
      toast.error(`Failed to connect with ${providerNames[provider]}`);
      setLoading(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={() => handleOAuthLogin('google')}
        disabled={disabled || loading !== null}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'google' ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Connecting...
          </div>
        ) : (
          <>
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Facebook OAuth Button */}
      <button
        type="button"
        onClick={() => handleOAuthLogin('facebook')}
        disabled={disabled || loading !== null}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'facebook' ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          <>
            {/* Facebook Logo SVG */}
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </>
        )}
      </button>

      {/* LinkedIn OAuth Button */}
      <button
        type="button"
        onClick={() => handleOAuthLogin('linkedin')}
        disabled={disabled || loading !== null}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#0A66C2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'linkedin' ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          <>
            {/* LinkedIn Logo SVG */}
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </>
        )}
      </button>

      {/* X (Twitter) OAuth Button */}
      <button
        type="button"
        onClick={() => handleOAuthLogin('twitter')}
        disabled={disabled || loading !== null}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'twitter' ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          <>
            {/* X Logo SVG */}
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with X
          </>
        )}
      </button>


      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#F7F2EC] text-gray-500">Or continue with email</span>
        </div>
      </div>
    </div>
  );
};

export default OAuthButtons;