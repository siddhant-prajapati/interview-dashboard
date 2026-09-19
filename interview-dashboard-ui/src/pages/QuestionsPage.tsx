import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { questionsApi } from '../api/questionsApi';
import { mockStore } from '../api/client';
import { Plus, Tag } from 'lucide-react';
import { Question } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function QuestionsPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newTechnologyName, setNewTechnologyName] = useState('Java 21');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await questionsApi.getAll();
        if (!isMounted) return;
        if (res && res.content) {
          setQuestions(res.content);
        } else if (Array.isArray(res)) {
          setQuestions(res);
        } else {
          setQuestions(mockStore.questions);
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
    const newQ: Question = {
      id: Date.now(),
      question: newQuestionText,
      technologyName: newTechnologyName,
      listedDate: new Date().toISOString().split('T')[0],
    };
    try {
      await questionsApi.create(newQ);
    } catch (err) {
      console.warn('Backend offline, saving question in-memory:', err);
    }
    setQuestions((prev) => [newQ, ...prev]);
    setNewQuestionText('');
    setIsModalOpen(false);
  };

  const filteredQuestions = questions.filter((q) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const questionText = (q.question || '').toLowerCase();
    const techName = (q.technologyName || q.technology?.name || '').toLowerCase();
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
      render: (row) => (
        <span className="tech-pill-tag">
          <Tag size={12} />
          {row.technologyName || row.technology?.name || 'General'}
        </span>
      ),
    },
    {
      key: 'listedDate',
      label: 'Date Listed',
      render: (row) => row.listedDate || 'Recent',
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
              value={newTechnologyName}
              onChange={(e) => setNewTechnologyName(e.target.value)}
              className="modal-select-field"
            >
              <option value="Java 21">Java 21</option>
              <option value="Spring Boot">Spring Boot</option>
              <option value="MySQL">MySQL</option>
              <option value="Kafka">Kafka</option>
              <option value="Docker">Docker</option>
              <option value="AWS">AWS</option>
              <option value="System Design">System Design</option>
              <option value="React">React</option>
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
