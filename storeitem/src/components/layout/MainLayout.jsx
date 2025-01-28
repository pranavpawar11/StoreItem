import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Redirect user to login page if not logged in
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login");
    }
  }, [navigate]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const navigationItems = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/inventory", name: "Inventory", icon: PackageSearch },
    { path: "/sales", name: "Sales", icon: ShoppingCart },
    { path: "/predictions", name: "Stock Predictions", icon: TrendingUpDown },
    {
      path: "/brand-analysis",
      name: "Brand Analysis",
      icon: ChartNoAxesCombined,
    },
    { path: "/reports", name: "Reports", icon: FileBarChart },
    { path: "/expiry-alerts", name: "Expiry Alerts", icon: AlertTriangle },
    { path: "/profile", name: "Profile", icon: UserCircle },
    // { path: "/membership", name: "Membership", icon: UserCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("darkMode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("darkMode", "false");
      }
      return newMode;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 shadow-sm">
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#0077b6] to-[#00b4d8]">
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
                    ${
                      active
                        ? "bg-[#0077b6] text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <div
                    className={`p-1.5 rounded-md ${
                      active
                        ? "bg-white bg-opacity-20"
                        : "group-hover:bg-[#0077b6] group-hover:bg-opacity-10"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "" : "group-hover:text-[#0077b6]"
                      }`}
                    />
                  </div>
                  <span className="ml-3 font-medium">{item.name}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Dark Mode Toggle & Logout Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center px-3 py-2.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200 group w-full"
              >
               <div className="p-1.5 rounded-md text-gray-900 dark:text-gray-200 hover:bg-gray-300 group-hover:bg-gray-600 group-hover:text-white dark:group-hover:text-white">

                  {darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </div>
                <span className="ml-3 font-medium text-gray-900 dark:text-gray-300 hover:text-gray-50 dark:hover:text-gray-50">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
            </div>
            <Link
              to="/login"
              className="flex items-center px-3 py-2.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 transition-colors duration-200 group"
              onClick={() => {
                localStorage.removeItem("authToken");
              }}
            >
              <div className="p-1.5 rounded-md group-hover:bg-red-100 dark:group-hover:bg-red-900">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="ml-3 font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500">
                Logout
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Fixed Header */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              {navigationItems.find((item) => isActive(item.path))?.icon &&
                React.createElement(
                  navigationItems.find((item) => isActive(item.path))?.icon,
                  {
                    className: "w-6 h-6 mr-3 text-[#0077b6]",
                  }
                )}
              {navigationItems.find((item) => isActive(item.path))?.name ||
                "Dashboard"}
            </h2>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[#0077b6] hover:text-white transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#0077b6] dark:text-blue-400" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area with proper spacing */}
        <main className="pt-16 min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
