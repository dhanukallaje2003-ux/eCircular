import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {

  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const getFilterFromPath = () => {
    const path = location.pathname;
    if (path === '/user-memorandum') return 'Memorandum';
    if (path === '/user-policy') return 'Policy';
    if (path === '/user-circular') return 'Circular';
    return null;
  };

  const filter = getFilterFromPath();

  useEffect(() => {
    const fetchCirculars = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/circular/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setCirculars(data.data);
        }
      } catch (error) {
        console.error('Error fetching circulars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCirculars();
  }, []);

  const stats = React.useMemo(() => ({
    totalCirculars: circulars.length,
    memorandum: circulars.filter(c => c.document_type === 'Memorandum').length,
    policies: circulars.filter(c => c.document_type === 'Policy').length,
  }), [circulars]);

  const filteredCirculars = circulars
    .filter(c => filter ? c.document_type === filter : true)
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const getTypeIcon = (type) => {
    const icons = { Circular: '📄', Memorandum: '📝', Policy: '📋' };
    return icons[type] || '📄';
  };

  const getPriorityClass = (priority) => `priority-${priority?.toLowerCase()}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPageTitle = () => {
    if (filter === 'Circular') return 'Circulars';
    if (filter === 'Memorandum') return 'Memorandums';
    if (filter === 'Policy') return 'Policies';
    return 'User Dashboard';
  };

  return (
    <div className="user-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{getPageTitle()}</h1>
          <p>{filter ? `Showing all ${filter} documents` : 'Welcome back! Here are your circulars.'}</p>
        </div>
      </div>

      {/* Stats - only on main dashboard */}
      {!filter && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon circular-icon"><span>📄</span></div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalCirculars}</span>
              <span className="stat-label">Total Circulars</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon memorandum-icon"><span>📝</span></div>
            <div className="stat-content">
              <span className="stat-value">{stats.memorandum}</span>
              <span className="stat-label">Memorandum</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon policy-icon"><span>📋</span></div>
            <div className="stat-content">
              <span className="stat-value">{stats.policies}</span>
              <span className="stat-label">Policies</span>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-section">
        <div className="smart-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search circulars, memos, policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Circulars List */}
      <div className="recent-section">
        <div className="section-header">
          <h2>{filter ? `All ${filter}s` : 'All Documents'}</h2>
          <span>{filteredCirculars.length} found</span>
        </div>

        {loading ? (
          <p style={{ padding: '20px' }}>Loading...</p>
        ) : filteredCirculars.length === 0 ? (
          <p style={{ padding: '20px' }}>No {filter || 'documents'} found!</p>
        ) : (
          <div className="recent-table">
            <div className="table-header">
              <span>No.</span>
              <span>Title</span>
              <span>Type</span>
              <span>Date</span>
              <span>Priority</span>
            </div>

            {filteredCirculars.map((item) => (
              <div
                key={item.id}
                className="table-row"
                onClick={() => navigate(`/circular/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <span style={{
                  fontWeight: '600',
                  color: '#4361ee',
                  fontSize: '14px'
                }}>
                  {item.id}
                </span>
                <span className="item-title"
                  style={{ color: '#4361ee', fontWeight: '500' }}
                >
                  <span className="item-icon">{getTypeIcon(item.document_type)}</span>
                  {item.title}
                </span>
                <span className="item-type">
                  <span className={`type-badge ${item.document_type?.toLowerCase()}`}>
                    {item.document_type}
                  </span>
                </span>
                <span className="item-date">{formatDate(item.created_at)}</span>
                <span className="item-priority">
                  <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                    {item.priority?.toUpperCase()}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;