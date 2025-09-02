import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Login successful!');
      setLocation('/dashboard'); // Redirect to dashboard after login
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo at top center */}
      <div className="flex justify-center mb-8">
        <img 
          src="/images/logo.png" 
          alt="Craved Artisan Logo" 
          className="h-40 w-auto"
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-black">
          Or{' '}
          <button
            onClick={() => setLocation('/signup')}
            className="font-medium text-[#5B6E02] hover:text-[#4A5D01]"
          >
            create a new account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F7F2EC] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[#E8CBAE]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8CBAE]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F7F2EC] text-black">Test Account</span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-black">
              <p>Email: test@example.com</p>
              <p>Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
