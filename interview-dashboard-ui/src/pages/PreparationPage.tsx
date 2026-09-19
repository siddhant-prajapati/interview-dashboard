import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import Modal from '../components/common/Modal';
import { preparationApi } from '../api/preparationApi';
import { mockStore } from '../api/client';
import { Plus, CheckSquare, Square, Flame, BookOpen, RotateCcw } from 'lucide-react';
import { PreparationTopic, TopicCategory } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function PreparationPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [topics, setTopics] = useState<PreparationTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<PreparationTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<TopicCategory>('JAVA');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  const [items, setItems] = useState([
    { id: 1, title: "Virtual Threads & Structured Concurrency in Project Loom", type: "CONCEPT", difficulty: 4, completed: true },
    { id: 2, title: "Implement an LRU Cache with Thread-Safety", type: "PROBLEM", difficulty: 3, completed: true },
    { id: 3, title: "Deep dive into Spring Data JPA N+1 problem and EntityGraph", type: "ARTICLE", difficulty: 3, completed: false },
    { id: 4, title: "Design a Rate Limiter with Token Bucket & Redis", type: "ASSIGNMENT", difficulty: 4, completed: false },
  ]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await preparationApi.getTopics();
        if (!isMounted) return;
        if (res && res.content) {
          setTopics(res.content);
        } else if (Array.isArray(res)) {
          setTopics(res);
        } else {
          setTopics(mockStore.preparationTopics);
        }
      } catch {
        if (isMounted) {
          setTopics(mockStore.preparationTopics);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTopic: PreparationTopic = {
      id: Date.now(),
      name: newTopicName,
      category: newTopicCategory,
      description: newTopicDesc,
      itemCount: 4,
      progress: 0,
    };
    try {
      await preparationApi.createTopic(newTopic);
    } catch (err) {
      console.warn('Backend offline, saving topic in-memory:', err);
    }
    setTopics((prev) => [...prev, newTopic]);
    setNewTopicName('');
    setNewTopicDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Preparation Roadmap 📚"
        placeholder="Filter topics..."
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button 
            type="button" 
            onClick={() => setIsModalOpen(true)} 
            className="action-primary-btn"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>Add Topic</span>
          </button>
        }
      />

      {/* Topic Grid */}
      <div className="topic-cards-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="topic-card-item"
            onClick={() => setSelectedTopic(topic)}
          >
            <div className="topic-card-header">
              <span className="tag-pill topic-category-tag">
                {topic.category}
              </span>
              <div className="topic-status-success">
                <Flame size={14} color="#00AC4F" />
                <span>{topic.progress || 75}% Mastered</span>
              </div>
            </div>

            <h3 className="topic-card-title">{topic.name}</h3>
            <p className="topic-card-desc">{topic.description || 'Core concepts and hands-on interview challenges.'}</p>

            {/* Progress Bar */}
            <div className="topic-progress-track">
              <div
                className="topic-progress-fill"
                style={{ width: `${topic.progress || 75}%` }}
              />
            </div>

            <div className="topic-card-footer">
              <span className="topic-stat-label">
                <BookOpen size={14} color="#9197B3" />
                {topic.itemCount || 12} Items
              </span>
              <span className="topic-stat-action">
                <RotateCcw size={13} color="#5932EA" />
                Revision in 3 days
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Topic Detail & Checklist Modal */}
      {selectedTopic && (
        <Modal
          isOpen={Boolean(selectedTopic)}
          onClose={() => setSelectedTopic(null)}
          title={`${selectedTopic.name} — Study Checklist`}
        >
          <p className="topic-modal-desc">
            {selectedTopic.description}
          </p>

          <div className="topic-checklist-container">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`checklist-item-row ${item.completed ? 'completed' : 'pending'}`}
              >
                <button type="button" className="checklist-checkbox-btn">
                  {item.completed ? (
                    <CheckSquare size={20} color="#00AC4F" />
                  ) : (
                    <Square size={20} color="#9CA3AF" />
                  )}
                </button>
                <div className="checklist-content-box">
                  <span className={`checklist-title-text ${item.completed ? 'completed' : 'pending'}`}>
                    {item.title}
                  </span>
                </div>
                <span className="tag-pill">{item.type}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Add Topic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Preparation Topic"
      >
        <form onSubmit={handleCreateTopic} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Topic Title</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="e.g. Distributed Caching with Redis"
              className="modal-input-field"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Category</label>
            <select
              value={newTopicCategory}
              onChange={(e) => setNewTopicCategory(e.target.value as TopicCategory)}
              className="modal-select-field"
            >
              <option value="JAVA">Java</option>
              <option value="SPRING_BOOT">Spring Boot</option>
              <option value="DSA">Data Structures & Algorithms</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="SQL">SQL & Relational DBs</option>
              <option value="AWS">AWS & Cloud</option>
              <option value="REACT">React</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Description & Objectives</label>
            <textarea
              rows={3}
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              placeholder="Key concepts to master before the next technical interview..."
              className="modal-textarea-field"
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Create Topic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
