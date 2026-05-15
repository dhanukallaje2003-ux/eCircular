import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import API_BASE_URL from '../config/api';
import './CircularDetail.css';

const CircularDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    documentType: '',
    priority: '',
    targetGroup: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';

  // Quill editor for edit modal
  const { quill: editQuill, quillRef: editQuillRef } = useQuill({ theme: 'snow' });

  const fetchCircular = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCircular(data.data);
        await fetch(`${API_BASE_URL}/api/circular/${id}/view`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCircular(); }, [id]);

  // Load content into Quill when modal opens
  useEffect(() => {
    if (editQuill && showEditModal) {
      editQuill.root.innerHTML = editData.description || '';
      editQuill.on('text-change', () => {
        setEditData(prev => ({
          ...prev,
          description: editQuill.root.innerHTML
        }));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuill, showEditModal]);

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this circular?')) return;
    setArchiving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Circular archived successfully!');
        navigate(-1);
      } else {
        alert('Failed to archive circular');
      }
    } catch (error) {
      alert('Error archiving circular');
    } finally {
      setArchiving(false);
    }
  };

  const handleHide = async () => {
    if (!window.confirm('Hide this circular? Users will not see it.')) return;
    setHiding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}/hide`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Circular hidden successfully!');
        navigate('/dashboard');
      } else {
        alert('Failed to hide circular');
      }
    } catch (error) {
      alert('Error hiding circular');
    } finally {
      setHiding(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Restore this circular? Users will see it again.')) return;
    setRestoring(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}/restore`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Circular restored successfully!');
        navigate('/dashboard');
      } else {
        alert('Failed to restore circular');
      }
    } catch (error) {
      alert('Error restoring circular');
    } finally {
      setRestoring(false);
    }
  };

  const handleEditOpen = () => {
    setEditData({
      title: circular.title,
      description: circular.description || '',
      documentType: circular.document_type,
      priority: circular.priority || '',
      targetGroup: circular.target_group
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Circular updated successfully!');
        setShowEditModal(false);
        fetchCircular();
      } else {
        alert('Failed to update circular');
      }
    } catch (error) {
      alert('Error updating circular');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { High: '#c62828', Medium: '#e65100', Low: '#2e7d32' };
    return colors[priority] || '#718096';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  if (loading) return <div className="circular-detail-loading">Loading...</div>;
  if (!circular) return <div className="circular-detail-loading">Circular not found!</div>;

  return (
    <div className="circular-detail-page">

      {/* Top Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>

            {circular.is_archived !== 1 && (
              <button
                onClick={handleEditOpen}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#4361ee',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Edit
              </button>
            )}

            {circular.is_archived === 1 ? (
              <span style={{
                padding: '8px 20px',
                backgroundColor: '#e2e8f0',
                color: '#718096',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Already Archived
              </span>
            ) : (
              <button
                onClick={handleArchive}
                disabled={archiving}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#e65100',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {archiving ? 'Archiving...' : 'Move to Archive'}
              </button>
            )}

            {circular.is_hidden === 1 ? (
              <button
                onClick={handleRestore}
                disabled={restoring}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {restoring ? 'Restoring...' : 'Restore'}
              </button>
            ) : (
              <button
                onClick={handleHide}
                disabled={hiding}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#718096',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {hiding ? 'Hiding...' : 'Hide'}
              </button>
            )}

          </div>
        )}
      </div>

      {/* Circular Document */}
      <div className="circular-document">

        <div className="circular-doc-header">
          <div className="doc-logo">◉</div>
          <h1 className="doc-org-name">eCircular</h1>
          <div className="doc-divider"></div>
        </div>

        <div className="doc-type-row">
          <span className="doc-type-badge">{circular.document_type}</span>
          {circular.priority && (
            <span
              className="doc-priority-badge"
              style={{ backgroundColor: getPriorityColor(circular.priority) }}
            >
              {circular.priority} Priority
            </span>
          )}
          {circular.is_archived === 1 && (
            <span style={{
              background: '#e2e8f0', color: '#718096',
              padding: '4px 12px', borderRadius: '20px',
              fontSize: '13px', fontWeight: '600'
            }}>
              Archived
            </span>
          )}
          {circular.is_hidden === 1 && (
            <span style={{
              background: '#fff5f5', color: '#c62828',
              padding: '4px 12px', borderRadius: '20px',
              fontSize: '13px', fontWeight: '600'
            }}>
              Hidden
            </span>
          )}
        </div>

        <h2 className="doc-title">{circular.title}</h2>

        <div className="doc-meta">
          <div className="doc-meta-item">
            <span className="meta-label">Ref No:</span>
            <span className="meta-value" style={{ fontWeight: '600', color: '#4361ee' }}>
              #{circular.id}
            </span>
          </div>
          <div className="doc-meta-item">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{formatDate(circular.created_at)}</span>
          </div>
          <div className="doc-meta-item">
            <span className="meta-label">To:</span>
            <span className="meta-value">{circular.target_group}</span>
          </div>
          <div className="doc-meta-item">
            <span className="meta-label">From:</span>
            <span className="meta-value">{circular.created_by_name || 'Admin'}</span>
          </div>
        </div>

        <div className="doc-divider"></div>

        <div
          className="doc-description"
          dangerouslySetInnerHTML={{ __html: circular.description }}
        />

        <div className="doc-divider"></div>

        <div className="doc-footer">
          <p>This is an official circular issued by the management.</p>
          <p>Please read and acknowledge receipt.</p>
        </div>

      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '600px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700' }}>
              Edit Circular
            </h2>

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Title *
              </label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '6px',
                  fontSize: '14px', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Document Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Document Type *
              </label>
              <select
                value={editData.documentType}
                onChange={(e) => setEditData({ ...editData, documentType: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '6px',
                  fontSize: '14px', boxSizing: 'border-box'
                }}
              >
                <option value="Circular">Circular</option>
                <option value="Memorandum">Memorandum</option>
                <option value="Policy">Policy</option>
              </select>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Priority
              </label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '6px',
                  fontSize: '14px', boxSizing: 'border-box'
                }}
              >
                <option value="">No Priority</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Target Group */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Target Group *
              </label>
              <select
                value={editData.targetGroup}
                onChange={(e) => setEditData({ ...editData, targetGroup: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid #e2e8f0', borderRadius: '6px',
                  fontSize: '14px', boxSizing: 'border-box'
                }}
              >
                <option value="All Employees">All Employees</option>
                <option value="Department Heads">Department Heads</option>
                <option value="Managers">Managers</option>
                <option value="Specific Department">Specific Department</option>
                <option value="Contractors">Contractors</option>
              </select>
            </div>

            {/* Description - Quill Editor */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Description *
              </label>
              <div
                ref={editQuillRef}
                style={{ height: '200px', marginBottom: '42px' }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  flex: 1, padding: '10px',
                  background: '#e2e8f0', border: 'none',
                  borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                style={{
                  flex: 1, padding: '10px',
                  background: '#4361ee', color: 'white',
                  border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CircularDetail;
