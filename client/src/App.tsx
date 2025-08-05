import { Router, Route, Switch } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ZipProvider } from './contexts/ZipContext';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { JoinPage } from './pages/JoinPage';
import { JoinVendorPage } from './pages/JoinVendorPage';
import { JoinCustomerPage } from './pages/JoinCustomerPage';
import { JoinB2BPage } from './pages/JoinB2BPage';
import { JoinCoordinatorPage } from './pages/JoinCoordinatorPage';
import { JoinDropoffPage } from './pages/JoinDropoffPage';
import VendorPage from './pages/VendorPage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import VendorDashboardPage from './pages/dashboard/vendor';
import { VendorSettingsPage } from './pages/VendorSettingsPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorInventoryPage from './pages/VendorInventoryPage';
import VendorRecipeCreatePage from './pages/VendorRecipeCreatePage';
import VendorRecipeEditPage from './pages/VendorRecipeEditPage';
import RecipeVersionHistoryPage from './pages/RecipeVersionHistoryPage';
import BatchPricingPage from './pages/BatchPricingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { EventCoordinatorDashboardPage } from './pages/EventCoordinatorDashboardPage';
import { DropoffDashboardPage } from './pages/DropoffDashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import CommunityPage from './pages/CommunityPage';
import MarketplacePage from './pages/MarketplacePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import VendorWatchlistPage from './pages/VendorWatchlistPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorDeliveryBatchingPage from './pages/VendorDeliveryBatchingPage';
import VendorDeliveryPage from './pages/VendorDeliveryPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import VendorAnalyticsPage from './pages/VendorAnalyticsPage';
import VendorAnalyticsKpiPage from './pages/dashboard/vendor/analytics';
import { VendorFinancialPage } from './pages/VendorFinancialPage';
import VendorOnboardingPage from './pages/VendorOnboardingPage';
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
        <CartProvider>
          <ZipProvider>
          <Router>
            <Layout>
            <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/join" component={JoinPage} />
            <Route path="/join/vendor" component={JoinVendorPage} />
            <Route path="/join/customer" component={JoinCustomerPage} />
            <Route path="/join/b2b" component={JoinB2BPage} />
            <Route path="/join/coordinator" component={JoinCoordinatorPage} />
            <Route path="/join/dropoff" component={JoinDropoffPage} />
            <Route path="/vendor/:id" component={VendorPage} />
            <Route path="/product/:id" component={ProductPage} />
            <Route path="/checkout" component={CheckoutPage} />
            
            {/* Public Pages */}
            <Route path="/marketplace" component={MarketplacePage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/community" component={CommunityPage} />
            <Route path="/events" component={EventsPage} />
            <Route path="/events/:id" component={EventDetailPage} />
            
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
            <Route path="/dashboard/customer/orders">
              <ProtectedRoute role="CUSTOMER">
                <CustomerOrdersPage />
              </ProtectedRoute>
            </Route>
            <Route path="/account/orders">
              <ProtectedRoute role="CUSTOMER">
                <CustomerOrdersPage />
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
            <Route path="/dashboard/vendor/recipes/:recipeId/edit">
              <ProtectedRoute role="VENDOR">
                <VendorRecipeEditPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/recipes/:recipeId/versions">
              <ProtectedRoute role="VENDOR">
                <RecipeVersionHistoryPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/batch-pricing">
              <ProtectedRoute role="VENDOR">
                <BatchPricingPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/watchlist">
              <ProtectedRoute role="VENDOR">
                <VendorWatchlistPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/orders">
              <ProtectedRoute role="VENDOR">
                <VendorOrdersPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/delivery-batching">
              <ProtectedRoute role="VENDOR">
                <VendorDeliveryBatchingPage />
              </ProtectedRoute>
            </Route>
            <Route path="/vendor/delivery/:batchId">
              <ProtectedRoute role="VENDOR">
                <VendorDeliveryPage />
              </ProtectedRoute>
            </Route>
            <Route path="/vendor/analytics/delivery">
              <ProtectedRoute role="VENDOR">
                <VendorAnalyticsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/analytics">
              <ProtectedRoute role="VENDOR">
                <VendorAnalyticsKpiPage />
              </ProtectedRoute>
            </Route>
            <Route path="/vendor/financial">
              <ProtectedRoute role="VENDOR">
                <VendorFinancialPage />
              </ProtectedRoute>
            </Route>
            <Route path="/vendor/onboarding">
              <ProtectedRoute role="VENDOR">
                <VendorOnboardingPage />
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
            <Route path="/community" component={CommunityPage} />
          
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
    </ZipProvider>
    </CartProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
