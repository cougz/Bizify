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

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
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
            <button className="p-1 rounded-full hover:bg-gray-100">
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
