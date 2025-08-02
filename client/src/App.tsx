import { Router, Route, Switch } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { JoinPage } from './pages/JoinPage';
import { JoinVendorPage } from './pages/JoinVendorPage';
import { JoinCustomerPage } from './pages/JoinCustomerPage';
import { VendorPage } from './pages/VendorPage';
import { ProductPage } from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { VendorSettingsPage } from './pages/VendorSettingsPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorInventoryPage from './pages/VendorInventoryPage';
import VendorRecipeCreatePage from './pages/VendorRecipeCreatePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { EventCoordinatorDashboardPage } from './pages/EventCoordinatorDashboardPage';
import { DropoffDashboardPage } from './pages/DropoffDashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { NotFound } from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/join" component={JoinPage} />
            <Route path="/join/vendor" component={JoinVendorPage} />
            <Route path="/join/customer" component={JoinCustomerPage} />
            <Route path="/vendor/:id" component={VendorPage} />
            <Route path="/product/:id" component={ProductPage} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard">
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/customer">
              <ProtectedRoute role="CUSTOMER">
                <CustomerDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor">
              <ProtectedRoute role="VENDOR">
                <VendorDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/site-settings">
              <ProtectedRoute role="VENDOR">
                <VendorSettingsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/products">
              <ProtectedRoute role="VENDOR">
                <VendorProductsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/inventory">
              <ProtectedRoute role="VENDOR">
                <VendorInventoryPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/recipes/create">
              <ProtectedRoute role="VENDOR">
                <VendorRecipeCreatePage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/admin">
              <ProtectedRoute role="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/event-coordinator">
              <ProtectedRoute role="EVENT_COORDINATOR">
                <EventCoordinatorDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/dropoff">
              <ProtectedRoute role="DROPOFF">
                <DropoffDashboardPage />
              </ProtectedRoute>
            </Route>
            
            <Route path="/events" component={EventsPage} />
            <Route path="/events/:id" component={EventDetailPage} />
          
          {/* Placeholder routes for future pages */}
          <Route path="/products">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
                <p className="text-gray-600">Product catalog coming soon...</p>
              </div>
            </div>
          </Route>
          
          <Route path="/artisans">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Artisans</h1>
                <p className="text-gray-600">Artisan profiles coming soon...</p>
              </div>
            </div>
          </Route>
          
          <Route path="/about">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">About</h1>
                <p className="text-gray-600">About page coming soon...</p>
              </div>
            </div>
          </Route>
          
          {/* Catch-all route for unhandled routes */}
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster position="top-right" />
    </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
