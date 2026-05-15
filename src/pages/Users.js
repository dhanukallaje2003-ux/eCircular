import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL;

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

      const statsRes = await fetch(`${API}/api/circular/users/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      const circularsRes = await fetch(`${API}/api/circular/all`, {
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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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

      const response = await fetch(`${API}/api/auth/register`, {
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
        fetchData();
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

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
            👥 Manage Users
          </h1>
          <p style={{ color: '#718096' }}>
            View all users and their circular read status
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          + Add User
        </button>
      </div>

      {/* USERS TABLE */}
      <div style={{ background: 'white', borderRadius: '12px' }}>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Read Status</th>
                <th>Activity</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => {
                const activity = getActivityStatus(user.total_viewed);
                const readStatus = getReadStatus(user.total_viewed);

                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>{readStatus.label}</td>
                    <td>{activity.label}</td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '400px'
          }}>
            <h2>Add User</h2>

            <input placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <input placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <input type="password" placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            <button onClick={handleAddUser}>
              {adding ? "Adding..." : "Add User"}
            </button>

            <button onClick={() => setShowModal(false)}>
              Close
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
