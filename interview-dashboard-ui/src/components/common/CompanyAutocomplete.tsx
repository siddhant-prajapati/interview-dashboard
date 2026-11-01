import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, MapPin, Check, Database } from 'lucide-react';
import { Company } from '../../types';
import { companiesApi } from '../../api/companiesApi';

export interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string, company?: Company) => void;
  onSelectCompany?: (company: Company) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const CompanyAutocomplete: React.FC<CompanyAutocompleteProps> = ({
  value,
  onChange,
  onSelectCompany,
  placeholder = 'e.g. Microsoft, Google, SmartBear...',
  required = false,
  className = 'modal-input-field',
  name = 'companyName',
  id,
  disabled = false,
  autoFocus = false,
}) => {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load companies from backend/mock store
  useEffect(() => {
    let isMounted = true;
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const res = await companiesApi.getAll({ size: 100 });
        if (isMounted && res && res.content) {
          setAllCompanies(res.content);
        }
      } catch (err) {
        console.warn('Failed to load companies for autocomplete:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter recommendations based on current input value
  const suggestions = useMemo(() => {
    const query = (value || '').trim().toLowerCase();
    if (!query) {
      // Show up to 8 available companies from database as initial recommendations
      return allCompanies.slice(0, 8);
    }
    return allCompanies.filter((comp) =>
      comp.name.toLowerCase().includes(query)
    );
  }, [allCompanies, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLDivElement>('.company-autocomplete-item');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleSelect = (company: Company) => {
    onChange(company.name, company);
    if (onSelectCompany) {
      onSelectCompany(company);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Helper to highlight matching text
  const renderHighlightedName = (name: string, query: string) => {
    if (!query.trim()) return name;
    const q = query.trim();
    const index = name.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return name;

    const before = name.substring(0, index);
    const match = name.substring(index, index + q.length);
    const after = name.substring(index + q.length);

    return (
      <>
        {before}
        <strong className="company-autocomplete-highlight">{match}</strong>
        {after}
      </>
    );
  };

  return (
    <div className="company-autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!isOpen) setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={className}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
      />

      {isOpen && (
        <div className="company-autocomplete-dropdown" ref={listRef}>
          <div className="company-autocomplete-header">
            <span className="company-autocomplete-header-title">
              <Database size={11} style={{ marginRight: 4 }} />
              {value.trim() ? 'Database Recommendations' : 'Available Companies in Database'}
            </span>
            <span className="company-autocomplete-header-count">
              {suggestions.length} found
            </span>
          </div>

          <div className="company-autocomplete-list">
            {suggestions.length > 0 ? (
              suggestions.map((company, index) => {
                const isSelected =
                  company.name.toLowerCase() === (value || '').trim().toLowerCase();
                const isActive = index === activeIndex;

                return (
                  <div
                    key={company.id || company.name}
                    className={`company-autocomplete-item ${
                      isActive ? 'active' : ''
                    } ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(company)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="company-autocomplete-item-left">
                      <div className="company-autocomplete-icon-box">
                        <Building2 size={14} className="company-autocomplete-icon" />
                      </div>
                      <div className="company-autocomplete-info">
                        <div className="company-autocomplete-name">
                          {renderHighlightedName(company.name, value)}
                        </div>
                        {company.location && (
                          <div className="company-autocomplete-meta">
                            <MapPin size={10} style={{ marginRight: 2 }} />
                            <span>{company.location}</span>
                            {company.workOn && (
                              <span className="company-autocomplete-workon">
                                • {company.workOn}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="company-autocomplete-item-right">
                      {isSelected ? (
                        <Check size={14} className="company-autocomplete-check-icon" />
                      ) : (
                        <span className="company-autocomplete-select-hint">Select</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="company-autocomplete-empty">
                <span>No existing companies found matching &ldquo;{value}&rdquo;</span>
                <p className="company-autocomplete-empty-sub">
                  You can still keep typing to use this new company name.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
