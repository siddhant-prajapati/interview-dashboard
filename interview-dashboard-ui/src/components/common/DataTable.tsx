import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  totalEntries?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (term: string) => void;
  onSortChange?: (sort: string) => void;
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  title = "All Applications",
  subtitle = "Active Pipeline",
  columns,
  data = [],
  totalEntries = 256000,
  currentPage = 1,
  pageSize = 8,
  onPageChange,
  onSearch,
  onSortChange,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const handleSortSelect = (option: string) => {
    setSortOption(option);
    setShowSortDropdown(false);
    if (onSortChange) onSortChange(option);
  };

  const displayedData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => {
      if (typeof val === 'string') return val.toLowerCase().includes(term);
      if (typeof val === 'object' && val !== null) {
        return Object.values(val).some(v => typeof v === 'string' && v.toLowerCase().includes(term));
      }
      return false;
    });
  });

  return (
    <div className="data-table-card">
      {/* Table Card Header */}
      <div className="table-card-header">
        <div className="table-header-titles">
          <h2 className="table-main-title">{title}</h2>
          {subtitle && <p className="table-subtitle">{subtitle}</p>}
        </div>

        <div className="table-header-controls">
          {/* Search Box */}
          <div className="table-search-box">
            <Search size={17} className="table-search-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="table-search-input"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="table-sort-wrapper">
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="table-sort-btn"
            >
              <span className="table-sort-label">Short by : </span>
              <span className="table-sort-value">{sortOption}</span>
              <ChevronDown size={16} color="#7E7E7E" className="table-sort-chevron" />
            </button>

            {showSortDropdown && (
              <div className="table-sort-menu">
                {['Newest', 'Oldest', 'Highest Salary', 'Company A-Z'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => handleSortSelect(opt)}
                    className={`table-sort-option ${sortOption === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {actions && <div className="table-custom-actions">{actions}</div>}
        </div>
      </div>

      {/* Table with responsive horizontal scrolling */}
      <div className="table-scroll-wrapper">
        <table className="custom-data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  No matching records found.
                </td>
              </tr>
            ) : (
              displayedData.map((row, idx) => (
                <tr 
                  key={row.id || idx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'table-row-clickable' : ''}
                >
                  {columns.map((col) => {
                    let cellContent: any = row[col.key];

                    if (col.key.includes('.')) {
                      const keys = col.key.split('.');
                      cellContent = row[keys[0]]?.[keys[1]];
                    }

                    if (col.render) {
                      cellContent = col.render(row);
                    }

                    return (
                      <td key={col.key}>
                        {cellContent !== undefined && cellContent !== null ? cellContent : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination-footer">
        <span className="pagination-info">
          Showing data 1 to {Math.min(pageSize, displayedData.length)} of {totalEntries ? (totalEntries > 1000 ? `${Math.round(totalEntries/1000)}k` : totalEntries) : displayedData.length} entries
        </span>

        <div className="pagination-btns-wrapper">
          <button
            type="button"
            className="pagination-arrow-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <button type="button" className="pagination-page-btn active">1</button>
          <button type="button" className="pagination-page-btn">2</button>
          <button type="button" className="pagination-page-btn">3</button>
          <button type="button" className="pagination-page-btn">4</button>
          <span className="pagination-dots">...</span>
          <button type="button" className="pagination-page-btn">40</button>

          <button
            type="button"
            className="pagination-arrow-btn"
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
