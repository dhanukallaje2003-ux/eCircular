import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HiddenCirculars = () => {

  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const fetchHidden = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/circular/hidden', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setCirculars(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHidden(); }, []);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleRestore = async (id, title) => {
    if (!window.confirm(`Restore "${title}" back to active?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/circular/${id}/restore`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        showFeedback(`✅ "${title}" has been restored successfully!`);
        fetchHidden();
      }
    } catch (error) {
      alert('Error restoring circular');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/circular/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        showFeedback(`🗑️ "${title}" has been permanently deleted.`);
        fetchHidden();
      } else {
        alert(data.message || 'Failed to delete circular');
      }
    } catch (error) {
      alert('Error deleting circular');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    const icons = { Circular: '📄', Memorandum: '📝', Policy: '📋' };
    return icons[type] || '📄';
  };

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', margin: 0 }}>
          Hidden Circulars
        </h1>
        <p style={{ color: '#718096', marginTop: '4px' }}>
          These circulars are hidden from users. You can restore or permanently delete them.
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
          <strong>Admin Mode</strong> — Click <strong>Restore</strong> to make a circular visible again,
          or <strong>Delete</strong> to permanently remove it from the system.
        </span>
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
            Hidden Documents
          </h2>
          <span style={{ color: '#718096', fontSize: '13px' }}>
            {circulars.length} total
          </span>
        </div>

        {loading ? (
          <p style={{ padding: '20px' }}>Loading...</p>
        ) : circulars.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '40px' }}>✅</div>
            <p>No hidden circulars!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['Title', 'Type', 'Target Group', 'Date', 'Actions'].map(h => (
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
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f7fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{ color: '#4361ee', fontWeight: '500', cursor: 'pointer' }}
                      onClick={() => navigate(`/circular/${item.id}`)}
                    >
                      {getTypeIcon(item.document_type)} {item.title}
                    </span>
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
                  <td style={{ padding: '14px 20px', color: '#718096' }}>
                    {item.target_group}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#718096' }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>

                      {/* RESTORE BUTTON */}
                      <button
                        onClick={() => handleRestore(item.id, item.title)}
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
                        onClick={() => handleDelete(item.id, item.title)}
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

export default HiddenCirculars;