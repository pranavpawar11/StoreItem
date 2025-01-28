import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Bell,
  Settings,
  Users,
  LifeBuoy,
  Layers,
  ChartBar,
  Moon,
  Sun,
  X,
  LogOut,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/UI/Membershio-Dialog";
import { Button } from "../components/UI/Mebership-buttons";
import { Input } from "../components/UI/Membership-Input";
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/membership';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    activePlans: 0,
    totalMembers: 0,
    revenue: 0,
    upcomingRenewals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [newPlan, setNewPlan] = useState({ name: '', price: '', features: [''] });
  const [newMember, setNewMember] = useState({ 
    name: '', 
    email: '', 
    planId: '', 
    status: 'Active', 
    renewalDate: '' 
  });

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // API Configuration
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch Data Functions
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error(err);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch (err) {
      setError('Failed to fetch plans');
      console.error(err);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await api.get('/members', {
        params: { search: searchTerm }
      });
      setMembers(response.data);
    } catch (err) {
      setError('Failed to fetch members');
      console.error(err);
    }
  }, [searchTerm]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStats(), fetchPlans(), fetchMembers()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchStats, fetchPlans, fetchMembers]);

  // Handle plan creation
  const handleCreatePlan = async () => {
    try {
      const response = await api.post('/plans', newPlan);
      setPlans([...plans, response.data]);
      setShowPlanModal(false);
      setNewPlan({ name: '', price: '', features: [''] });
      await fetchStats(); // Refresh stats
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create plan');
    }
  };

  // Handle member creation
  const handleCreateMember = async () => {
    try {
      const response = await api.post('/members', newMember);
      setMembers([...members, response.data]);
      setShowMemberModal(false);
      setNewMember({ name: '', email: '', planId: '', status: 'Active', renewalDate: '' });
      await fetchStats(); // Refresh stats
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create member');
    }
  };

  // Handle member deletion
  const handleDeleteMember = async () => {
    try {
      await api.delete(`/members/${selectedItem.memberId}`);
      setMembers(members.filter(m => m.memberId !== selectedItem.memberId));
      setShowDeleteModal(false);
      setSelectedItem(null);
      await fetchStats(); // Refresh stats
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete member');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Plan Modal Component
  const PlanModal = () => (
    <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogDescription>Add a new subscription plan to your service.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Plan Name</label>
            <Input
              value={newPlan.name}
              onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
              placeholder="Enter plan name"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Price (₹/month)</label>
            <Input
              type="number"
              value={newPlan.price}
              onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
              placeholder="Enter price"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Features</label>
            {newPlan.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...newPlan.features];
                    newFeatures[index] = e.target.value;
                    setNewPlan({...newPlan, features: newFeatures});
                  }}
                  placeholder="Enter feature"
                />
                <button
                  onClick={() => {
                    const newFeatures = newPlan.features.filter((_, i) => i !== index);
                    setNewPlan({...newPlan, features: newFeatures});
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setNewPlan({...newPlan, features: [...newPlan.features, '']})}
              className="mt-2"
            >
              Add Feature
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPlanModal(false)}>Cancel</Button>
          <Button onClick={handleCreatePlan}>Create Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Member Modal Component
  const MemberModal = () => (
    <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>Create a new member account.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              placeholder="Enter name"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              placeholder="Enter email"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Plan</label>
            <select
              value={newMember.planId}
              onChange={(e) => setNewMember({...newMember, planId: e.target.value})}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select a plan</option>
              {plans.map(plan => (
                <option key={plan.planId} value={plan.planId}>{plan.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Renewal Date</label>
            <Input
              type="date"
              value={newMember.renewalDate}
              onChange={(e) => setNewMember({...newMember, renewalDate: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowMemberModal(false)}>Cancel</Button>
          <Button onClick={handleCreateMember}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Delete Confirmation Modal Component
  const DeleteModal = () => (
    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this member? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteMember}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Main JSX
  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">ServiceHub</span>
              </div>
              <nav className="flex items-center space-x-8">
                <a href="#" className="flex items-center text-gray-900 dark:text-white hover:text-blue-600">
                  <ChartBar className="w-5 h-5 mr-1" />
                  Dashboard
                </a>
                <a href="#" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600">
                  <Layers className="w-5 h-5 mr-1" />
                  Plans
                </a>
                <a href="#" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600">
                  <Users className="w-5 h-5 mr-1" />
                  Members
                </a>
                <a href="#" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600">
                  <LifeBuoy className="w-5 h-5 mr-1" />
                  Support
                </a>
                <a href="#" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600">
                  <Settings className="w-5 h-5 mr-1" />
                  Settings
                </a>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="relative">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600"
                  >
                    <LogOut className="w-5 h-5 mr-1" />
                    Logout
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button 
                onClick={() => setError(null)}
                className="float-right"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Plans</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.activePlans}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Members</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalMembers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Revenue</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">₹ {stats.revenue}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Upcoming Renewals</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.upcomingRenewals}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mb-6">
            <Button onClick={() => setShowPlanModal(true)} className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Plan
            </Button>
            <Button onClick={() => setShowMemberModal(true)} className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Plans Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Subscription Plans</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.planId} className="border dark:border-gray-700 rounded-lg p-6 dark:bg-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">₹ {plan.price}/mo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.subscribers} subscribers</p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <span className="mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Members</h2>
              <div className="mt-4 flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Renewal Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {members.map(member => (
                    <tr key={member.memberId}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {plans.find(p => p.planId === member.planId)?.name || 'Unknown Plan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {new Date(member.renewalDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedItem(member);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      
      {/* Render Modals */}
      <PlanModal />
      <MemberModal />
      <DeleteModal />
    </div>
  );
};

export default Dashboard;