import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const getFilterFromPath = () => {
    const path = location.pathname;
    if (path === '/memorandum') return 'Memorandum';
    if (path === '/policy') return 'Policy';
    if (path === '/circular') return 'Circular';
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

  // Filter by type and search
  const filteredCirculars = circulars
    .filter(c => filter ? c.document_type === filter : true)
    .filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.target_group?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = React.useMemo(() => {
    const total = circulars.length;
    const memoCount = circulars.filter(c => c.document_type === 'Memorandum').length;
    const policyCount = circulars.filter(c => c.document_type === 'Policy').length;
    const circularCount = circulars.filter(c => c.document_type === 'Circular').length;
    return {
      totalCirculars: total,
      memorandum: memoCount,
      policy: policyCount,
      circular: circularCount
    };
  }, [circulars]);

  const getTypeIcon = (type) => {
    const icons = {
      Circular: '📄',
      Memorandum: '📝',
      Policy: '📋'
    };
    return icons[type] || '📄';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: '#c62828',
      Medium: '#e65100',
      Low: '#2e7d32'
    };
    return colors[priority] || '#718096';
  };

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
    return 'Dashboard';
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{getPageTitle()}</h1>
          <p>
            {filter
              ? `Showing all ${filter} documents`
              : "Welcome back to eCircular! Here's an overview of your circulars."
            }
          </p>
        </div>
        <Link to="/compose" className="compose-btn">
          New Circular
        </Link>
      </div>

      {/* STATS - only on main dashboard */}
      {!filter && (
        <div className="stats-grid">
          <div className="stat-card"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <span className="stat-value">{stats.totalCirculars}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card"
            onClick={() => navigate('/circular')}
            style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <span className="stat-value">{stats.circular}</span>
              <span className="stat-label">Circulars</span>
            </div>
          </div>
          <div className="stat-card"
            onClick={() => navigate('/memorandum')}
            style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <span className="stat-value">{stats.memorandum}</span>
              <span className="stat-label">Memorandum</span>
            </div>
          </div>
          <div className="stat-card"
            onClick={() => navigate('/policy')}
            style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <span className="stat-value">{stats.policy}</span>
              <span className="stat-label">Policy</span>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS - only on main dashboard */}
      {!filter && (
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/compose" className="action-card">Create Circular</Link>
            <Link to="/archive" className="action-card">View Archive</Link>
            <Link to="/users" className="action-card">Manage Users</Link>
          </div>
        </div>
      )}

      {/* SEARCH BOX */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Search by title or target group..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* CIRCULARS TABLE */}
      <div className="recent-section">
        <div className="section-header">
          <h2>{filter ? `All ${filter}s` : 'All Documents'}</h2>
          <span>{filteredCirculars.length} total</span>
        </div>

        {loading ? (
          <p style={{ padding: '20px' }}>Loading...</p>
        ) : filteredCirculars.length === 0 ? (
          <p style={{ padding: '20px' }}>
            {searchTerm ? `No results for "${searchTerm}"` : `No ${filter || 'documents'} found!`}
          </p>
        ) : (
          <div className="recent-table">
            <div className="table-header">
  <span>No.</span>
  <span>Title</span>
  <span>Type</span>
  <span>Priority</span>
  <span>Target Group</span>
  <span>Date</span>
</div>

{filteredCirculars.map((item, index) => (
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
                  style={{ color: '#4361ee', fontWeight: '500' }}>
                  {getTypeIcon(item.document_type)} {item.title}
                </span>
                <span className="item-type">
                  <span className={`type-badge ${item.document_type?.toLowerCase()}`}>
                    {item.document_type}
                  </span>
                </span>
                <span style={{ color: getPriorityColor(item.priority), fontWeight: 'bold' }}>
                  {item.priority}
                </span>
                <span>{item.target_group}</span>
                <span className="item-date">{formatDate(item.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;