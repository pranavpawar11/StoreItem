import React, { useState, useEffect } from 'react';
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
  Layers ,
  ChartBar,
  Moon,
  Sun,
  X
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

// Dummy data
const initialPlans = [
  { id: 1, name: 'Basic', price: 29, subscribers: 45, features: ['5 Users', '10GB Storage', 'Basic Support'] },
  { id: 2, name: 'Pro', price: 99, subscribers: 78, features: ['25 Users', '50GB Storage', 'Priority Support'] },
  { id: 3, name: 'Enterprise', price: 299, subscribers: 33, features: ['Unlimited Users', '500GB Storage', '24/7 Support'] }
];

const initialMembers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', plan: 'Pro', status: 'Active', renewalDate: '2024-02-15' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'Basic', status: 'Active', renewalDate: '2024-02-20' },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', plan: 'Enterprise', status: 'Suspended', renewalDate: '2024-03-01' }
];

const Dashboard = () => {
  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState(initialPlans);
  const [members, setMembers] = useState(initialMembers);
  const [stats, setStats] = useState({
    activePlans: 4,
    totalMembers: 156,
    revenue: 12750,
    upcomingRenewals: 23
  });

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [newPlan, setNewPlan] = useState({ name: '', price: '', features: [''] });
  const [newMember, setNewMember] = useState({ name: '', email: '', plan: 'Basic', status: 'Active', renewalDate: '' });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Filter members based on search
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle plan creation
  const handleCreatePlan = () => {
    const plan = {
      id: plans.length + 1,
      ...newPlan,
      subscribers: 0,
      features: newPlan.features.filter(f => f !== '')
    };
    setPlans([...plans, plan]);
    setShowPlanModal(false);
    setNewPlan({ name: '', price: '', features: [''] });
  };

  // Handle member creation
  const handleCreateMember = () => {
    const member = {
      id: members.length + 1,
      ...newMember
    };
    setMembers([...members, member]);
    setShowMemberModal(false);
    setNewMember({ name: '', email: '', plan: 'Basic', status: 'Active', renewalDate: '' });
  };

  // Handle member deletion
  const handleDeleteMember = () => {
    setMembers(members.filter(m => m.id !== selectedItem.id));
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  // Plan Modal
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
            <label className="text-sm font-medium">Price ($/month)</label>
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

  // Member Modal
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
              value={newMember.plan}
              onChange={(e) => setNewMember({...newMember, plan: e.target.value})}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              {plans.map(plan => (
                <option key={plan.id} value={plan.name}>{plan.name}</option>
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

  // Delete Confirmation Modal
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
              <nav className="flex space-x-8">
                <a href="#" className="flex items-center text-gray-900 dark:text-white hover:text-blue-600">
                  <ChartBar className="w-5 h-5 mr-1" />
                  Dashboard
                </a>
                <a href="#" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600">
                  <Layers  className="w-5 h-5 mr-1" />
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
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">${stats.revenue}</p>
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

          {/* Previous code remains the same until Plans Section */}

          {/* Plans Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Subscription Plans</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="border dark:border-gray-700 rounded-lg p-6 dark:bg-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">${plan.price}/mo</p>
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
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.renewalDate}</td>
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