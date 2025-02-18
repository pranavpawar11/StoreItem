import React from 'react';
import { ChartBar, Layers, Users, LifeBuoy, Settings, Moon, Sun, LogOut } from 'lucide-react';

const Header = ({ darkMode, setDarkMode, handleLogout }) => {
  return (
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
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;