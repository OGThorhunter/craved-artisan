
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  const { user, login, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      {/* Authentication Test Section */}
      <div className="bg-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {user ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user.email} ({user.role})
              </h1>
              <div className="space-y-2">
                <button 
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
                <button 
                  onClick={() => setLocation('/dashboard/vendor')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors ml-2"
                >
                  Test Vendor Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                You are not logged in.
              </h1>
              <div className="space-y-2">
                <button 
                  onClick={() => login("test@example.com", "testpassword123")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => setLocation('/dashboard/vendor')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors ml-2"
                >
                  Test Vendor Dashboard (Not Logged In)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hero Section with Snap Scroll */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
        {/* Ambient Animation Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-primary-300 rounded-full opacity-25 animate-ping"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6">
            Craved <span className="text-primary-600">Artisan</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover handcrafted treasures from local artisans. Every piece tells a story.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/products">
              <button className="btn-primary text-lg px-8 py-4">
                Explore Products
              </button>
            </Link>
            <Link href="/join">
              <button className="btn-secondary text-lg px-8 py-4">
                Join as Artisan
              </button>
            </Link>
          </div>
          
          {/* Local Buzz Widget */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Buzz</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">150+</div>
                <div className="text-gray-600">Artisans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">1.2k</div>
                <div className="text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">5k+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Join Cards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Join Our Community
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover & Shop</h3>
              <p className="text-gray-600 mb-6">
                Browse unique handcrafted items from talented local artisans. 
                Find one-of-a-kind pieces that tell a story.
              </p>
              <Link href="/products">
                <button className="btn-primary">
                  Start Shopping
                </button>
              </Link>
            </div>
            
            {/* Artisan Card */}
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sell Your Craft</h3>
              <p className="text-gray-600 mb-6">
                Showcase your handmade creations to a community that values 
                craftsmanship and authenticity.
              </p>
              <Link href="/join">
                <button className="btn-secondary">
                  Become an Artisan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Featured Artisans
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Artisan {i}
                </h3>
                <p className="text-gray-600 mb-4">
                  Specializing in handcrafted jewelry and accessories
                </p>
                <Link href={`/vendor/${i}`}>
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    View Profile →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}; 