// src/components/layout/MainLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Receipt, 
  TrendingUp, 
  BadgeDollarSign,
  AlertTriangle,
  FileBarChart,
  UserCircle,
  LogOut
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', name: 'Inventory', icon: PackageSearch },
    { path: '/sales', name: 'Sales', icon: Receipt },
    { path: '/predictions', name: 'Stock Predictions', icon: TrendingUp },
    { path: '/brand-analysis', name: 'Brand Analysis', icon: BadgeDollarSign },
    { path: '/reports', name: 'Reports', icon: FileBarChart },
    { path: '/expiry-alerts', name: 'Expiry Alerts', icon: AlertTriangle },
    { path: '/profile', name: 'Profile', icon: UserCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-[#0077b6]">Inventory System</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm ${
                    isActive(item.path)
                      ? 'bg-[#0077b6] text-white'
                      : 'text-gray-700 hover:bg-[#f8f9fa]'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="border-t border-gray-200 p-4">
            <Link
              to="/logout"
              className="flex items-center text-gray-700 hover:text-[#d00000]"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
          </h2>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;