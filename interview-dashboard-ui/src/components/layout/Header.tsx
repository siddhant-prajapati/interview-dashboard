import React from 'react';
import { Search, Menu } from 'lucide-react';

interface HeaderProps {
  greeting?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  placeholder?: string;
  actionButton?: React.ReactNode;
  onToggleMobileMenu?: () => void;
}

export default function Header({ 
  greeting = "Hello Evano 👋,", 
  searchValue = "", 
  onSearchChange,
  placeholder = "Search",
  actionButton,
  onToggleMobileMenu,
}: HeaderProps) {
  return (
    <header className="header-bar">
      <div className="header-left">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="mobile-menu-btn"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} color="#292D32" />
          </button>
        )}
        <h1 className="header-greeting">{greeting}</h1>
      </div>
      
      <div className="header-right">
        <div className="header-search-box">
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="header-search-input"
          />
        </div>

        {actionButton && (
          <div className="header-action-wrapper">
            {actionButton}
          </div>
        )}
      </div>
    </header>
  );
}
