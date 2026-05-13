import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/circular', icon: '📄', label: 'Circular' },
    { path: '/memorandum', icon: '📝', label: 'Memorandum' },
    { path: '/policy', icon: '📋', label: 'Policy' },
    { path: '/archive', icon: '🗄️', label: 'Archive' },
    { path: '/hidden', icon: ' ', label: 'Hidden' },
    { path: '/users', icon: '👥', label: 'Users' },
  ];

  const userMenuItems = [
    { path: '/user-dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/user-circular', icon: '📄', label: 'Circular' },
    { path: '/user-memorandum', icon: '📝', label: 'Memorandum' },
    { path: '/user-policy', icon: '📋', label: 'Policy' },
    { path: '/user-archive', icon: '🗄️', label: 'Archive' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <h2>eCircular</h2>
        <span className="sidebar-subtitle">Management</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/dashboard' || item.path === '/user-dashboard'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-role">{user?.role || 'Administrator'}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🚪 Logout
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;