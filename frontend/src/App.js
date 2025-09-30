import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import CalendarView from './components/CalendarView';
import AgendaView from './components/AgendaView';
import QuickAddMenu from './components/QuickAddMenu';
import CategoriesManagement from './components/CategoriesManagement';
import EditableSalaryCard from './components/EditableSalaryCard';
import EditableBillCard from './components/EditableBillCard';
import QuickExpenseEntry from './components/QuickExpenseEntry';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
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
            <div>🤝 Co-owner: durgabhavani@budget.app</div>
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
  const [agendaData, setAgendaData] = useState({ events: [], upcoming_bills: [] });
  const [currentSalaries, setCurrentSalaries] = useState({});
  const [bills, setBills] = useState([]);
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const fetchDashboardStats = async () => {
    try {
      const [statsResponse, agendaResponse, usersResponse, billsResponse] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/agenda?days=7'),
        user.role === 'owner' ? axios.get('/users') : Promise.resolve({ data: [] }),
        axios.get('/bills')
      ]);
      
      setStats(statsResponse.data);
      setCurrentSalaries(statsResponse.data.current_salaries || {});
      setAgendaData(agendaResponse.data);
      setBills(billsResponse.data);
      if (usersResponse.data.length > 0) {
        setAllUsers(usersResponse.data);
      }
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

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    try {
      await axios.post('/auth/change-password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      toast({ title: 'Password changed successfully!' });
      setShowPasswordDialog(false);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast({
        title: 'Error changing password',
        description: error.response?.data?.detail || 'Failed to change password',
        variant: 'destructive'
      });
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
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Dashboard
                </a>
                <a 
                  href="/calendar"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Calendar
                </a>
                <a 
                  href="/agenda"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Agenda
                </a>
                <a 
                  href="/categories"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Categories
                </a>
              </nav>
              
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                aria-label="Toggle mobile menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                  <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
                </div>
              </button>

              {/* User info & logout */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowPasswordDialog(true)}
                  className="hidden sm:flex text-gray-600 hover:text-emerald-600"
                >
                  <span className="mr-2">🔑</span>
                  Change Password
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <span className="mr-2">🚪</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-emerald-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <a 
                href="/"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <a 
                href="/calendar"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Calendar
              </a>
              <a 
                href="/agenda"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Agenda
              </a>
              <a 
                href="/categories"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </a>
              
              {/* Mobile Quick Add */}
              {user.role !== 'guest' && (
                <Button
                  onClick={() => {
                    setShowQuickAdd(true);
                    setMobileMenuOpen(false);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg mt-4"
                >
                  <span className="mr-2">⚡</span>
                  Quick Add
                </Button>
              )}
              
              {/* Mobile Change Password */}
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPasswordDialog(true);
                  setMobileMenuOpen(false);
                }}
                className="sm:hidden text-gray-600 hover:text-emerald-600 justify-start px-0"
              >
                <span className="mr-2">🔑</span>
                Change Password
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Events & Bills Widget */}
        {agendaData && (agendaData.events.length > 0 || agendaData.upcoming_bills.length > 0) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              This Week's Schedule
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🗓️</span>
                  Events ({agendaData.events.length})
                </h3>
                <div className="space-y-2">
                  {agendaData.events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-800">{event.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(event.start).toLocaleDateString()} at {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-emerald-200 text-emerald-800 rounded-full">
                          {event.tags[0]}
                        </span>
                      )}
                    </div>
                  ))}
                  {agendaData.events.length > 3 && (
                    <div className="text-center">
                      <a href="/agenda" className="text-sm text-emerald-600 hover:text-emerald-700">
                        +{agendaData.events.length - 3} more events
                      </a>
                    </div>
                  )}
                  {agendaData.events.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No events this week</p>
                  )}
                </div>
              </div>

              {/* Upcoming Bills */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">💳</span>
                  Bills Due ({agendaData.upcoming_bills.length})
                </h3>
                <div className="space-y-2">
                  {agendaData.upcoming_bills.slice(0, 3).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-800">{bill.name}</div>
                        <div className="text-sm text-gray-600">Due: {new Date(bill.due_date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">€{bill.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {agendaData.upcoming_bills.length > 3 && (
                    <div className="text-center">
                      <a href="/agenda" className="text-sm text-red-600 hover:text-red-700">
                        +{agendaData.upcoming_bills.length - 3} more bills
                      </a>
                    </div>
                  )}
                  {agendaData.upcoming_bills.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No bills due this week</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Individual Salary Management */}
        {(user.role === 'owner' || user.role === 'coowner') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Monthly Salaries - Current Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current User's Salary */}
              <EditableSalaryCard
                user={user}
                currentSalary={currentSalaries[user.id]?.amount || 0}
                onSalaryUpdated={fetchDashboardStats}
              />
              
              {/* Other User's Salary (Display Only) */}
              {Object.entries(currentSalaries)
                .filter(([userId, _]) => userId !== user.id)
                .map(([userId, salaryData]) => (
                <div key={userId} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-cyan-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 flex items-center">
                        <span className="mr-2">💰</span>
                        {salaryData.name}'s Salary
                      </p>
                      <p className="text-3xl font-bold text-cyan-600 mt-1">
                        €{parseFloat(salaryData.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Read-only view</p>
                    </div>
                    <div className="text-3xl text-cyan-500">💼</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Household Income */}
            <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">Combined Household Income</p>
                <p className="text-4xl font-bold text-emerald-600 mt-2">
                  €{Object.values(currentSalaries).reduce((sum, salary) => sum + parseFloat(salary.amount), 0).toLocaleString()}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </p>
              </div>
            </div>
          </div>
        )}

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
            
            {/* Monthly Bills - All Editable */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2">💳</span>
                  Monthly Bills
                </h2>
                <div className="flex space-x-2">
                  {user.role !== 'guest' && (
                    <Button
                      onClick={() => setShowQuickExpense(true)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <span className="mr-1">💰</span>
                      Add Expense
                    </Button>
                  )}
                  {user.role !== 'guest' && (
                    <Button
                      onClick={() => {
                        // Create a new bill 
                        setShowQuickExpense(true); // Reuse the expense form with recurring option
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      <span className="mr-1">➕</span>
                      Add Bill
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bills && bills.length > 0 ? (
                  bills.map((bill) => (
                    <div key={bill.id} className="relative">
                      <EditableBillCard
                        bill={bill}
                        onBillUpdated={fetchDashboardStats}
                        userRole={user.role}
                      />
                      {user.role !== 'guest' && (
                        <Button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${bill.name}"?`)) {
                              try {
                                await axios.delete(`/bills/${bill.id}`);
                                toast({ title: 'Bill deleted successfully' });
                                fetchDashboardStats();
                              } catch (error) {
                                toast({ 
                                  title: 'Error deleting bill', 
                                  variant: 'destructive' 
                                });
                              }
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <p className="text-gray-500 text-center py-8">No bills found</p>
                  </div>
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
                <h3 className="font-bold text-emerald-800">Advanced Features Available</h3>
                <p className="text-emerald-700 mt-1">
                  Full transaction management, calendar planning, category customization, and household budgeting tools are now active.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quick Add Menu Dialog */}
      <QuickAddMenu 
        user={user}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={fetchDashboardStats}
      />

      <QuickExpenseEntry
        isOpen={showQuickExpense}
        onClose={() => setShowQuickExpense(false)}
        onExpenseAdded={fetchDashboardStats}
      />

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <Input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, old_password: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <Input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <Input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordChange}
                disabled={!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agenda" 
              element={
                <ProtectedRoute>
                  <AgendaPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <CategoriesPage />
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

// Calendar Page with Layout
const CalendarPage = () => {
  const { user, logout } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const fetchDashboardStats = () => {
    toast({ title: 'Transaction added successfully!' });
  };

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
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Dashboard
                </a>
                <a 
                  href="/calendar"
                  className="text-emerald-600 font-medium"
                >
                  Calendar
                </a>
                <a 
                  href="/agenda"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Agenda
                </a>
                <a 
                  href="/categories"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Categories
                </a>
              </nav>
              
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                aria-label="Toggle mobile menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                  <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
                </div>
              </button>

              {/* User info & logout */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <span className="mr-2">🚪</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CalendarView user={user} />
      
      <QuickAddMenu 
        user={user}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={fetchDashboardStats}
      />
    </div>
  );
};

// Agenda Page with Layout
const AgendaPage = () => {
  const { user, logout } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { toast } = useToast();

  const fetchDashboardStats = () => {
    toast({ title: 'Transaction added successfully!' });
  };

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
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Dashboard
                </a>
                <a 
                  href="/calendar"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Calendar
                </a>
                <a 
                  href="/agenda"
                  className="text-emerald-600 font-medium"
                >
                  Agenda
                </a>
                <a 
                  href="/categories"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Categories
                </a>
              </nav>
              
              {user.role !== 'guest' && (
                <Button
                  onClick={() => setShowQuickAdd(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <span className="mr-2">💰</span>
                  Quick Add
                </Button>
              )}

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

      <AgendaView user={user} />
      
      <QuickAddMenu 
        user={user}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={fetchDashboardStats}
      />
    </div>
  );
};

// Categories Page with Layout
const CategoriesPage = () => {
  const { user, logout } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { toast } = useToast();

  const fetchDashboardStats = () => {
    // Placeholder for refreshing dashboard stats after transactions
    toast({ title: 'Transaction added successfully!' });
  };

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
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Dashboard
                </a>
                <a 
                  href="/calendar"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Calendar
                </a>
                <a 
                  href="/agenda"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                >
                  Agenda
                </a>
                <a 
                  href="/categories"
                  className="text-emerald-600 font-medium"
                >
                  Categories
                </a>
              </nav>
              
              {user.role !== 'guest' && (
                <Button
                  onClick={() => setShowQuickAdd(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <span className="mr-2">💰</span>
                  Quick Add
                </Button>
              )}

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

      <CategoriesManagement user={user} />

      <QuickAddMenu 
        user={user}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={fetchDashboardStats}
      />
    </div>
  );
};

export default App;
