import React, { useState, useEffect } from 'react';
import { fetchNotifications } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      const items = Array.isArray(data) ? data : data.notifications || data.data || [];
      setNotifications(items);
      setLoading(false);
    };
    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => filter === 'All' ? true : n.Type === filter);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="page-container">
      <div className="header-actions">
        <h2>All Notifications</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-dropdown">
          <option value="All">All Types</option>
          <option value="Placement">Placement</option>
          <option value="Result">Result</option>
          <option value="Event">Event</option>
        </select>
      </div>
      
      <div className="notification-list">
        {filteredNotifications.length === 0 ? <p>No notifications found.</p> : null}
        {filteredNotifications.map(n => (
          <div key={n.ID} className={`notification-card ${n.isRead ? 'read' : 'unread'}`}>
            <div className="notif-header">
              <h3>{n.Message}</h3>
              <span className={`badge ${n.Type ? n.Type.toLowerCase() : ''}`}>{n.Type}</span>
            </div>
            <div className="notif-footer">
              <small>{new Date(n.Timestamp).toLocaleString()}</small>
              <span className="status">{n.isRead ? 'Viewed' : 'Unviewed'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
