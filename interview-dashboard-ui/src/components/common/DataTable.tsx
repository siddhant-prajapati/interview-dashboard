import React, { useState, useEffect, useMemo } from 'react';
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
  serverSide?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  title = "All Applications",
  subtitle = "Active Pipeline",
  columns,
  data = [],
  totalEntries,
  currentPage: controlledPage,
  pageSize: initialPageSize = 8,
  onPageChange,
  onSearch,
  onSortChange,
  actions,
  onRowClick,
  serverSide = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [internalPage, setInternalPage] = useState(controlledPage || 1);

  // Sync internal page if controlledPage changes
  useEffect(() => {
    if (controlledPage !== undefined) {
      setInternalPage(controlledPage);
    }
  }, [controlledPage]);

  // Sync internal page size if initialPageSize prop changes
  useEffect(() => {
    if (initialPageSize) {
      setPageSize(initialPageSize);
    }
  }, [initialPageSize]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setInternalPage(1);
    if (onSearch) onSearch(val);
    if (onPageChange && controlledPage !== undefined) onPageChange(1);
  };

  const handleSortSelect = (option: string) => {
    setSortOption(option);
    setShowSortDropdown(false);
    if (onSortChange) onSortChange(option);
  };

  // 1. Client-side search filtering (only applies when serverSide is false or as initial filter)
  const filteredData = useMemo(() => {
    if (serverSide || !searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) => {
      return Object.values(row).some((val) => {
        if (typeof val === 'string') return val.toLowerCase().includes(term);
        if (typeof val === 'number') return String(val).toLowerCase().includes(term);
        if (typeof val === 'object' && val !== null) {
          return Object.values(val).some(
            (v) => (typeof v === 'string' || typeof v === 'number') && String(v).toLowerCase().includes(term)
          );
        }
        return false;
      });
    });
  }, [data, searchTerm, serverSide]);

  // 2. Client-side sorting (when not serverSide)
  const sortedData = useMemo(() => {
    if (serverSide || !filteredData || filteredData.length === 0) return filteredData;
    const list = [...filteredData];

    switch (sortOption) {
      case 'Newest':
        return list.sort((a, b) => {
          const dateA = a.applyDate || a.postingDate || a.listedDate || a.interviewDate || a.createdAt || a.id || 0;
          const dateB = b.applyDate || b.postingDate || b.listedDate || b.interviewDate || b.createdAt || b.id || 0;
          return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
        });
      case 'Oldest':
        return list.sort((a, b) => {
          const dateA = a.applyDate || a.postingDate || a.listedDate || a.interviewDate || a.createdAt || a.id || 0;
          const dateB = b.applyDate || b.postingDate || b.listedDate || b.interviewDate || b.createdAt || b.id || 0;
          return dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
        });
      case 'Highest Salary':
        return list.sort((a, b) => {
          const parseSalary = (val: any) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
              const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
              return isNaN(num) ? 0 : num;
            }
            return 0;
          };
          return parseSalary(b.expectedSalary) - parseSalary(a.expectedSalary);
        });
      case 'Company A-Z':
        return list.sort((a, b) => {
          const nameA = a.companyName || a.company?.name || a.name || a.candidateName || '';
          const nameB = b.companyName || b.company?.name || b.name || b.candidateName || '';
          return nameA.localeCompare(nameB);
        });
      default:
        return list;
    }
  }, [filteredData, sortOption, serverSide]);

  // Determine total item count
  const totalItems = useMemo(() => {
    if (serverSide && totalEntries !== undefined && totalEntries !== 256000) {
      return totalEntries;
    }
    // If user filtered via internal search, total is based on filtered matches
    if (searchTerm.trim() !== '') {
      return sortedData.length;
    }
    // Otherwise use provided totalEntries if reasonable, or fallback to current data count
    if (totalEntries !== undefined && totalEntries !== 256000) {
      return totalEntries;
    }
    return sortedData.length;
  }, [serverSide, totalEntries, searchTerm, sortedData.length]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Determine active page
  const isControlled = controlledPage !== undefined && onPageChange !== undefined;
  const activePage = Math.min(Math.max(1, isControlled ? controlledPage : internalPage), totalPages);

  // Clamp internal page if totalPages changes
  useEffect(() => {
    if (!isControlled && internalPage > totalPages) {
      setInternalPage(totalPages);
    }
  }, [internalPage, totalPages, isControlled]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === activePage) return;
    if (!isControlled) {
      setInternalPage(newPage);
    }
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    if (!isControlled) {
      setInternalPage(1);
    }
    if (onPageChange) {
      onPageChange(1);
    }
  };

  // Slice data for display (if client-side)
  const displayedRows = useMemo(() => {
    if (serverSide) return sortedData;
    const startIndex = (activePage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [serverSide, sortedData, activePage, pageSize]);

  // Calculate entry range for footer info
  const startRecord = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + displayedRows.length - 1, totalItems);

  // Generate pagination button sequence (e.g. [1, 2, 3, 4, 5, '...', 40])
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (activePage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (activePage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages];
  }, [totalPages, activePage]);

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
              placeholder="Search in table..."
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
              <span className="table-sort-label">Sort by : </span>
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
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  No matching records found.
                </td>
              </tr>
            ) : (
              displayedRows.map((row, idx) => (
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
        <div className="pagination-info-group">
          <span className="pagination-info">
            Showing data {startRecord} to {endRecord} of {totalItems.toLocaleString()} entries
          </span>

          <div className="pagination-page-size-selector">
            <span className="page-size-label">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-select"
              aria-label="Rows per page"
            >
              {[5, 8, 10, 20, 50].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pagination-btns-wrapper">
          <button
            type="button"
            className="pagination-arrow-btn"
            disabled={activePage <= 1}
            onClick={() => handlePageChange(activePage - 1)}
            aria-label="Previous Page"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {paginationItems.map((item, idx) => {
            if (item === '...') {
              return (
                <span key={`dots-${idx}`} className="pagination-dots">
                  ...
                </span>
              );
            }
            const pageNum = item as number;
            const isActive = pageNum === activePage;
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                className={`pagination-page-btn ${isActive ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            className="pagination-arrow-btn"
            disabled={activePage >= totalPages}
            onClick={() => handlePageChange(activePage + 1)}
            aria-label="Next Page"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
