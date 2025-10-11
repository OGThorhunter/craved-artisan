import React from 'react';
import wizardImage from '../../assets/images/cravendor-wizard.png';

interface CravendorWizardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CravendorWizard: React.FC<CravendorWizardProps> = ({ 
  title, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`text-center space-y-6 ${className}`}>
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-purple-200 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center overflow-visible">
            <img 
              src={wizardImage} 
              alt="Cravendor the Wise"
              className="w-36 h-36 object-contain object-center -mt-2"
              onLoad={() => {
                console.log('✅ Wizard image loaded successfully');
                console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
              }}
              onError={(e) => {
                console.error('❌ Wizard image failed to load');
                console.log('Attempted to load:', e.currentTarget.src);
                console.log('Full URL:', window.location.origin + e.currentTarget.src);
                // Fallback to a wizard emoji if image fails to load
                const img = e.currentTarget;
                const fallback = img.nextElementSibling as HTMLElement;
                img.style.display = 'none';
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center">
              <div className="text-6xl">🧙‍♂️</div>
            </div>
          </div>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900">{title}</h3>
      <div className="max-w-2xl mx-auto space-y-4">
        {children}
      </div>
    </div>
  );
};

export default CravendorWizard;
