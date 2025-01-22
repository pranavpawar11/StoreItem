import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  TrendingUpDown, 
  ChartNoAxesCombined,
  AlertTriangle,
  FileBarChart,
  UserCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  // Color palette
  // eslint-disable-next-line
  const colors = {
    primary: '#0077b6',
    secondary: '#00b4d8',
    accent: '#caf0f8',
    background: '#f8f9fa',
    danger: '#ef233c'
  };

  const navigationItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', name: 'Inventory', icon: PackageSearch },
    { path: '/sales', name: 'Sales', icon: ShoppingCart },
    { path: '/predictions', name: 'Stock Predictions', icon: TrendingUpDown },
    { path: '/brand-analysis', name: 'Brand Analysis', icon: ChartNoAxesCombined },
    { path: '/reports', name: 'Reports', icon: FileBarChart },
    { path: '/expiry-alerts', name: 'Expiry Alerts', icon: AlertTriangle },
    { path: '/profile', name: 'Profile', icon: UserCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 shadow-sm">
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-[#0077b6] to-[#00b4d8]">
            <h1 className="text-xl font-bold text-white">Inventory System</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg mb-1 transition-all duration-200 group
                    ${active 
                      ? 'bg-[#0077b6] text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-blue-50'
                    }`}
                >
                  <div className={`p-1.5 rounded-md ${active ? 'bg-white bg-opacity-20' : 'group-hover:bg-[#0077b6] group-hover:bg-opacity-10'}`}>
                    <Icon className={`w-5 h-5 ${active ? '' : 'group-hover:text-[#0077b6]'}`} />
                  </div>
                  <span className="ml-3 font-medium">{item.name}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <Link
              to="/logout"
              className="flex items-center px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 group"
            >
              <div className="p-1.5 rounded-md group-hover:bg-red-100">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="ml-3 font-medium">Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Fixed Header */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-20 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              {navigationItems.find(item => isActive(item.path))?.icon && 
                React.createElement(navigationItems.find(item => isActive(item.path))?.icon, {
                  className: 'w-6 h-6 mr-3 text-[#0077b6]'
                })
              }
              {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
            </h2>
            
            {/* You can add header actions here */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-[#0077b6]" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area with proper spacing */}
        <main className="pt-16 min-h-screen bg-[#f8f9fa]">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;