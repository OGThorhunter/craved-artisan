import { Router, Route, Switch } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ZipProvider } from './contexts/ZipContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/Layout';
import MaintenanceGate from './components/MaintenanceGate';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VendorStorefrontPage from './pages/VendorStorefrontPage';
import DashboardPage from './pages/DashboardPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CartPage from './pages/CartPage';
import { VendorSettingsPage } from './pages/VendorSettingsPage';
import EnhancedVendorProductsPage from './pages/EnhancedVendorProductsPage';
import RecipeManagementPage from './pages/RecipeManagementPage';
import VendorInventoryPage from './pages/VendorInventoryPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorPromotionsPage from './pages/VendorPromotionsPage';
import TemplateEditorPage from './pages/labels/TemplateEditorPage';
// import VendorLabelManagementPage from './pages/VendorLabelManagementPage'; // File doesn't exist
import VendorLabelsPackagingPage from './pages/VendorLabelsPackagingPage';
import PackageTemplateMappingPage from './pages/PackageTemplateMappingPage';
import VendorRecipeCreatePage from './pages/VendorRecipeCreatePage';
import VendorRecipeEditPage from './pages/VendorRecipeEditPage';
import RecipeVersionHistoryPage from './pages/RecipeVersionHistoryPage';
import BatchPricingPage from './pages/BatchPricingPage';
import VendorEventsPage from './pages/vendor/VendorEventsPage';
import VendorFinancialsPage from './pages/vendor/VendorFinancialsPage';
import PulsePage from './pages/dashboard/vendor/PulsePage';

import DemoStorefrontPage from './pages/vendor/DemoStorefrontPage';
import EventCoordinatorDashboardPage from './pages/EventCoordinatorDashboardPage';
import DropoffDashboardPage from './pages/DropoffDashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import RecipeToolPage from './pages/RecipeToolPage';
import EventDetailPage from './pages/EventDetailPage';
import CommunityPage from './pages/CommunityPage';
import MarketplaceSearchPage from './pages/MarketplaceSearchPage';
import MarketplaceVendorPage from './pages/MarketplaceVendorPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import EventsSearchPage from './pages/EventsSearchPage';
import EventsHomePage from './pages/EventsHomePage';
import EventsCoordinatorConsole from './pages/EventsCoordinatorConsole';
import AdminDashboard from './pages/AdminDashboard';
import UsersListPage from './pages/control/UsersListPage';
import UserDetailPage from './pages/control/UserDetailPage';
import SupportPage from './pages/control/SupportPage';
import SettingsPage from './pages/admin/SettingsPage';

// Wave 4: New admin pages
import AdminDashboardNew from './pages/dashboard/admin/AdminDashboard';
import UsersList from './pages/dashboard/admin/UsersList';
import UserDetail from './pages/dashboard/admin/UserDetail';
import Support from './pages/dashboard/admin/Support';
import Settings from './pages/dashboard/admin/Settings';

// Wave 4: New coordinator pages
import CoordinatorDashboard from './pages/dashboard/coordinator/CoordinatorDashboard';
import EventInventory from './pages/dashboard/coordinator/EventInventory';

// Wave 4: New dropoff page
import DropoffDashboard from './pages/dashboard/dropoff/DropoffDashboard';

// Wave 4: System pages
import NotFound from './pages/system/NotFound';
import Maintenance from './pages/system/Maintenance';
import ComingSoon from './pages/system/ComingSoon';
import VendorWatchlistPage from './pages/VendorWatchlistPage';
import VendorSalesWindowsPage from './pages/VendorSalesWindowsPage';
import VendorDeliveryBatchingPage from './pages/VendorDeliveryBatchingPage';
import VendorDeliveryPage from './pages/VendorDeliveryPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import MaintenancePage from './pages/MaintenancePage';
import ComingSoonPage from './pages/ComingSoonPage';
// Wave 4: System pages (consolidated)
import VendorAnalyticsPage from './pages/VendorAnalyticsPage';
import VendorAnalyticsCRMPage from './pages/VendorAnalyticsCRMPage';
import { VendorFinancialPage } from './pages/VendorFinancialPage';
import VendorOnboardingPage from './pages/VendorOnboardingPage';
import VIPProgramPage from './pages/VIPProgramPage';
import TestDataPage from './pages/TestDataPage';
import { NotFound } from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import JoinMovement from './pages/public/JoinMovement';
import VendorStorefront from './pages/public/VendorStorefront';
import ProductDetail from './pages/public/ProductDetail';
import MarketplaceHome from './pages/public/MarketplaceHome';

// Wave 2: New auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';

// Wave 2: New customer pages
import CustomerDashboard from './pages/dashboard/customer/CustomerDashboard';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import CheckoutSuccess from './pages/customer/CheckoutSuccess';

