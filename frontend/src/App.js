import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import CalendarView from './components/CalendarView';
import AgendaView from './components/AgendaView';
import '@/App.css';

// Context for authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// API Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.baseURL = API;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(user));
      login(user);
      toast({ title: "Login successful", description: `Welcome back, ${user.name}!` });
      navigate('/'); // Navigate to dashboard after successful login
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-emerald-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Family Budget
          </h1>
          <p className="text-gray-600 mt-2">Manage your household finances</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-800 mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-emerald-700">
            <div>👑 Owner: harish@budget.app</div>
            <div>🤝 Co-owner: spouse@budget.app</div>
            <div>👁️ Guest: guest@budget.app</div>
            <div className="text-emerald-600 font-medium mt-1">Password: budget123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast({ 
        title: "Error loading dashboard", 
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'text-emerald-600 bg-emerald-100';
      case 'coowner': return 'text-cyan-600 bg-cyan-100';
      case 'guest': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return '👑';
      case 'coowner': return '🤝';
      case 'guest': return '👁️';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Family Budget
              </h1>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getRoleIcon(user.role)}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <button
                data-testid="logout-button"
                onClick={logout}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Monthly Income</p>
                  <p className="text-3xl font-bold text-emerald-600">€{stats.total_income.toLocaleString()}</p>
                </div>
                <div className="text-3xl text-emerald-500">💰</div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Monthly Expenses</p>
                  <p className="text-3xl font-bold text-red-600">€{stats.total_expenses.toLocaleString()}</p>
                </div>
                <div className="text-3xl text-red-500">💸</div>
              </div>
            </div>
            
            <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${stats.monthly_surplus >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Monthly Surplus</p>
                  <p className={`text-3xl font-bold ${stats.monthly_surplus >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    €{stats.monthly_surplus.toLocaleString()}
                  </p>
                </div>
                <div className="text-3xl">{stats.monthly_surplus >= 0 ? '📈' : '📉'}</div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Savings Rate</p>
                  <p className="text-3xl font-bold text-cyan-600">{stats.savings_rate}%</p>
                </div>
                <div className="text-3xl text-cyan-500">🎯</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Category Breakdown */}
        {stats && stats.category_breakdown && Object.keys(stats.category_breakdown).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Expense Breakdown
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.category_breakdown).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="font-bold text-red-600">€{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Bills */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Upcoming Bills
              </h2>
              <div className="space-y-3">
                {stats.upcoming_bills && stats.upcoming_bills.length > 0 ? (
                  stats.upcoming_bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-700">{bill.name}</span>
                        <p className="text-sm text-gray-500">Due: {bill.due_day}th of month</p>
                      </div>
                      <span className="font-bold text-orange-600">€{bill.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming bills</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Transactions */}
        {stats && stats.recent_transactions && stats.recent_transactions.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💳</span>
              Recent Transactions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-600">Date</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Description</th>
                    <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-600">{txn.date}</td>
                      <td className="py-3 text-gray-800">{txn.description || 'Transaction'}</td>
                      <td className="py-3 text-right font-semibold text-gray-800">€{txn.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Role-based Features Notice */}
        {user.role === 'guest' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              <div>
                <h3 className="font-bold text-amber-800">Read-Only Access</h3>
                <p className="text-amber-700 mt-1">
                  You have guest access and can view financial data but cannot make changes. Contact the account owner for additional permissions.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {(user.role === 'owner' || user.role === 'coowner') && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🚀</span>
              <div>
                <h3 className="font-bold text-emerald-800">Coming Soon: Full Feature Set</h3>
                <p className="text-emerald-700 mt-1">
                  Advanced features including AI-powered forecasting, transaction management, budget planning, and detailed analytics are being developed.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Main App
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route 
              path="/login" 
              element={<Login />} 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;