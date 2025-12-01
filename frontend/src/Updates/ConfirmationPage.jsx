import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'delay',
      title: 'Flight Delay Alert',
      message: 'Your flight UA-1234 from JFK to LAX has been delayed by 45 minutes.',
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
    },
    {
      id: 2,
      type: 'update',
      title: 'Booking Updated',
      message: 'Your seat has been automatically upgraded to 12A due to aircraft change.',
      timestamp: new Date(Date.now() - 7200000).toLocaleString(),
    },
    {
      id: 3,
      type: 'border',
      title: 'Border Update',
      message: 'New travel requirements for your destination. Please review before departure.',
      timestamp: new Date(Date.now() - 86400000).toLocaleString(),
      
    },
    {
      id: 4,
      type: 'points',
      title: 'Rewards Points Earned',
      message: 'You earned 850 loyalty points on your recent booking!',
      timestamp: new Date(Date.now() - 172800000).toLocaleString(),
    }
  ]);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      setTimeout(() => {
        setResult({ found: true, code });
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setResult({ found: false });
      setLoading(false);
    }
  }

  const getNotificationColor = (type) => {
    switch(type) {
      case 'delay': return '#959089ff';
      case 'update': return '#e18ae4ff';
      case 'border': return '#de7284ff';
      case 'points': return '#4caf50';
      default: return '#195cec';
    }
  }

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  }

  return (
    <div className="confirmation-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="confirmation-container">
        <div className="confirmation-header">
          <h1>Flight Updates & Notifications</h1>
          <p>Check for alerts, delays, and important updates about your bookings</p>
        </div>

        <div className="confirmation-layout">
          <div className="notifications-section">
            <h2 className="section-heading">Recent Notifications</h2>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <p>No new notifications.</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className="notification-card"
                    style={{ borderLeftColor: getNotificationColor(notification.type) }}
                  >
                    <div className="notification-header">
                      <span className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                        {notification.icon}
                      </span>
                      <div className="notification-title-block">
                        <h3 className="notification-title">{notification.title}</h3>
                        <span className="notification-time">{notification.timestamp}</span>
                      </div>
                      <button 
                        className="dismiss-btn"
                        onClick={() => dismissNotification(notification.id)}
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="lookup-section">
            <h2 className="section-heading">Lookup Booking</h2>
            <div className="lookup-card">
              <p className="lookup-description">
                Enter your confirmation code to view or update your booking details.
              </p>

              <form onSubmit={handleSubmit} className="lookup-form">
                <label className="form-label">
                  Confirmation Code
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g., LIFT-ABC123"
                    className="form-input"
                  />
                </label>

                <div className="form-buttons">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Checking…' : 'Lookup'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCode('')}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {result && (
                <div className={`lookup-result ${result.found ? 'success' : 'error'}`}>
                  {result.found ? (
                    <div>
                      <h3>Booking Found</h3>
                      <p>Confirmation code <strong>{result.code}</strong> is valid.</p>
                      <p className="result-subtext">You can view more details in your profile or contact our support team for additional assistance.</p>
                    </div>
                  ) : (
                    <div>
                      <h3>Booking Could Not Be Found</h3>
                      <p>Please verify your confirmation code and try again.</p>
                      <p className="result-subtext">Need help? <a href="/support">Contact our support team</a></p>
                    </div>
                  )}
                </div>
              )}

              <div className="lookup-tips">
                <h4>Tips:</h4>
                <ul>
                  <li>Confirmation codes are usually in your booking email</li>
                  <li>Check your spam folder if you haven't received it</li>
                  <li>Contact support if you've lost your code</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}