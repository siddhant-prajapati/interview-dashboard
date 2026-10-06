import React, { useState, useEffect } from 'react';
import { X, Calendar, Target, CheckCircle2, Flame, Save } from 'lucide-react';

interface SetDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationsCountToday?: number;
}

export default function SetDayModal({
  isOpen,
  onClose,
  applicationsCountToday = 3,
}: SetDayModalProps) {
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('daily_app_goal');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [targetDate, setTargetDate] = useState<string>(() => {
    const saved = localStorage.getItem('target_app_date');
    return saved || new Date().toISOString().split('T')[0];
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('daily_app_goal', String(dailyGoal));
    localStorage.setItem('target_app_date', targetDate);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const progressPercent = Math.min(100, Math.round((applicationsCountToday / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="modal-box-card" 
        style={{ maxWidth: '540px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="modal-title-text">Set Day & Daily Target</span>
            <span className="tag-pill" style={{ backgroundColor: '#E7F8F5', color: '#008767' }}>
              Goal Tracker
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={18} color="#7E7E7E" />
          </button>
        </div>

        <div className="modal-body-content">
          {/* Progress Today Card */}
          <div style={{ padding: '16px', borderRadius: '16px', background: '#F8F9FD', border: '1px solid #ECEEF3', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#FF6B00" />
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>Today&apos;s Application Target</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#008767' }}>
                {applicationsCountToday} / {dailyGoal} Completed ({progressPercent}%)
              </span>
            </div>

            <div className="daily-target-progress-bar">
              <div 
                className="daily-target-progress-fill" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '4px' }}>
              Consistent daily applications significantly improve recruiter outreach.
            </div>
          </div>

          {isSaved && (
            <div className="profile-save-status success" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>Daily target saved successfully!</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="modal-form">
            <div className="modal-form-group">
              <label className="modal-form-label">
                <Target size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Target Applications Per Day
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 1)}
                className="modal-input-field"
                placeholder="e.g. 5"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Active Focus Date / Deadline
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="modal-input-field"
              />
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={onClose}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-submit-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} />
                <span>Save Goal</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
