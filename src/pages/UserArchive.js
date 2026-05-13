import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserArchive = () => {

  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchived = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch manually archived
        const archivedRes = await fetch('http://localhost:5000/api/circular/archived', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const archivedData = await archivedRes.json();

        // Fetch all for 30 days check
        const allRes = await fetch('http://localhost:5000/api/circular/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allData = await allRes.json();

        // Filter older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const oldCirculars = allData.data?.filter(c =>
          new Date(c.created_at) < thirtyDaysAgo
        ) || [];

        // Combine both
        const manualArchived = archivedData.data || [];
        const combined = [...manualArchived];
        oldCirculars.forEach(c => {
          if (!combined.find(x => x.id === c.id)) combined.push(c);
        });

        setCirculars(combined);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchived();
  }, []);

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

  return (
    <div style={{ padding: '24px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748' }}>
          🗄️ Archive
        </h1>
        <p style={{ color: '#718096' }}>
          Archived circulars and documents older than 30 days
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Total Archived', value: circulars.length },
          { label: 'Circulars', value: circulars.filter(c => c.document_type === 'Circular').length },
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
          <p style={{ padding: '20px' }}>Loading...</p>
        ) : circulars.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '40px' }}>🗄️</div>
            <p>No archived documents yet.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['Title', 'Type', 'Priority', 'Date'].map(h => (
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
                  <td style={{ padding: '14px 20px', color: '#718096' }}>
                    {formatDate(item.created_at)}
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

export default UserArchive;