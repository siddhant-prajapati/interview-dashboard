import React from 'react';

interface StatusBadgeProps {
  status?: string;
  isActive?: boolean;
}

export default function StatusBadge({ status = 'Active', isActive }: StatusBadgeProps) {
  let variantClass = 'status-badge-active';

  if (typeof isActive === 'boolean') {
    variantClass = isActive ? 'status-badge-active' : 'status-badge-inactive';
  } else {
    const s = String(status).toUpperCase();
    if (['ACTIVE', 'PASSED', 'OFFER', 'COMPLETED'].includes(s)) {
      variantClass = 'status-badge-active';
    } else if (['INACTIVE', 'REJECTED', 'FAILED', 'WITHDRAWN'].includes(s)) {
      variantClass = 'status-badge-inactive';
    } else if (['APPLIED', 'SAVED'].includes(s)) {
      variantClass = 'status-badge-info';
    } else if (['HR_SCREENING', 'TECHNICAL_ROUND', 'MANAGERIAL_ROUND', 'HR_FINAL', 'SCHEDULED'].includes(s)) {
      variantClass = 'status-badge-purple';
    } else if (['ON_HOLD', 'NEEDS_REVISION'].includes(s)) {
      variantClass = 'status-badge-warning';
    }
  }

  const displayLabel = formatStatusLabel(status, isActive);

  return (
    <span className={`status-badge ${variantClass}`}>
      {displayLabel}
    </span>
  );
}

function formatStatusLabel(status?: string, isActive?: boolean): string {
  if (typeof isActive === 'boolean') {
    return isActive ? 'Active' : 'Inactive';
  }
  if (!status) return 'Active';

  const map: Record<string, string> = {
    APPLIED: 'Applied',
    SAVED: 'Saved',
    HR_SCREENING: 'HR Screening',
    TECHNICAL_ROUND: 'Tech Round',
    MANAGERIAL_ROUND: 'Managerial',
    HR_FINAL: 'HR Final',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    ON_HOLD: 'On Hold',
    WITHDRAWN: 'Withdrawn',
    SCHEDULED: 'Scheduled',
    PASSED: 'Passed',
    FAILED: 'Failed',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  };

  return map[status] || status;
}
