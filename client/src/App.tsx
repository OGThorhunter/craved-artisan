import { Router, Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { JoinVendorPage } from './pages/JoinVendorPage';
import { JoinCustomerPage } from './pages/JoinCustomerPage';
import { VendorPage } from './pages/VendorPage';
import { ProductPage } from './pages/ProductPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { EventCoordinatorDashboardPage } from './pages/EventCoordinatorDashboardPage';
import { DropoffDashboardPage } from './pages/DropoffDashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { NotFound } from './components/NotFound';

function App() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/join" component={JoinPage} />
          <Route path="/join/vendor" component={JoinVendorPage} />
          <Route path="/join/customer" component={JoinCustomerPage} />
          <Route path="/vendor/:id" component={VendorPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/dashboard/customer" component={CustomerDashboardPage} />
          <Route path="/dashboard/vendor" component={VendorDashboardPage} />
          <Route path="/dashboard/admin" component={AdminDashboardPage} />
          <Route path="/dashboard/event-coordinator" component={EventCoordinatorDashboardPage} />
          <Route path="/dashboard/dropoff" component={DropoffDashboardPage} />
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
    </Router>
  );
}

export default App;
