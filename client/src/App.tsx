import { Router, Route, Switch } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ZipProvider } from './contexts/ZipContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/Layout';
import MaintenanceGate from './components/MaintenanceGate';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { JoinPage } from './pages/JoinPage';
import { JoinVendorPage } from './pages/JoinVendorPage';
import { JoinCustomerPage } from './pages/JoinCustomerPage';
import { JoinB2BPage } from './pages/JoinB2BPage';
import { JoinCoordinatorPage } from './pages/JoinCoordinatorPage';
import { JoinDropoffPage } from './pages/JoinDropoffPage';
import VendorPage from './pages/VendorPage';
import ProductPage from './pages/ProductPage';
import VendorStorefrontPage from './pages/VendorStorefrontPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CartPage from './pages/CartPage';
import { VendorSettingsPage } from './pages/VendorSettingsPage';
import VendorProductsPage from './pages/VendorProductsPage';
import EnhancedVendorProductsPage from './pages/EnhancedVendorProductsPage';
import RecipeManagementPage from './pages/RecipeManagementPage';
import VendorInventoryPage from './pages/VendorInventoryPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorPromotionsPage from './pages/VendorPromotionsPage';
import LabelProfilesPage from './pages/LabelProfilesPage';
import TemplateEditorPage from './pages/labels/TemplateEditorPage';
import VendorLabelManagementPage from './pages/VendorLabelManagementPage';
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
import MarketplaceHomePage from './pages/MarketplaceHomePage';
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
import VendorWatchlistPage from './pages/VendorWatchlistPage';
import VendorSalesWindowsPage from './pages/VendorSalesWindowsPage';
import VendorDeliveryBatchingPage from './pages/VendorDeliveryBatchingPage';
import VendorDeliveryPage from './pages/VendorDeliveryPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import MaintenancePage from './pages/MaintenancePage';
import VendorAnalyticsPage from './pages/VendorAnalyticsPage';
import VendorAnalyticsCRMPage from './pages/VendorAnalyticsCRMPage';
import { VendorFinancialPage } from './pages/VendorFinancialPage';
import VendorOnboardingPage from './pages/VendorOnboardingPage';
import VIPProgramPage from './pages/VIPProgramPage';
import TestDataPage from './pages/TestDataPage';
import { NotFound } from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="/" component={HomePage} />
            <Route path="/test">
              <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-blue-900 mb-4">Test Page Working!</h1>
                  <p className="text-blue-700">If you can see this, React is loading correctly.</p>
                  <a href="/" className="text-blue-600 underline">Go to Home</a>
                </div>
              </div>
            </Route>
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/verify-email" component={VerifyEmailPage} />
            <Route path="/join" component={JoinPage} />
            <Route path="/join/vendor" component={JoinVendorPage} />
            <Route path="/join/customer" component={JoinCustomerPage} />
            <Route path="/join/b2b" component={JoinB2BPage} />
            <Route path="/join/coordinator" component={JoinCoordinatorPage} />
            <Route path="/join/dropoff" component={JoinDropoffPage} />
            <Route path="/vendor/:id" component={VendorPage} />
            <Route path="/product/:id" component={ProductPage} />
            <Route path="/vendors/:vendorId" component={VendorStorefrontPage} />
            <Route path="/store/artisan-bakes-atlanta" component={DemoStorefrontPage} />
            <Route path="/test-data" component={TestDataPage} />
            <Route path="/product/:productId" component={ProductDetailPage} />
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/checkout/success" component={CheckoutSuccessPage} />
            
            {/* Public Pages */}
            <Route path="/marketplace" component={MarketplaceHomePage} />
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
            <Route path="/control/users" component={UsersListPage} />
            <Route path="/control/users/:id" component={UserDetailPage} />
            <Route path="/control/support" component={SupportPage} />
            <Route path="/control/support/:id" component={SupportPage} />
            <Route path="/control/settings" component={SettingsPage} />
            <Route path="/search" component={AdvancedSearchPage} />
            <Route path="/help" component={KnowledgeBasePage} />
            <Route path="/recipes" component={RecipeToolPage} />
            <Route path="/cart" component={CartPage} />
            
            {/* SEO-optimized pages */}
            <Route path="/artisan-sourdough-in-georgia" component={ArtisanSourdoughGeorgiaPage} />
            <Route path="/top-handmade-soaps-in-atlanta" component={TopHandmadeSoapsAtlantaPage} />
            
            {/* Error Pages */}
            <Route path="/404" component={NotFoundPage} />
            <Route path="/maintenance" component={MaintenancePage} />
            
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
            <Route path="/cart">
              <ProtectedRoute role="CUSTOMER">
                <CartPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/event-coordinator">
              <ProtectedRoute role="EVENT_COORDINATOR">
                <EventCoordinatorDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/event-coordinator/events/:eventId/inventory">
              <ProtectedRoute role="EVENT_COORDINATOR">
                <InventoryPage eventId="evt_1" />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/dropoff">
              <ProtectedRoute role="DROPOFF_MANAGER">
                <DropoffDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/admin">
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
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
            <Route path="/dashboard/vendor/recipes">
              <ProtectedRoute role="VENDOR">
                <RecipeManagementPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/enhanced-products">
              <ProtectedRoute role="VENDOR">
                <EnhancedVendorProductsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/inventory">
              <ProtectedRoute role="VENDOR">
                <VendorInventoryPage />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard/vendor/orders">
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
            <Route path="/dashboard/vendor/labels">
              <ProtectedRoute role="VENDOR">
                <LabelProfilesPage />
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
            <Route path="/dashboard/admin">
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
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
            
            <Route path="/events" component={EventDetailPage} />
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
        </NotificationProvider>
      </ZipProvider>
      </CartProvider>
      </MaintenanceGate>
    </AuthProvider>
  );
}

export default App;
