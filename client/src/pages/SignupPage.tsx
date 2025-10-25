import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Check, Mail } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { logger } from '../lib/sentry';
import { logSignupError, logApiError } from '../utils/debugSentry';

// Import our new components
import LegalAgreements from '../components/auth/LegalAgreements';
import VendorProfileForm from '../components/auth/VendorProfileForm';
import CoordinatorProfileForm from '../components/auth/CoordinatorProfileForm';
import CustomerProfileForm from '../components/auth/CustomerProfileForm';
import StripeOnboardingStep from '../components/auth/StripeOnboardingStep';

// Import services
import type { LegalDocument } from '../services/legal';
import { api } from '../lib/api';

interface SignupFormData {
  // Step 1: Account Type
  role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR';
  
  // Step 2: Email & Password (if not OAuth)
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  
  // Step 3: Profile Data (varies by role)
  profileData: Record<string, unknown>;
  
  // Step 4: Legal Agreements
  acceptedAgreements: LegalDocument[];
  
  // Step 5: Stripe (vendors/coordinators only)
  stripeCompleted: boolean;
}

type SignupStep = 'account-type' | 'credentials' | 'profile' | 'legal' | 'stripe' | 'complete';

const SignupPage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Core state
  const [currentStep, setCurrentStep] = useState<SignupStep>('account-type');
  const [formData, setFormData] = useState<SignupFormData>({
    role: 'VENDOR',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    profileData: {},
    acceptedAgreements: [],
    stripeCompleted: false
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [stepValid, setStepValid] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);

  // Debug stepValid changes
  useEffect(() => {
    console.log('stepValid changed:', stepValid, 'currentStep:', currentStep);
  }, [stepValid, currentStep]);
  
  // Check for OAuth redirect and pre-filled data from join pages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauth = urlParams.get('oauth');
    const step = urlParams.get('step');
    const role = urlParams.get('role');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    
    if (oauth && step === 'profile') {
      setIsOAuthUser(true);
      setCurrentStep('account-type'); // Still need to select role
      toast.success(`Successfully connected with ${oauth}!`);
    }

    // Pre-fill form data from join page
    if (role || name || email) {
      setFormData(prev => ({
        ...prev,
        ...(role && { role: role as 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR' }),
        ...(name && { name }),
        ...(email && { email })
      }));

      // If role is provided, skip account-type step
      if (role) {
        setCurrentStep('credentials');
      }
    }
  }, []);

  // Define step order based on role
  const getStepOrder = useCallback((): SignupStep[] => {
    const baseSteps: SignupStep[] = ['account-type'];
    
    if (!isOAuthUser) {
      baseSteps.push('credentials');
    }
    
    baseSteps.push('profile', 'legal');
    
    // Skip Stripe by default - users can set up payments later from dashboard
    // if (formData.role === 'VENDOR' || formData.role === 'EVENT_COORDINATOR') {
    //   baseSteps.push('stripe');
    // }
    
    baseSteps.push('complete');
    
    return baseSteps;
  }, [isOAuthUser]);

  // Get current step index
  const getCurrentStepIndex = (): number => {
    return getStepOrder().indexOf(currentStep);
  };

  // Get total steps
  const getTotalSteps = (): number => {
    return getStepOrder().length - 1; // Exclude 'complete' step from count
  };

  // Navigation functions
  const goToNextStep = () => {
    const stepOrder = getStepOrder();
    const currentIndex = getCurrentStepIndex();
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
        setStepValid(false);
      }
    }
  };

  const goToPreviousStep = () => {
    const stepOrder = getStepOrder();
    const currentIndex = getCurrentStepIndex();
    
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
        setStepValid(false);
      }
    }
  };

  // Step handlers
  const handleAccountTypeChange = (role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR') => {
    setFormData(prev => ({ ...prev, role }));
    setStepValid(true);
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    // Clear duplicate email error when user changes email
    if (duplicateEmailError) {
      setDuplicateEmailError(false);
    }
  };

  const handleCredentialsSubmit = async () => {
    if (!stepValid) return;
    
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.email || !formData.password || !formData.name) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }
      
      if (!/[A-Z]/.test(formData.password)) {
        toast.error('Password must contain at least one uppercase letter');
        return;
      }
      
      if (!/[0-9]/.test(formData.password)) {
        toast.error('Password must contain at least one number');
        return;
      }
      
      console.log('Validating credentials with:', {
        email: formData.email,
        name: formData.name,
        role: formData.role
      });
      
      // Call signup step 1 API for validation only
      let response;
      try {
        response = await api.post('/auth/signup/step1', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        });
      } catch (networkError: unknown) {
        console.error('Network error during validation:', networkError);
        
        // Enhanced error logging
        if (networkError instanceof Error) {
          logApiError(
            networkError,
            '/auth/signup/step1',
            'POST',
            {
              email: formData.email,
              name: formData.name,
              role: formData.role,
              hasPassword: !!formData.password
            }
          );
        }
        
        // Handle specific error cases
        if (networkError && typeof networkError === 'object' && 'response' in networkError) {
          const axiosError = networkError as { response?: { status?: number; data?: { message?: string } } };
          if (axiosError.response?.status === 400) {
            const errorData = axiosError.response.data;
            if (errorData?.message?.includes('already exists')) {
              setDuplicateEmailError(true);
              toast.error('An account with this email already exists. Please try logging in instead.');
              return;
            }
          }
        }
        
        // Generic network error
        toast.error('Network error. Please check your connection and try again.');
        return;
      }
      
      const data = response.data;
      
      if (response.status === 200 && data.success) {
        console.log('Validation successful, proceeding to next step');
        toast.success('Credentials validated successfully!');
        goToNextStep();
      } else {
        console.error('Validation failed:', data);
        toast.error(data.message || 'Validation failed');
      }
      
    } catch (error) {
      console.error('Unexpected error in credentials validation:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!stepValid) return;
    
    try {
      setLoading(true);
      
      // Just validate and move to next step - no API call
      console.log('Profile data validated:', formData.profileData);
      toast.success('Profile completed successfully!');
      goToNextStep();
      
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Failed to validate profile');
    } finally {
      setLoading(false);
    }
  };


  const handleFinalSubmit = async () => {
    // Create a span to track the entire signup submission process
    return Sentry.startSpan(
      {
        op: 'signup.submit',
        name: 'Complete Signup Submission',
      },
      async (span) => {
        try {
          setLoading(true);
          
          // Add attributes to the span for tracking
          span.setAttribute('role', formData.role);
          span.setAttribute('hasProfileData', Object.keys(formData.profileData).length > 0);
          span.setAttribute('agreementsCount', formData.acceptedAgreements.length);
          
          // Log the start of signup submission
          logger.info('Starting signup submission', {
            role: formData.role,
            email: formData.email,
            step: currentStep,
          });
          
          // Prepare agreements data
          const agreements = formData.acceptedAgreements.map(doc => ({
            documentId: doc.id,
            documentType: doc.type,
            documentVersion: doc.version
          }));
          
          console.log('Submitting complete signup with:', {
            email: formData.email,
            role: formData.role,
            profileData: formData.profileData,
            agreements
          });
          
          // Call signup complete API with all data - wrapped in a child span
          const response = await Sentry.startSpan(
            {
              op: 'http.client',
              name: 'POST /api/auth/signup/complete',
            },
            async () => {
              return await api.post('/auth/signup/complete', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: formData.role,
                profileData: formData.profileData,
                agreements
              });
            }
          );
          
          const data = response.data;
          
          if (response.status === 200 && data.success) {
            logger.info('Signup completed successfully', {
              role: formData.role,
              email: formData.email,
            });
            span.setStatus({ code: 1, message: 'ok' }); // Success
            toast.success('Welcome to Craved Artisan! 🎉');
            setLocation('/dashboard');
          } else {
            logger.warn('Signup failed with non-success response', {
              status: response.status,
              message: data.message,
            });
            span.setStatus({ code: 2, message: 'failed' }); // Failed
            toast.error(data.message || 'Failed to complete signup');
          }
          
        } catch (error: unknown) {
          // Log the error
          logger.error('Signup submission failed', {
            role: formData.role,
            email: formData.email,
            step: currentStep,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          
          // Mark span as failed
          span.setStatus({ code: 2, message: 'error' });
          
          // Enhanced error logging
          if (error instanceof Error) {
            logSignupError(error, 'final_submission', formData as unknown as Record<string, unknown>);
          }
          
          // Send detailed error to Sentry
          Sentry.captureException(error, {
            tags: {
              component: 'signup',
              step: 'final_submission',
              role: formData.role,
            },
            extra: {
              currentStep,
              email: formData.email,
              hasProfileData: Object.keys(formData.profileData).length > 0,
              agreementsCount: formData.acceptedAgreements.length,
              stripeCompleted: formData.stripeCompleted,
            },
            level: 'error',
          });
          
          // Handle specific error cases
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
            if (axiosError.response?.status === 400) {
              const errorData = axiosError.response.data;
              if (errorData?.message?.includes('already exists')) {
                toast.error('An account with this email already exists. Please try logging in instead.');
                return;
              }
            }
            
            toast.error(axiosError.response?.data?.message || 'Failed to complete signup');
          } else {
            toast.error('Failed to complete signup');
          }
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleSignupComplete = () => {
    toast.success('Welcome to Craved Artisan! 🎉');
    setLocation('/dashboard');
  };

  // Step validation
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 'account-type':
        return !!formData.role;
      case 'credentials':
        return !!(
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.name &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 8 &&
          /[A-Z]/.test(formData.password) &&
          /[0-9]/.test(formData.password)
        );
      case 'profile':
        // For profile step, validate that we have profile data
        // The profile forms will set stepValid via onDataChange callback
        return stepValid;
      case 'legal':
        return stepValid && formData.acceptedAgreements.length > 0;
      case 'stripe':
        return stepValid || formData.stripeCompleted;
      default:
        return false;
    }
  }, [currentStep, formData, stepValid]);

  // Progress indicator component
  const ProgressIndicator = () => {
    const stepOrder = getStepOrder().filter(step => step !== 'complete');
    const currentIndex = getCurrentStepIndex();
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepOrder.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            
            let stepName = '';
            switch (step) {
              case 'account-type':
                stepName = 'Account Type';
                break;
              case 'credentials':
                stepName = 'Account Details';
                break;
              case 'profile':
                stepName = 'Profile';
                break;
              case 'legal':
                stepName = 'Agreements';
                break;
              case 'stripe':
                stepName = 'Payment Setup';
                break;
            }
            
            return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isCompleted
                    ? 'bg-[#5B6E02] border-[#5B6E02] text-white'
                    : isCurrent
                    ? 'border-[#5B6E02] text-[#5B6E02] bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-2 text-sm">
                  <div className={`font-medium ${
                    isCurrent ? 'text-[#5B6E02]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {stepName}
                  </div>
                </div>
                {index < stepOrder.length - 1 && (
                  <div className={`mx-4 h-0.5 flex-1 ${
                    isCompleted ? 'bg-[#5B6E02]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Step {currentIndex + 1} of {getTotalSteps()}
        </div>
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'account-type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What type of account would you like?
              </h2>
              <p className="text-gray-600">
                Choose the option that best describes how you'll use Craved Artisan.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Vendor Option */}
              <label className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="VENDOR"
                  checked={formData.role === 'VENDOR'}
                  onChange={() => handleAccountTypeChange('VENDOR')}
                  className="sr-only"
                />
                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${
                  formData.role === 'VENDOR' 
                    ? 'border-[#5B6E02] bg-[#5B6E02]' 
                    : 'border-gray-300'
                }`}>
                  {formData.role === 'VENDOR' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Vendor</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sell your handmade products, food, or crafts directly to customers
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="font-medium text-[#5B6E02]">$25/month with 14-day free trial</div>
                    <div>+ 2% commission on all sales</div>
                  </div>
                </div>
              </label>

              {/* Customer Option */}
              <label className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="CUSTOMER"
                  checked={formData.role === 'CUSTOMER'}
                  onChange={() => handleAccountTypeChange('CUSTOMER')}
                  className="sr-only"
                />
                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${
                  formData.role === 'CUSTOMER' 
                    ? 'border-[#5B6E02] bg-[#5B6E02]' 
                    : 'border-gray-300'
                }`}>
                  {formData.role === 'CUSTOMER' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Customer</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Discover and purchase unique products from local artisans
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="font-medium text-green-600">Free to join</div>
                  </div>
                </div>
              </label>

              {/* Event Coordinator Option */}
              <label className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="EVENT_COORDINATOR"
                  checked={formData.role === 'EVENT_COORDINATOR'}
                  onChange={() => handleAccountTypeChange('EVENT_COORDINATOR')}
                  className="sr-only"
                />
                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${
                  formData.role === 'EVENT_COORDINATOR' 
                    ? 'border-[#5B6E02] bg-[#5B6E02]' 
                    : 'border-gray-300'
                }`}>
                  {formData.role === 'EVENT_COORDINATOR' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Event Coordinator</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Organize farmers markets, craft fairs, and vendor events. Sell booth spaces to vendors.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="font-medium text-green-600">Free to join</div>
                    <div>2% commission on booth sales only</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        );

      case 'credentials':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleCredentialsSubmit(); }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Enter your details to get started as a {formData.role.toLowerCase().replace('_', ' ')}.
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black ${
                    duplicateEmailError ? 'border-red-500' : 'border-[#E8CBAE]'
                  }`}
                  placeholder="Enter your email address"
                  required
                />
                {duplicateEmailError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">
                      This email is already registered
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      An account with this email already exists. 
                      <button
                        type="button"
                        onClick={() => setLocation('/auth/login')}
                        className="underline hover:text-red-700 ml-1"
                      >
                        Click here to login instead
                      </button>
                    </p>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Choose a secure password"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with one uppercase letter and one number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Confirm your password"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>
          </form>
        );

      case 'profile':
        return (
          <div>
            {formData.role === 'VENDOR' && (
              <VendorProfileForm
                onDataChange={(data, isValid) => {
                  console.log('VendorProfileForm validation:', { data, isValid });
                  setFormData(prev => ({ ...prev, profileData: data as unknown as Record<string, unknown> }));
                  setStepValid(isValid);
                }}
                disabled={loading}
              />
            )}
            {formData.role === 'EVENT_COORDINATOR' && (
              <CoordinatorProfileForm
                onDataChange={(data, isValid) => {
                  setFormData(prev => ({ ...prev, profileData: data as unknown as Record<string, unknown> }));
                  setStepValid(isValid);
                }}
                disabled={loading}
              />
            )}
            {formData.role === 'CUSTOMER' && (
              <CustomerProfileForm
                onDataChange={(data, isValid) => {
                  setFormData(prev => ({ ...prev, profileData: data as unknown as Record<string, unknown> }));
                  setStepValid(isValid);
                }}
                disabled={loading}
              />
            )}
          </div>
        );

      case 'legal':
        return (
          <LegalAgreements
            role={formData.role}
            onAcceptanceChange={(accepted, agreements) => {
              setStepValid(accepted);
              setFormData(prev => ({ 
                ...prev, 
                acceptedAgreements: agreements || [] 
              }));
            }}
            disabled={loading}
          />
        );

      case 'stripe':
        return (
          <StripeOnboardingStep
            role={formData.role as 'VENDOR' | 'EVENT_COORDINATOR'}
            onStatusChange={(completed) => {
              setFormData(prev => ({ ...prev, stripeCompleted: completed }));
              setStepValid(completed);
            }}
            onSkip={() => {
              setStepValid(true);
              goToNextStep();
            }}
            disabled={loading}
          />
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to Craved Artisan! 🎉
            </h2>
            
            <p className="text-gray-600">
              Your {formData.role.toLowerCase().replace('_', ' ')} account has been created successfully.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-800">
                    Verify Your Email
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We've sent a verification email to <strong>{formData.email}</strong>. 
                    Please check your inbox and click the verification link to complete your account setup.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignupComplete}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02]"
            >
              Continue to Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Update step validity when form data changes
  useEffect(() => {
    // Don't override stepValid for profile step - let the profile forms handle it
    if (currentStep !== 'profile') {
      setStepValid(validateCurrentStep());
    }
  }, [currentStep, formData, validateCurrentStep]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img 
          src="/images/logo.png" 
          alt="Craved Artisan Logo" 
          className="h-32 w-auto"
        />
      </div>

      {/* Main Content */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-[#F7F2EC] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[#E8CBAE]">
          
          {/* Progress Indicator */}
          {currentStep !== 'complete' && <ProgressIndicator />}
          
          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>
          
          {/* Navigation Buttons */}
          {currentStep !== 'complete' && (
            <div className="flex justify-between space-x-4">
              <button
                onClick={goToPreviousStep}
                disabled={getCurrentStepIndex() === 0}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>

              <button
                onClick={() => {
                  if (currentStep === 'credentials') {
                    handleCredentialsSubmit();
                  } else if (currentStep === 'profile') {
                    handleProfileSubmit();
                  } else if (currentStep === 'legal') {
                    handleFinalSubmit(); // Use final submit for legal step
                  } else {
                    goToNextStep();
                  }
                }}
                disabled={!stepValid || loading}
                className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {currentStep === 'legal' ? 'Create Account' : (getCurrentStepIndex() === getTotalSteps() - 1 ? 'Complete' : 'Next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
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
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;