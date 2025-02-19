import React, { useState, useEffect } from "react";
import {
  Users,
  Package,
  IndianRupee,
  Calendar,
  Search,
  Plus,
  Archive,
  UserPlus,
  BarChart3,
  Settings,
  Filter,
} from "lucide-react";

const MembershipDashboard = () => {
  // State management
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);

  // Form states
  const [newPlan, setNewPlan] = useState({ name: "", price: "", features: "" });
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    planId: "",
    renewalDate: "",
  });

  // API calls
  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/membership/stats"
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/membership/plans"
      );
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);

      const response = await fetch(
        `http://localhost:5000/api/membership/members?${queryParams}`
      );
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        ...newPlan,
        features: newPlan.features.split(",").map((f) => f.trim()),
        price: Number(newPlan.price),
      };

      const response = await fetch(
        "http://localhost:5000/api/membership/plans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(planData),
        }
      );

      if (response.ok) {
        setNewPlan({ name: "", price: "", features: "" });
        fetchPlans();
      }
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/membership/members",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMember),
        }
      );

      if (response.ok) {
        setNewMember({ name: "", email: "", planId: "", renewalDate: "" });
        fetchMembers();
      }
    } catch (error) {
      console.error("Error creating member:", error);
    }
  };

  const handleUpdateStatus = async (memberId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/membership/members/${memberId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/membership/members/${memberId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchMembers();
        }
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPlans();
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">StoreItem Admin</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm ${
                activeTab === "dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("plans")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm ${
                activeTab === "plans"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Package className="w-5 h-5 mr-3" />
              Plans
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm ${
                activeTab === "members"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Members
            </button>
            {/* <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </button> */}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNewMemberModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Stat Cards */}
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Members
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats?.totalMembers || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-green-500 font-medium">
                      ↑ 12%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs last month
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Active Plans
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats?.activePlans || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-green-500 font-medium">
                      ↑ 4%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs last month
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Monthly Revenue
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                      ₹{stats?.revenue || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <IndianRupee className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-green-500 font-medium">
                      ↑ 8%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs last month
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Upcoming Renewals
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats?.upcomingRenewals || 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-red-500 font-medium">
                      ↓ 2%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      vs last month
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Members */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Members
                  </h2>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500">
                        <th className="pb-4">Name</th>
                        <th className="pb-4">Plan</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.slice(0, 5).map((member) => (
                        <tr
                          key={member.memberId}
                          className="border-t border-gray-100"
                        >
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                {member.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {member.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-gray-900">
                              {plans.find((p) => p.planId === member.planId)
                                ?.name || "N/A"}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full 
                              ${
                                member.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                              ${
                                member.status === "Suspended"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                              }
                              ${
                                member.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : ""
                              }`}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-gray-500">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "plans" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Membership Plans
                </h2>
                <button
                  onClick={() => setShowNewPlanModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.planId}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <span className="text-2xl font-bold text-gray-900">
                      ₹{plan.price}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Features:</p>
                      <ul className="mt-2 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Active Subscribers
                        </span>
                        <span className="font-semibold text-gray-900">
                          {plan.subscribers || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Members
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Renewal Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.memberId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {plans.find((p) => p.planId === member.planId)
                              ?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                          ₹
                            { plans.find((p) => p.planId === member.planId)
                              ?.price || 0}
                            /month
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              member.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              member.status === "Suspended"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                            ${
                              member.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.renewalDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <select
                              value={member.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  member.memberId,
                                  e.target.value
                                )
                              }
                              className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Active">Active</option>
                              <option value="Suspended">Suspended</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() =>
                                handleDeleteMember(member.memberId)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Plan
            </h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={newPlan.price}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (comma-separated)
                </label>
                <textarea
                  value={newPlan.features}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, features: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Member Modal */}
      {showNewMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Member
            </h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={newMember.planId}
                  onChange={(e) =>
                    setNewMember({ ...newMember, planId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.map((plan) => (
                    <option key={plan.planId} value={plan.planId}>
                      {plan.name} - ₹{plan.price}/month
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Date
                </label>
                <input
                  type="date"
                  value={newMember.renewalDate}
                  onChange={(e) =>
                    setNewMember({ ...newMember, renewalDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewMemberModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipDashboard;
