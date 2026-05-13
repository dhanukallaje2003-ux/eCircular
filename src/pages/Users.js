import React, { useState, useEffect } from 'react';

const Users = () => {

  const [users, setUsers] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const statsRes = await fetch('http://localhost:5000/api/circular/users/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      const circularsRes = await fetch('http://localhost:5000/api/circular/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const circularsData = await circularsRes.json();

      if (statsData.success) setUsers(statsData.data);
      if (circularsData.success) setCirculars(circularsData.data);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCirculars = circulars.length;

  const getActivityStatus = (totalViewed) => {
    if (totalViewed >= totalCirculars && totalCirculars > 0) {
      return { label: 'Active', color: '#2e7d32', bg: '#f0fff4', icon: '🟢' };
    }
    return { label: 'Not Active', color: '#c62828', bg: '#fff5f5', icon: '🔴' };
  };

  const getReadStatus = (totalViewed) => {
    return {
      label: `${totalViewed} / ${totalCirculars}`,
      color: totalViewed >= totalCirculars && totalCirculars > 0 ? '#2e7d32' : '#c62828',
      bg: totalViewed >= totalCirculars && totalCirculars > 0 ? '#f0fff4' : '#fff5f5'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const notActiveUsers = users.filter(u => u.total_viewed < totalCirculars);

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required!');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`User "${formData.name}" added successfully!`);
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        fetchData(); // Refresh list
      } else {
        setError(data.message || 'Failed to add user');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', margin: 0 }}>
            👥 Manage Users
          </h1>
          <p style={{ color: '#718096', marginTop: '4px' }}>
            View all users and their circular read status
          </p>
        </div>

        {/* Add User Button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          + Add User
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Total Users', value: users.length, color: '#4361ee' },
          { label: 'Total Circulars', value: totalCirculars, color: '#2b6cb0' },
          { label: 'Not Active', value: notActiveUsers.length, color: '#c62828' },
          { label: 'Active Users', value: users.filter(u => u.total_viewed >= totalCirculars && totalCirculars > 0).length, color: '#2e7d32' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Not Active Warning */}
      {notActiveUsers.length > 0 && (
        <div style={{
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <p style={{ margin: 0, fontWeight: '600', color: '#c62828' }}>
              {notActiveUsers.length} user{notActiveUsers.length > 1 ? 's are' : ' is'} Not Active!
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#718096' }}>
              {notActiveUsers.map(u => u.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Users Table */}
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
            All Users
          </h2>
          <span style={{ color: '#718096', fontSize: '13px' }}>
            {users.length} total
          </span>
        </div>

        {loading ? (
          <p style={{ padding: '20px' }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: '20px' }}>No users found!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['Name', 'Email', 'Joined', 'Read Status', 'Activity Status'].map(h => (
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
              {users.map((user) => {
                const activity = getActivityStatus(user.total_viewed);
                const readStatus = getReadStatus(user.total_viewed);
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: '#4361ee',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '500', color: '#2d3748' }}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#718096' }}>{user.email}</td>
                    <td style={{ padding: '14px 20px', color: '#718096' }}>{formatDate(user.created_at)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: readStatus.bg,
                        color: readStatus.color
                      }}>
                        {readStatus.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: activity.bg,
                        color: activity.color
                      }}>
                        {activity.icon} {activity.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
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
            width: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700' }}>
              Add New User
            </h2>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Email *
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Password *
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="user">User (Employee)</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <p style={{
                color: '#c62828',
                fontSize: '13px',
                marginBottom: '16px',
                padding: '8px 12px',
                background: '#fff5f5',
                borderRadius: '6px'
              }}>
                ⚠️ {error}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setFormData({ name: '', email: '', password: '', role: 'user' });
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={adding}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#4361ee',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {adding ? 'Adding...' : 'Add User'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Users;