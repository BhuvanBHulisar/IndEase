import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Check, Trash2, X } from 'lucide-react';

const Topbar = ({ user, notifications = [], onClearNotifs, onMarkRead }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const notifRef = useRef(null);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  // Use actual user data from props
  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'
    : 'User';
  const initials = user
    ? `${(user.firstName || user.email || 'U')[0].toUpperCase()}${(user.lastName || '')[0]?.toUpperCase() || ''}`
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="dashboard-topbar"
      style={{
        height: '72px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px 10px 40px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
            color: '#0f172a',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb';
            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
            e.target.style.background = '#ffffff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
            e.target.style.background = '#f8fafc';
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <Bell size={20} color="#64748b" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #fff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '380px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'fadeInUp 0.2s ease',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => { onClearNotifs && onClearNotifs(); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={14} /> Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    <X size={16} color="#94a3b8" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                  }}>
                    <Bell size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                      No notifications yet
                    </p>
                    <p style={{ fontSize: '12px', margin: '4px 0 0', color: '#cbd5e1' }}>
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => {
                    const typeColors = {
                      critical: { bg: '#fef2f2', icon: '🔴', border: '#fecaca' },
                      warning: { bg: '#fffbeb', icon: '🟡', border: '#fed7aa' },
                      success: { bg: '#ecfdf5', icon: '🟢', border: '#bbf7d0' },
                      info: { bg: '#eff6ff', icon: '🔵', border: '#bfdbfe' },
                      system: { bg: '#f8fafc', icon: '⚙️', border: '#e2e8f0' },
                    };
                    const tc = typeColors[notif.type] || typeColors.info;

                    return (
                      <div
                        key={notif.id}
                        onClick={() => onMarkRead && onMarkRead(notif.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '14px 20px',
                          borderBottom: '1px solid #f8fafc',
                          cursor: 'pointer',
                          background: notif.read ? '#fff' : '#f8fafc',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? '#fff' : '#f8fafc'}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: tc.bg,
                          border: `1px solid ${tc.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          flexShrink: 0,
                        }}>
                          {tc.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            fontWeight: notif.read ? 500 : 600,
                            color: '#1e293b',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {notif.msg}
                          </p>
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                            {notif.time}
                          </span>
                        </div>
                        {!notif.read && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            flexShrink: 0,
                            marginTop: '6px',
                          }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            {displayName}
          </span>
          <ChevronDown size={16} color="#64748b" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
