import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  X,
  User as UserIcon,
  Globe,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import ProfileModal from '../profile/ProfileModal';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Key, exact: true },
    { to: '/applications', label: 'Applications', icon: Users, hasSub: true },
    { to: '/interviews', label: 'Interviews', icon: Calendar, hasSub: true },
    { to: '/companies', label: 'Companies', icon: Briefcase, hasSub: true },
    { to: '/preparation', label: 'Preparation', icon: BookOpen, hasSub: true },
    { to: '/questions', label: 'Questions', icon: HelpCircle, hasSub: true },
    { to: '/profile', label: 'Profile', icon: UserIcon, hasSub: false },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleNavClick = () => {
    setIsDropdownOpen(false);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const getInitials = (name?: string, username?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (username) return username.slice(0, 2).toUpperCase();
    return 'SP';
  };

  const displayName = currentUser?.name || 'Siddhant Prajapati';
  const displayRole = currentUser?.roles && currentUser.roles.length > 0
    ? `${currentUser.roles[0]}${currentUser.experience ? ` • ${currentUser.experience}y` : ''}`
    : 'Java Developer';

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

        {/* Footer User Profile Section with Interactive Popover */}
        <div className="sidebar-user-section" ref={dropdownRef}>
          {isDropdownOpen && (
            <div className="user-dropdown-popover">
              <div className="user-dropdown-header">
                <span className="user-dropdown-header-name">{displayName}</span>
                <span className="user-dropdown-header-email">{currentUser?.email || 'sidkp.official@gmail.com'}</span>
                <span className="user-security-badge">User ID: #{currentUser?.id || 1} (Active)</span>
              </div>

              <div className="user-dropdown-menu-list">
                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profile');
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  <UserIcon size={16} color="#5932EA" />
                  <span>View Full Profile</span>
                </button>

                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit3 size={16} color="#5932EA" />
                  <span>Quick Edit Profile</span>
                </button>

                <div className="user-dropdown-divider" />

                {currentUser?.portfolioLink && (
                  <a
                    href={currentUser.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-dropdown-item external"
                  >
                    <Globe size={16} />
                    <span>Portfolio</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {currentUser?.githubLink && (
                  <a
                    href={currentUser.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-dropdown-item external"
                  >
                    <GithubIcon size={16} />
                    <span>GitHub</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {currentUser?.linkedInLink && (
                  <a
                    href={currentUser.linkedInLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-dropdown-item external"
                  >
                    <LinkedinIcon size={16} />
                    <span>LinkedIn</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            className={`user-card-button ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-label="Toggle user profile options"
          >
            <div className="user-avatar-badge">
              {getInitials(currentUser?.name, currentUser?.username)}
            </div>
            <div className="user-card-info">
              <span className="user-card-name">{displayName}</span>
              <span className="user-card-sub">{displayRole}</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`user-card-chevron ${isDropdownOpen ? 'open' : ''}`} 
            />
          </button>
        </div>
      </aside>

      {/* Profile Modal for Quick Edit/View */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
