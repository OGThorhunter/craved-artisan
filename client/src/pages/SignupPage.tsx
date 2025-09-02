import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'VENDOR' as 'VENDOR' | 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.name, formData.role);
      toast.success('Registration successful! You are now logged in.');
      setLocation('/dashboard'); // Redirect to dashboard after registration
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-black">
          Or{' '}
          <button
            onClick={() => setLocation('/login')}
            className="font-medium text-[#5B6E02] hover:text-[#4A5D01]"
          >
            sign in to your existing account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F7F2EC] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[#E8CBAE]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-black">
                Account Type
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                >
                  <option value="VENDOR">Vendor (Sell Products)</option>
                  <option value="CUSTOMER">Customer (Buy Products)</option>
                </select>
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
