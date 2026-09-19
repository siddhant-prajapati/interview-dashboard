import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Key, 
  Users, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown,
  Hexagon,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Key, exact: true },
    { to: '/applications', label: 'Applications', icon: Users, hasSub: true },
    { to: '/interviews', label: 'Interviews', icon: Calendar, hasSub: true },
    { to: '/companies', label: 'Companies', icon: Briefcase, hasSub: true },
    { to: '/preparation', label: 'Preparation', icon: BookOpen, hasSub: true },
    { to: '/questions', label: 'Questions', icon: HelpCircle, hasSub: true },
  ];

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobile} 
          aria-hidden="true" 
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="brand-container">
          <div className="logo-badge">
            <Hexagon size={26} color="#000000" strokeWidth={2.2} />
            <div className="inner-dot" />
          </div>
          <div className="brand-text-wrapper">
            <span className="brand-title">Dashboard</span>
            <span className="brand-version">v.01</span>
          </div>

          {/* Close button visible on mobile */}
          {isMobileOpen && (
            <button 
              onClick={onCloseMobile} 
              className="sidebar-close-btn"
              aria-label="Close Navigation"
            >
              <X size={20} color="#7E7E7E" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <div className="nav-link-left">
                      <Icon 
                        size={20} 
                        color={isActive ? '#FFFFFF' : '#9197B3'} 
                        strokeWidth={isActive ? 2.4 : 1.8}
                      />
                      <span className="nav-link-label">
                        {item.label}
                      </span>
                    </div>
                    {item.hasSub && (
                      <ChevronRight 
                        size={16} 
                        color={isActive ? '#FFFFFF' : '#B5B7C0'} 
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Profile Card */}
        <div className="user-card">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            alt="Evano Avatar"
            className="user-avatar"
          />
          <div className="user-info">
            <h4 className="user-name">Evano</h4>
            <p className="user-role">Candidate & Lead</p>
          </div>
          <ChevronDown size={18} color="#757575" className="user-chevron" />
        </div>
      </aside>
    </>
  );
}
