import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export interface AppOutletContext {
  toggleMobileMenu: () => void;
}

export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="app-container">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={closeMobileMenu} 
      />
      <main className="main-layout-content">
        <div className="content-inner-wrapper">
          <Outlet context={{ toggleMobileMenu } satisfies AppOutletContext} />
        </div>
      </main>
    </div>
  );
}
