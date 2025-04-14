import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiSettings, 
  FiMenu, 
  FiX,
  FiBell,
  FiUser
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
          <div className="text-xl font-bold">Bizify</div>
          <button 
            className="p-1 rounded-md lg:hidden hover:bg-blue-700"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          <Link 
            to="/" 
            className={`flex items-center px-6 py-3 hover:bg-blue-700 ${isActive('/')}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiHome className="mr-3" size={20} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/customers" 
            className={`flex items-center px-6 py-3 hover:bg-blue-700 ${isActive('/customers')}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiUsers className="mr-3" size={20} />
            <span>Customers</span>
          </Link>
          
          <Link 
            to="/invoices" 
            className={`flex items-center px-6 py-3 hover:bg-blue-700 ${isActive('/invoices')}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiFileText className="mr-3" size={20} />
            <span>Invoices</span>
          </Link>
          
          <Link 
            to="/settings" 
            className={`flex items-center px-6 py-3 hover:bg-blue-700 ${isActive('/settings')}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiSettings className="mr-3" size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <button 
            className="p-1 rounded-md lg:hidden hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <label className="switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="slider">
                <div className="star star_1"></div>
                <div className="star star_2"></div>
                <div className="star star_3"></div>
                <div className="cloud">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M381.7 225.9c0-97.6-52.5-130.8-101.6-138.2 0-.5.1-1 .1-1.6 0-12.3-10.9-22.1-24.2-22.1-13.3 0-23.8 9.8-23.8 22.1 0 .6 0 1.1.1 1.6-49.2 7.5-102 40.8-102 138.4 0 113.8-28.3 126-66.3 158h384c-37.8-32.1-66.3-44.4-66.3-158.2z" fill="#fff"/>
                  </svg>
                </div>
              </span>
            </label>

            <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <FiBell size={20} />
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FiUser size={16} />
              </div>
              <span className="ml-2 hidden md:inline-block">Admin User</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
