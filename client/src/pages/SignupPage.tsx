import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Mail } from 'lucide-react';

// Import our new components
import OAuthButtons from '../components/auth/OAuthButtons';
import LegalAgreements from '../components/auth/LegalAgreements';
import VendorProfileForm from '../components/auth/VendorProfileForm';
import CoordinatorProfileForm from '../components/auth/CoordinatorProfileForm';
import CustomerProfileForm from '../components/auth/CustomerProfileForm';
import StripeOnboardingStep from '../components/auth/StripeOnboardingStep';

// Import services
import { legalService, LegalDocument } from '../services/legal';

interface SignupFormData {
  // Step 1: Account Type
  role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR';
  
  // Step 2: Email & Password (if not OAuth)
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  
  // Step 3: Profile Data (varies by role)
  profileData: any;
  
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
  
  // Check for OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauth = urlParams.get('oauth');
    const step = urlParams.get('step');
    
    if (oauth && step === 'profile') {
      setIsOAuthUser(true);
      setCurrentStep('account-type'); // Still need to select role
      toast.success(`Successfully connected with ${oauth}!`);
    }
  }, []);

  // Define step order based on role
  const getStepOrder = useCallback((): SignupStep[] => {
    const baseSteps: SignupStep[] = ['account-type'];
    
    if (!isOAuthUser) {
      baseSteps.push('credentials');
    }
    
    baseSteps.push('profile', 'legal');
    
    if (formData.role === 'VENDOR' || formData.role === 'EVENT_COORDINATOR') {
      baseSteps.push('stripe');
    }
    
    baseSteps.push('complete');
    
    return baseSteps;
  }, [formData.role, isOAuthUser]);

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
      setCurrentStep(stepOrder[currentIndex + 1]);
      setStepValid(false);
    }
  };

  const goToPreviousStep = () => {
    const stepOrder = getStepOrder();
    const currentIndex = getCurrentStepIndex();
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
      setStepValid(false);
    }
  };

  // Step handlers
  const handleAccountTypeChange = (role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR') => {
    setFormData(prev => ({ ...prev, role }));
    setStepValid(true);
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
      
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      
      // Call signup step 1 API
      const response = await fetch('/api/auth/signup/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Account created successfully!');
        goToNextStep();
      } else {
        toast.error(data.message || 'Failed to create account');
      }
      
    } catch (error) {
      console.error('Signup step 1 error:', error);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!stepValid) return;
    
    try {
      setLoading(true);
      
      // Call signup profile API
      const response = await fetch('/api/auth/signup/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData.profileData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Profile completed successfully!');
        goToNextStep();
      } else {
        toast.error(data.message || 'Failed to save profile');
      }
      
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLegalSubmit = async () => {
    if (!stepValid || formData.acceptedAgreements.length === 0) return;
    
    try {
      setLoading(true);
      
      // Accept agreements
      const agreements = formData.acceptedAgreements.map(doc => ({
        documentId: doc.id,
        documentType: doc.type,
        documentVersion: doc.version
      }));
      
      await legalService.acceptAgreements({ agreements });
      
      toast.success('Legal agreements accepted!');
      goToNextStep();
      
    } catch (error) {
      console.error('Legal agreements error:', error);
      toast.error('Failed to accept legal agreements');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupComplete = () => {
    toast.success('Welcome to Craved Artisan! 🎉');
    setLocation('/dashboard');
  };

  // Step validation
  const validateCurrentStep = () => {
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
          formData.password.length >= 6
        );
      case 'profile':
        return stepValid;
      case 'legal':
        return stepValid && formData.acceptedAgreements.length > 0;
      case 'stripe':
        return stepValid || formData.stripeCompleted;
      default:
        return false;
    }
  };

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
                  <p className="text-sm text-gray-600">
                    Sell your handmade products, food, or crafts to customers
                  </p>
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
                  <p className="text-sm text-gray-600">
                    Discover and purchase unique products from local vendors
                  </p>
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
                  <p className="text-sm text-gray-600">
                    Organize farmers markets, craft fairs, and vendor events
                  </p>
                </div>
              </label>
            </div>

            {!isOAuthUser && (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Or sign up quickly with:
                  </p>
                </div>
                <OAuthButtons />
              </>
            )}
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-[#E8CBAE] rounded-md placeholder-[#777] focus:outline-none focus:ring-[#5B6E02] focus:border-[#5B6E02] sm:text-sm bg-white text-black"
                  placeholder="Enter your email address"
                  required
                />
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
                  Must be at least 6 characters long
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
          </div>
        );

      case 'profile':
        return (
          <div>
            {formData.role === 'VENDOR' && (
              <VendorProfileForm
                onDataChange={(data, isValid) => {
                  setFormData(prev => ({ ...prev, profileData: data }));
                  setStepValid(isValid);
                }}
                disabled={loading}
              />
            )}
            {formData.role === 'EVENT_COORDINATOR' && (
              <CoordinatorProfileForm
                onDataChange={(data, isValid) => {
                  setFormData(prev => ({ ...prev, profileData: data }));
                  setStepValid(isValid);
                }}
                disabled={loading}
              />
            )}
            {formData.role === 'CUSTOMER' && (
              <CustomerProfileForm
                onDataChange={(data, isValid) => {
                  setFormData(prev => ({ ...prev, profileData: data }));
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
    setStepValid(validateCurrentStep());
  }, [currentStep, formData]);

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
                    handleLegalSubmit();
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
                    {getCurrentStepIndex() === getTotalSteps() - 1 ? 'Complete' : 'Next'}
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