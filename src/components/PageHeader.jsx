import React from 'react';

const PageHeader = ({ title, subtitle, action }) => (
  <div
    className="page-header"
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 32,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}
  >
    <div>
      <h1
        style={{
          fontSize: '1.85rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: 0,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: '0.95rem',
            color: '#64748b',
            fontWeight: 500,
            marginTop: 6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="page-header-actions">{action}</div>}
  </div>
);

export default PageHeader;
