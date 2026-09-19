import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = '580px' }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="modal-box-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <h3 className="modal-title-text">{title}</h3>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} color="#7E7E7E" />
          </button>
        </div>
        <div className="modal-body-content">
          {children}
        </div>
      </div>
    </div>
  );
}
