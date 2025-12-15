import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shield, LayoutDashboard, ScanLine, FileText, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-primary-600 mr-3" />
                  <span className="text-xl font-bold text-gray-900">
                    Quantum Crypto Analyzer
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/scan"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition"
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                    New Scan
                  </Link>
                  <Link
                    to="/reports"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route
                path="/reports"
                element={
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports</h2>
                    <p className="text-gray-600">Report generation coming soon</p>
                  </div>
                }
              />
              <Route
                path="*"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">404 - Page Not Found</h2>
                    <Link to="/" className="text-primary-600 hover:text-primary-700">
                      Return to Dashboard
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-sm text-gray-600">
                © 2025 Quantum-Resistant Crypto Analyzer. Enterprise Security Platform.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;