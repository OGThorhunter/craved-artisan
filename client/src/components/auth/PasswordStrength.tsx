import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  showRequirements = true 
}) => {
  const requirements: Requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  // Calculate strength score
  let score = 0;
  if (requirements.minLength) score++;
  if (requirements.hasUppercase) score++;
  if (requirements.hasLowercase) score++;
  if (requirements.hasNumber) score++;
  if (requirements.hasSpecialChar) score++;
  if (password.length >= 12) score++; // Bonus for longer passwords

  // Normalize to 0-4
  const normalizedScore = Math.min(Math.floor(score * 4 / 6), 4);

  const getStrengthLabel = () => {
    if (normalizedScore === 0) return 'Very Weak';
    if (normalizedScore === 1) return 'Weak';
    if (normalizedScore === 2) return 'Fair';
    if (normalizedScore === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (normalizedScore === 0) return 'bg-red-500';
    if (normalizedScore === 1) return 'bg-orange-500';
    if (normalizedScore === 2) return 'bg-yellow-500';
    if (normalizedScore === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const isValid = requirements.minLength && 
                  requirements.hasUppercase && 
                  requirements.hasLowercase && 
                  requirements.hasNumber;

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Password Strength:</span>
          <span className={`text-xs font-medium ${
            normalizedScore >= 3 ? 'text-green-600' : 
            normalizedScore >= 2 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getStrengthColor()} transition-all duration-300`}
            {...{ style: { width: `${(normalizedScore / 4) * 100}%` } }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1">
          <Requirement 
            met={requirements.minLength} 
            text="At least 8 characters" 
          />
          <Requirement 
            met={requirements.hasUppercase} 
            text="One uppercase letter" 
          />
          <Requirement 
            met={requirements.hasLowercase} 
            text="One lowercase letter" 
          />
          <Requirement 
            met={requirements.hasNumber} 
            text="One number" 
          />
          <Requirement 
            met={requirements.hasSpecialChar} 
            text="One special character (recommended)" 
            optional 
          />
        </div>
      )}

      {/* Validation Status */}
      {password && (
        <div className={`text-xs ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
          {isValid ? '✓ Password meets requirements' : 'Password must meet minimum requirements'}
        </div>
      )}
    </div>
  );
};

interface RequirementProps {
  met: boolean;
  text: string;
  optional?: boolean;
}

const Requirement: React.FC<RequirementProps> = ({ met, text, optional }) => (
  <div className="flex items-center space-x-2 text-xs">
    {met ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-gray-300" />
    )}
    <span className={met ? 'text-green-700' : 'text-gray-500'}>
      {text} {optional && <span className="text-gray-400">(optional)</span>}
    </span>
  </div>
);

