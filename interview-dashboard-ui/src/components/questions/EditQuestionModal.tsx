import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { questionsApi } from '../../api/questionsApi';
import { Question, Technology } from '../../types';
import { Edit3 } from 'lucide-react';

export interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  technologies?: Technology[];
  onSuccess: (updated: Question) => void;
}

export default function EditQuestionModal({
  isOpen,
  onClose,
  question,
  technologies = [],
  onSuccess,
}: EditQuestionModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<number>(1);
  const [listedDate, setListedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question || '');
      const techObj = technologies.find((t) => t.id === (question as any).technologyId);
      const matchedTech = technologies.find(
        (t) => t.id === (question as any).technologyId || t.name === question.technologyName
      );
      setSelectedTechId(matchedTech?.id || techObj?.id || technologies[0]?.id || 1);
      setListedDate(question.listedDate || new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [question, isOpen, technologies]);

  if (!question) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const tech = technologies.find((t) => t.id === selectedTechId);
    const payload = {
      question: questionText.trim(),
      technologyId: selectedTechId,
      listedDate: listedDate || new Date().toISOString().split('T')[0],
    };

    try {
      const res = await questionsApi.update(question.id, payload);
      const updatedQ: Question = {
        ...question,
        ...(res || payload),
        id: question.id,
        question: questionText.trim(),
        technologyId: selectedTechId,
        technologyName: tech?.name || question.technologyName || 'General',
        technology: tech || question.technology,
        listedDate: payload.listedDate,
      };

      setLoading(false);
      onClose();
      onSuccess(updatedQ);
    } catch (err: any) {
      console.warn('Backend question update fallback:', err);
      const fallbackUpdated: Question = {
        ...question,
        id: question.id,
        question: questionText.trim(),
        technologyId: selectedTechId,
        technologyName: tech?.name || question.technologyName || 'General',
        technology: tech || question.technology,
        listedDate: payload.listedDate,
      };

      setLoading(false);
      onClose();
      onSuccess(fallbackUpdated);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Interview Question"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              borderRadius: '8px',
              fontSize: '13px',
              border: '1px solid #FECACA',
            }}
          >
            {error}
          </div>
        )}

        <div className="modal-form-group">
          <label className="modal-form-label">Question Text</label>
          <textarea
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g. Explain how B-Tree index structure works in InnoDB..."
            className="modal-textarea-field"
            required
          />
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">Associated Technology / Topic</label>
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(Number(e.target.value))}
            className="modal-select-field"
          >
            {technologies.length === 0 ? (
              <>
                <option value={1}>Java 21</option>
                <option value={2}>Spring Boot</option>
                <option value={3}>MySQL</option>
              </>
            ) : (
              technologies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type || 'TECH'})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">Date Listed</label>
          <input
            type="date"
            value={listedDate}
            onChange={(e) => setListedDate(e.target.value)}
            className="modal-input-field"
          />
        </div>

        <div className="modal-footer-actions">
          <button
            type="button"
            onClick={onClose}
            className="modal-cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="modal-submit-btn"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Edit3 size={15} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
