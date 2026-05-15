import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const Archive = () => {

  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const fetchArchived = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch manually archived
      const archivedRes = await fetch(`${API_BASE_URL}/api/circular/archived`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const archivedData = await archivedRes.json();

      // Fetch all circulars for 30 days check
      const allRes = await fetch(`${API_BASE_URL}/api/circular/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allData = await allRes.json();

      // Filter circulars older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const oldCirculars = allData.data?.filter(c => {
        return new Date(c.created_at) < thirtyDaysAgo;
      }) || [];

      // Combine both — remove duplicates by id
      const manualArchived = archivedData.data || [];
      const combined = [...manualArchived];
      oldCirculars.forEach(c => {
        if (!combined.find(x => x.id === c.id)) {
          combined.push(c);
        }
      });

      setCirculars(combined);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArchived(); }, []);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleRestore = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`Restore "${title}" back to active?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}/restore`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        showFeedback(`✅ "${title}" has been restored successfully!`);
        fetchArchived();
      } else {
        alert(data.message || 'Failed to restore circular');
      }
    } catch (error) {
      alert('Error restoring circular');
    }
  };

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/circular/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        showFeedback(`🗑️ "${title}" has been permanently deleted.`);
        fetchArchived();
      } else {
        alert(data.message || 'Failed to delete circular');
      }
    } catch (error) {
      alert('Error deleting circular');
    }
  };

  const getTypeIcon = (type) => {
    const icons = { Circular: '📄', Memorandum: '📝', Policy: '📋' };
    return icons[type] || '📄';
  };

  const getPriorityColor = (priority) => {
    const colors = { High: '#c62828', Medium: '#e65100', Low: '#2e7d32' };
    return colors[priority] || '#718096';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getDaysAgo = (dateString) => {
    const diffTime = Math.abs(new Date() - new Date(dateString));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748' }}>
          🗄️ Archive
        </h1>
        <p style={{ color: '#718096' }}>
          Manually archived + circulars older than 30 days
        </p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '8px',
          background: '#f0fdf4',
          border: '1.5px solid #bbf7d0',
          color: '#15803d',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {feedback}
        </div>
      )}

      {/* Info banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        marginBottom: '20px',
        borderRadius: '8px',
        background: '#fff7ed',
        border: '1.5px solid #fed7aa',
        color: '#c2410c',
        fontSize: '13px'
      }}>
        ⚠️ <span>
          <strong>Admin Mode</strong> — Click <strong>Restore</strong> to make a circular active again,
          or <strong>Delete</strong> to permanently remove it from the system.
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Total Archived', value: circulars.length },
          { label: 'Circulars', value: circulars.filter(c => c.document_type === 'Circular').length },
          { label: 'Memorandums', value: circulars.filter(c => c.document_type === 'Memorandum').length },
          { label: 'Policies', value: circulars.filter(c => c.document_type === 'Policy').length },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: '#718096' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Archived Documents
          </h2>
          <span style={{ color: '#718096', fontSize: '13px' }}>
            {circulars.length} total
          </span>
        </div>

        {loading ? (
          <p style={{ padding: '20px' }}>Loading archive...</p>
        ) : circulars.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '40px' }}>🗄️</div>
            <p>No archived documents yet.</p>
            <p>Documents older than 30 days or manually archived will appear here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['Title', 'Type', 'Priority', 'Target Group', 'Date', 'Age', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#718096',
                    textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {circulars.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/circular/${item.id}`)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f7fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '14px 20px', color: '#4361ee', fontWeight: '500' }}>
                    {getTypeIcon(item.document_type)} {item.title}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#ebf8ff',
                      color: '#2b6cb0'
                    }}>
                      {item.document_type}
                    </span>
                  </td>
                  <td style={{
                    padding: '14px 20px',
                    color: getPriorityColor(item.priority),
                    fontWeight: 'bold'
                  }}>
                    {item.priority}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#4a5568' }}>
                    {item.target_group}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#718096' }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#718096' }}>
                    {getDaysAgo(item.created_at)} days ago
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>

                      {/* RESTORE BUTTON */}
                      <button
                        onClick={(e) => handleRestore(e, item.id, item.title)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#2e7d32',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#1b5e20'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#2e7d32'}
                      >
                        👁️ Restore
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={(e) => handleDelete(e, item.id, item.title)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#c62828',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#b71c1c'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#c62828'}
                      >
                        🗑️ Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Archive;
