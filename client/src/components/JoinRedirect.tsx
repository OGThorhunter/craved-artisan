import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface JoinRedirectProps {
  role?: string;
}

export const JoinRedirect: React.FC<JoinRedirectProps> = ({ role }) => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('JoinRedirect: Redirecting with role:', role);
    // Force redirect with cache busting
    const timestamp = Date.now();
    if (role) {
      setLocation(`/signup?role=${role}&t=${timestamp}`);
    } else {
      setLocation(`/signup?t=${timestamp}`);
    }
  }, [role, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B6E02] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
};
