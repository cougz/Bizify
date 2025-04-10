import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiBell
} from 'react-icons/fi';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-md transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed h-full z-10`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-primary-color">Bizify</h1>
          ) : (
            <h1 className="text-xl font-bold text-primary-color">B</h1>
          )}
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
        
        <nav className="mt-6">
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-blue-50 text-primary-color' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <FiHome size={20} />
            {sidebarOpen && <span className="ml-4">Dashboard</span>}
          </NavLink>
          
          <NavLink 
            to="/dashboard/customers" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-blue-50 text-primary-color' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <FiUsers size={20} />
            {sidebarOpen && <span className="ml-4">Customers</span>}
          </NavLink>
          
          <NavLink 
            to="/dashboard/invoices" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-blue-50 text-primary-color' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <FiFileText size={20} />
            {sidebarOpen && <span className="ml-4">Invoices</span>}
          </NavLink>
          
          <NavLink 
            to="/dashboard/settings" 
            className={({ isActive }) => 
              `flex items-center p-4 ${isActive ? 'bg-blue-50 text-primary-color' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <FiSettings size={20} />
            {sidebarOpen && <span className="ml-4">Settings</span>}
          </NavLink>
          
          <button 
            onClick={handleLogout}
            className="flex items-center p-4 w-full text-left text-gray-600 hover:bg-gray-100"
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {/* Page title could be dynamic based on route */}
            Dashboard
          </h2>
          
          <div className="flex items-center">
            <button className="p-2 mr-4 text-gray-500 hover:text-gray-700 relative">
              <FiBell size={20} />
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                3
              </span>
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-color rounded-full flex items-center justify-center text-white font-semibold mr-2">
                {user?.name.charAt(0)}
              </div>
              {sidebarOpen && (
                <span className="text-sm font-medium">{user?.name}</span>
              )}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
