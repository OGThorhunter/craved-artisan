import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotFound } from './components/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Craved Artisan
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Welcome to the artisan marketplace
                </p>
                <div className="space-x-4">
                  <button className="btn-primary">
                    Explore Products
                  </button>
                  <button className="btn-secondary">
                    Meet Artisans
                  </button>
                </div>
              </div>
            </div>
          } />
          
          {/* Add more routes here as needed */}
          <Route path="/products" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Products
                </h1>
                <p className="text-gray-600">Product catalog coming soon...</p>
              </div>
            </div>
          } />
          
          <Route path="/artisans" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Artisans
                </h1>
                <p className="text-gray-600">Artisan profiles coming soon...</p>
              </div>
            </div>
          } />
          
          <Route path="/about" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  About
                </h1>
                <p className="text-gray-600">About page coming soon...</p>
              </div>
            </div>
          } />
          
          {/* Catch-all route for unhandled routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
