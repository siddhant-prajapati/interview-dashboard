import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { questionsApi } from '../api/questionsApi';
import { technologiesApi } from '../api/technologiesApi';
import { mockStore } from '../api/client';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { Question, Technology } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function QuestionsPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [qRes, tRes] = await Promise.allSettled([
          questionsApi.getAll(),
          technologiesApi.getAll({ page: 0, size: 100 }),
        ]);

        if (!isMounted) return;

        if (qRes.status === 'fulfilled' && qRes.value) {
          const list = qRes.value.content || (Array.isArray(qRes.value) ? qRes.value : []);
          setQuestions(list);
        } else {
          setQuestions(mockStore.questions);
        }

        if (tRes.status === 'fulfilled' && tRes.value) {
          const tList = tRes.value.content || (Array.isArray(tRes.value) ? tRes.value : []);
          setTechnologies(tList);
          if (tList.length > 0 && tList[0].id) {
            setSelectedTechId(tList[0].id);
          }
        }
      } catch {
        if (isMounted) {
          setQuestions(mockStore.questions);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const tech = technologies.find((t) => t.id === selectedTechId);
    const payload = {
      question: newQuestionText,
      technologyId: selectedTechId || 1,
      listedDate: new Date().toISOString().split('T')[0],
    };

    try {
      const created = await questionsApi.create(payload);
      const newQ: Question = {
        ...(created || payload),
        id: created?.id || Date.now(),
        question: newQuestionText,
        technologyName: tech?.name || 'General',
        listedDate: payload.listedDate,
      };
      setQuestions((prev) => [newQ, ...prev]);
    } catch (err) {
      console.warn('Backend offline, saving question in-memory:', err);
      const fallbackQ: Question = {
        id: Date.now(),
        question: newQuestionText,
        technologyName: tech?.name || 'General',
        listedDate: payload.listedDate,
      };
      setQuestions((prev) => [fallbackQ, ...prev]);
    }

    setNewQuestionText('');
    setIsModalOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    if (!id) return;
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      await questionsApi.delete(id);
    } catch (err) {
      console.warn('Backend delete fallback:', err);
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const filteredQuestions = questions.filter((q) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const questionText = (q.question || '').toLowerCase();
    const techObj = technologies.find((t) => t.id === (q as any).technologyId);
    const techName = (q.technologyName || q.technology?.name || techObj?.name || '').toLowerCase();
    return questionText.includes(term) || techName.includes(term);
  });

  const columns: Column<Question>[] = [
    {
      key: 'question',
      label: 'Question',
      render: (row) => (
        <span className="question-text-content">
          {row.question}
        </span>
      ),
    },
    {
      key: 'technologyName',
      label: 'Technology Domain',
      render: (row) => {
        const techObj = technologies.find((t) => t.id === (row as any).technologyId);
        const name = row.technologyName || row.technology?.name || techObj?.name || 'General';
        return (
          <span className="tech-pill-tag">
            <Tag size={12} />
            {name}
          </span>
        );
      },
    },
    {
      key: 'listedDate',
      label: 'Date Listed',
      render: (row) => row.listedDate || 'Recent',
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="table-action-btn-group">
          <button
            type="button"
            onClick={(e) => handleDelete(e, row.id)}
            className="table-action-icon-btn"
            title="Delete Question"
          >
            <Trash2 size={16} color="#DF0404" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Technical Question Bank 💡"
        placeholder="Search questions by keyword..."
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button type="button" onClick={() => setIsModalOpen(true)} className="action-primary-btn">
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>Add Question</span>
          </button>
        }
      />

      <DataTable<Question>
        title="All Interview Questions"
        subtitle={`Compiled bank of ${filteredQuestions.length} technical and architectural questions`}
        columns={columns}
        data={filteredQuestions}
        totalEntries={filteredQuestions.length}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Question to Question Bank"
      >
        <form onSubmit={handleAddQuestion} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Question Text</label>
            <textarea
              rows={4}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="e.g. How does garbage collection work in modern JVM with G1 or ZGC?"
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

          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Save Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