// Wave 3: New vendor pages
import VendorDashboard from './pages/dashboard/vendor/VendorDashboard';
import VendorProducts from './pages/dashboard/vendor/Products';
import VendorInventory from './pages/dashboard/vendor/Inventory';
import VendorOrders from './pages/dashboard/vendor/Orders';
import VendorRecipes from './pages/dashboard/vendor/Recipes';

// SEO-optimized pages
import ArtisanSourdoughGeorgiaPage from './pages/seo/ArtisanSourdoughGeorgiaPage';
import TopHandmadeSoapsAtlantaPage from './pages/seo/TopHandmadeSoapsAtlantaPage';

// Legal pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

function App() {
  return (
    <AuthProvider>
      <MaintenanceGate>
        <CartProvider>
          <ZipProvider>
            <NotificationProvider>
              <Router>
                <Layout>
            <Switch>
            <Route path="/" component={Home} />
            <Route path="/coming-soon" component={ComingSoon} />
            
            <Route path="/test">
              <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-blue-900 mb-4">Test Page Working!</h1>
                  <p className="text-blue-700">If you can see this, React is loading correctly.</p>
                  <a href="/" className="text-blue-600 underline">Go to Home</a>
                </div>
              </div>
            </Route>
            {/* Wave 2: New auth routes */}
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/verify-email" component={VerifyEmail} />
            {/* Legacy routes (for backward compatibility) */}
            <Route path="/auth/login" component={LoginPage} />
            <Route path="/auth/signup" component={SignupPage} />
            <Route path="/auth/verify-email" component={VerifyEmailPage} />
            {/* Join Movement Page */}
            <Route path="/join" component={JoinMovement} />
            {/* Vendor and Product Public Pages */}
            <Route path="/vendor/:id" component={VendorStorefront} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/vendors/:vendorId" component={VendorStorefrontPage} />
            <Route path="/store/artisan-bakes-atlanta" component={DemoStorefrontPage} />
            <Route path="/test-data" component={TestDataPage} />
            {/* Legacy checkout routes (for backward compatibility) */}
            <Route path="/checkout/legacy" component={CheckoutPage} />
            <Route path="/checkout/legacy/success" component={CheckoutSuccessPage} />
            
            {/* Public Pages */}
            <Route path="/marketplace" component={MarketplaceHome} />
            <Route path="/marketplace/search" component={MarketplaceSearchPage} />
            <Route path="/marketplace/vendor/:slug" component={MarketplaceVendorPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/privacy" component={PrivacyPolicyPage} />
            <Route path="/terms" component={TermsOfServicePage} />
            <Route path="/community" component={CommunityPage} />
            <Route path="/events" component={EventsHomePage} />
            <Route path="/events/search" component={EventsSearchPage} />
            <Route path="/events/:slug" component={EventDetailPage} />
            <Route path="/events/coordinator" component={EventsCoordinatorConsole} />
            <Route path="/admin">
              {() => {
                window.location.href = '/dashboard/admin';
                return null;
              }}
            </Route>
            {/* Wave 4: New admin routes */}
            <Route path="/control/users">
              <ProtectedRoute role="ADMIN">
                <UsersList />
              </ProtectedRoute>
            </Route>
            <Route path="/control/users/:id">
              <ProtectedRoute role="ADMIN">
                <UserDetail />
              </ProtectedRoute>
            </Route>
            <Route path="/control/support" component={Support} />
            <Route path="/control/support/:id" component={Support} />
            <Route path="/control/settings">
              <ProtectedRoute role="ADMIN">
                <Settings />
              </ProtectedRoute>
            </Route>
            {/* Legacy admin routes */}
            <Route path="/control/users/legacy" component={UsersListPage} />
            <Route path="/control/users/:id/legacy" component={UserDetailPage} />
            <Route path="/control/support/legacy" component={SupportPage} />
            <Route path="/control/support/:id/legacy" component={SupportPage} />
            <Route path="/control/settings/legacy" component={SettingsPage} />
            <Route path="/search" component={AdvancedSearchPage} />
            <Route path="/help" component={KnowledgeBasePage} />
            <Route path="/recipes" component={RecipeToolPage} />
            <Route path="/cart" component={CartPage} />
            
            {/* SEO-optimized pages */}
            <Route path="/artisan-sourdough-in-georgia" component={ArtisanSourdoughGeorgiaPage} />
            <Route path="/top-handmade-soaps-in-atlanta" component={TopHandmadeSoapsAtlantaPage} />
            
            {/* Wave 4: System pages */}
            <Route path="/404" component={NotFound} />
            <Route path="/maintenance" component={Maintenance} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard">
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </Route>
            {/* Wave 2: New customer routes */}
            <Route path="/dashboard/customer">
              <ProtectedRoute role="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/cart">
              <ProtectedRoute role="CUSTOMER">
                <Cart />
              </ProtectedRoute>
            </Route>
            <Route path="/checkout" component={Checkout} />
            <Route path="/checkout/success" component={CheckoutSuccess} />
            {/* Legacy routes (for backward compatibility) */}
            <Route path="/dashboard/customer/legacy">
              <ProtectedRoute role="CUSTOMER">
                <CustomerDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/cart/legacy">
              <ProtectedRoute role="CUSTOMER">
                <CartPage />
              </ProtectedRoute>
            </Route>
            {/* Wave 4: Coordinator routes */}
            <Route path="/dashboard/event-coordinator">
              <ProtectedRoute role="EVENT_COORDINATOR">
                <CoordinatorDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/event-coordinator/events/:eventId/inventory">
              <ProtectedRoute role="EVENT_COORDINATOR">
                <EventInventory />
              </ProtectedRoute>
            </Route>
            {/* Legacy coordinator route */}
            <Route path="/dashboard/event-coordinator/legacy">
              <ProtectedRoute role="EVENT_COORDINATOR">
                <EventCoordinatorDashboardPage />
              </ProtectedRoute>
            </Route>
            
            {/* Wave 4: Dropoff route */}
            <Route path="/dashboard/dropoff">
              <ProtectedRoute role="DROPOFF_MANAGER">
                <DropoffDashboard />
              </ProtectedRoute>
            </Route>
            {/* Legacy dropoff route */}
            <Route path="/dashboard/dropoff/legacy">
              <ProtectedRoute role="DROPOFF_MANAGER">
                <DropoffDashboardPage />
              </ProtectedRoute>
            </Route>
            
            {/* Wave 4: Admin routes */}
            <Route path="/dashboard/admin">
              <ProtectedRoute role="ADMIN">
                <AdminDashboardNew />
              </ProtectedRoute>
            </Route>
            {/* Legacy admin route */}
            <Route path="/dashboard/admin/legacy">
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            </Route>
            {/* Wave 3: New vendor routes */}
            <Route path="/dashboard/vendor">
              <ProtectedRoute role="VENDOR">
                <VendorDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/products">
              <ProtectedRoute role="VENDOR">
                <VendorProducts />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/inventory">
              <ProtectedRoute role="VENDOR">
                <VendorInventory />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/orders">
              <ProtectedRoute role="VENDOR">
                <VendorOrders />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/recipes">
              <ProtectedRoute role="VENDOR">
                <VendorRecipes />
              </ProtectedRoute>
            </Route>
            {/* Legacy vendor routes (for backward compatibility) */}
            <Route path="/dashboard/vendor/site-settings">
              <ProtectedRoute role="VENDOR">
                <VendorSettingsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/recipes/legacy">
              <ProtectedRoute role="VENDOR">
                <RecipeManagementPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/inventory/legacy">
              <ProtectedRoute role="VENDOR">
                <VendorInventoryPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/orders/legacy">
              <ProtectedRoute role="VENDOR">
                <VendorOrdersPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/labels">
              <ProtectedRoute role="VENDOR">
                <VendorLabelsPackagingPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/promotions">
              <ProtectedRoute role="VENDOR">
                <VendorPromotionsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/labels/editor">
              <ProtectedRoute role="VENDOR">
                <TemplateEditorPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/package-templates">
              <ProtectedRoute role="VENDOR">
                <PackageTemplateMappingPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/events">
              <ProtectedRoute role="VENDOR">
                <VendorEventsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/financials">
              <ProtectedRoute role="VENDOR">
                <VendorFinancialsPage />
              </ProtectedRoute>
            </Route>

            <Route path="/store/:storeSlug">
              <DemoStorefrontPage />
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
            <Route path="/dashboard/vendor/analytics-crm">
              <ProtectedRoute role="VENDOR">
                <VendorAnalyticsCRMPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/vip-program">
              <ProtectedRoute role="VENDOR">
                <VIPProgramPage />
              </ProtectedRoute>
            </Route>

            {/* Add missing vendor dashboard routes */}
            <Route path="/dashboard/vendor/sales-windows">
              <ProtectedRoute role="VENDOR">
                <VendorSalesWindowsPage />
              </ProtectedRoute>
            </Route>
            
            

            <Route path="/dashboard/vendor/pulse">
              <ProtectedRoute role="VENDOR">
                <PulsePage />
              </ProtectedRoute>
            </Route>

            {/* Settings Route */}
            <Route path="/settings">
              <ProtectedRoute>
                <SettingsPage />
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
          
          {/* Catch-all route for unhandled routes */}
          <Route component={NotFound} />
              </Switch>
            </Layout>
            <Toaster position="top-right" />
          </Router>
        </NotificationProvider>
      </ZipProvider>
      </CartProvider>
      </MaintenanceGate>
    </AuthProvider>
  );
}

export default App;
