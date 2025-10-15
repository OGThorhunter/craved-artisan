import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'invalid'>('verifying');
  const [message, setMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Extract token from URL
  const getTokenFromURL = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  };

  // Verify email with token
  const verifyEmail = async (token: string) => {
    try {
      setStatus('verifying');
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast.success('Email verified successfully!');
        
        // Start countdown for redirect
        let countdown = 5;
        setRedirectCountdown(countdown);
        
        const interval = setInterval(() => {
          countdown -= 1;
          setRedirectCountdown(countdown);
          
          if (countdown <= 0) {
            clearInterval(interval);
            // Redirect to dashboard or signup completion
            setLocation('/dashboard');
          }
        }, 1000);
        
      } else {
        setStatus('error');
        setMessage(data.message || 'Email verification failed. The token may be invalid or expired.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('Failed to verify email. Please check your internet connection and try again.');
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      setResendingEmail(true);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Verification email sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  // Handle token verification on page load
  useEffect(() => {
    const token = getTokenFromURL();
    
    if (!token) {
      setStatus('invalid');
      setMessage('No verification token found in URL.');
      return;
    }

    verifyEmail(token);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img 
          src="/images/logo.png" 
          alt="Craved Artisan Logo" 
          className="h-40 w-auto"
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F7F2EC] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[#E8CBAE]">
          
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B6E02]"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  Redirecting to your dashboard in {redirectCountdown} seconds...
                </p>
              </div>
              <button
                onClick={() => setLocation('/dashboard')}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] transition-colors"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard Now
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={resendVerificationEmail}
                  disabled={resendingEmail}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendingEmail ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setLocation('/dashboard')}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Invalid Token State */}
          {status === 'invalid' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Verification Link
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={resendVerificationEmail}
                  disabled={resendingEmail}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendingEmail ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send New Verification Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setLocation('/signup')}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] transition-colors"
                >
                  Back to Signup
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 space-x-4">
            <button
              onClick={() => setLocation('/login')}
              className="text-[#5B6E02] hover:text-[#4A5D01] font-medium"
            >
              Sign In
            </button>
            <span>•</span>
            <button
              onClick={() => setLocation('/signup')}
              className="text-[#5B6E02] hover:text-[#4A5D01] font-medium"
            >
              Sign Up
            </button>
            <span>•</span>
            <button
              onClick={() => setLocation('/')}
              className="text-[#5B6E02] hover:text-[#4A5D01] font-medium"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

