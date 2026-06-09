import React, { useState, useEffect } from 'react';
import { fetchNotifications } from '../services/api';

const TYPE_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

const PriorityInbox = () => {
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndSortNotifications = async () => {
      const data = await fetchNotifications();
      const items = Array.isArray(data) ? data : data.notifications || data.data || [];
      
      const sorted = items.sort((a, b) => {
        const weightA = TYPE_WEIGHTS[a.Type] || 0;
        const weightB = TYPE_WEIGHTS[b.Type] || 0;
        
        if (weightA !== weightB) {
          return weightB - weightA;
        }
        return new Date(b.Timestamp) - new Date(a.Timestamp);
      });

      setPriorityNotifications(sorted.slice(0, 10));
      setLoading(false);
    };
    
    loadAndSortNotifications();
  }, []);

  if (loading) return <div>Loading priority inbox...</div>;

  return (
    <div className="page-container">
      <h2>Priority Inbox (Top 10)</h2>
      <div className="notification-list">
        {priorityNotifications.length === 0 ? <p>No priority notifications found.</p> : null}
        {priorityNotifications.map(n => (
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

export default PriorityInbox;
