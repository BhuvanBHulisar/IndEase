import React, { useState, useEffect } from 'react';
import axios from 'axios';

// SVG Icons
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
    <path d="M3 12A9 3 0 0 0 21 12"></path>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('db_viewer_token') || '');
  const [apiUrl] = useState('http://localhost:5000/api');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  
  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const [confirmDelete, setConfirmDelete] = useState({ open: false, row: null, table: null });

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${apiUrl}/auth/login`, authForm);
      const newToken = res.data.token || res.data.accessToken;
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('db_viewer_token', newToken);
      } else {
        throw new Error("No token returned");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('db_viewer_token');
    setTablesList([]);
    setCounts({});
    setTableData([]);
    setSelectedTable(null);
  };

  // Fetch Tables & Counts
  useEffect(() => {
    if (token) {
      fetchCounts();
    }
  }, [token]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/admin/db/counts`, getHeaders());
      setCounts(res.data);
      const tables = Object.keys(res.data);
      setTablesList(tables);
      if (tables.length > 0 && !selectedTable) {
        setSelectedTable(tables[0]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
      } else {
        setError("Failed to fetch tables. Is server running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (table) => {
    if (!table) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/admin/db/${table}`, getHeaders());
      setTableData(res.data);
      setCurrentPage(1);
      setSearchQuery('');
    } catch (err) {
      setError(`Failed to fetch data for ${table}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable && token) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, token]);

  const handleDelete = async () => {
    const { table, row } = confirmDelete;
    try {
      await axios.delete(`${apiUrl}/admin/db/${table}/${row.id}`, getHeaders());
      setTableData(tableData.filter(d => d.id !== row.id));
      setCounts(prev => ({ ...prev, [table]: Math.max(0, prev[table] - 1) }));
      setConfirmDelete({ open: false, row: null, table: null });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  if (!token) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.loginHeader}>
            <DatabaseIcon />
            <div>
              <h2 style={{color: 'var(--primary-blue)', margin: 0}}>IndEase</h2>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Database Viewer</p>
            </div>
          </div>
          {error && <div style={styles.errorBanner}>{error}</div>}
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label>Admin Email</label>
              <input 
                type="email"
                style={styles.input}
                value={authForm.email} 
                onChange={e => setAuthForm({...authForm, email: e.target.value})} 
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Password</label>
              <input 
                type="password"
                style={styles.input}
                value={authForm.password} 
                onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                required
              />
            </div>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter and Pagination
  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  const renderCellContent = (key, val) => {
    if (val === null || val === undefined) return <span style={styles.nullText}>null</span>;
    if (typeof val === 'object') return JSON.stringify(val);
    
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
      return "••••••";
    }

    if (lowerKey === 'status' || lowerKey === 'role') {
      const color = val === 'completed' || val === 'approved' || val === 'admin' ? 'var(--teal-accent)' : 
                    val === 'pending' ? '#f59e0b' : 
                    val === 'consumer' ? 'var(--primary-blue)' :
                    val === 'producer' ? '#8b5cf6' :
                    '#64748b';
      return <span style={{...styles.badge, backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40`}}>{val}</span>;
    }

    if (typeof val === 'boolean') {
      return val ? 'true' : 'false';
    }

    // truncate long text
    const strVal = String(val);
    if (strVal.length > 50) return strVal.substring(0, 50) + '...';
    
    return strVal;
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <DatabaseIcon />
          <h2 style={{fontSize: '1.2rem', margin: 0}}>DB Viewer</h2>
        </div>
        <div style={styles.sidebarContent}>
          {tablesList.map(t => (
            <div 
              key={t} 
              onClick={() => setSelectedTable(t)}
              style={{
                ...styles.tableItem, 
                backgroundColor: selectedTable === t ? 'var(--surface2-color)' : 'transparent',
                borderLeft: selectedTable === t ? '3px solid var(--primary-blue)' : '3px solid transparent'
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                <span style={{color: selectedTable === t ? 'var(--primary-blue)' : 'var(--text-main)'}}>{t}</span>
                <span style={styles.countBadge}>{counts[t] || 0}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.sidebarFooter}>
          <button onClick={logout} style={styles.btnLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{fontSize: '1.5rem', textTransform: 'capitalize'}}>{selectedTable?.replace(/_/g, ' ')}</h1>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{tableData.length} records found</p>
          </div>
          <div style={styles.searchBox}>
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search in table..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button onClick={() => fetchTableData(selectedTable)} style={styles.btnRefresh}>Refresh</button>
          </div>
        </div>

        {/* Error/Loading */}
        {error && <div style={styles.errorBanner}>{error}</div>}

        {/* Table Area */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.centerMsg}>Loading data...</div>
          ) : tableData.length === 0 ? (
            <div style={styles.centerMsg}>No records found in this table.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Actions</th>
                  {columns.map(col => (
                    <th key={col} style={styles.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(row => (
                  <tr key={row.id || JSON.stringify(row)} style={styles.tr}>
                    <td style={styles.td}>
                      <button 
                        onClick={() => setConfirmDelete({open: true, row, table: selectedTable})}
                        style={styles.btnDelete}
                        title="Delete Record"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                    {columns.map(col => (
                      <td key={col} style={styles.td}>
                        {renderCellContent(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Details */}
        {!loading && tableData.length > 0 && (
          <div style={styles.pagination}>
            <span style={{color: 'var(--text-muted)'}}>
              Showing {(currentPage-1)*rowsPerPage + 1} to {Math.min(currentPage*rowsPerPage, filteredData.length)} of {filteredData.length}
            </span>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                style={styles.btnPage} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Prev
              </button>
              <button 
                style={styles.btnPage} 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{margin: '0 0 1rem 0', color: 'var(--text-main)'}}>Delete this record?</h3>
            <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
              Are you sure you want to delete record <strong>{confirmDelete.row?.id}</strong> from <strong>{confirmDelete.table}</strong>? This action cannot be undone.
            </p>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
              <button onClick={() => setConfirmDelete({open: false, row: null, table: null})} style={styles.btnCancel}>Cancel</button>
              <button onClick={handleDelete} style={{...styles.btnPrimary, backgroundColor: 'var(--danger-color)'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loginContainer: {
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)'
  },
  loginCard: {
    backgroundColor: 'var(--surface-color)', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
  },
  loginHeader: {
    display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
  },
  input: {
    padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface2-color)', color: 'var(--text-main)', outline: 'none'
  },
  btnPrimary: {
    padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--primary-blue)', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '0.5rem'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid var(--danger-color)', fontSize: '0.9rem'
  },
  layout: {
    display: 'flex', height: '100vh', overflow: 'hidden'
  },
  sidebar: {
    width: '240px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column'
  },
  sidebarHeader: {
    padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-blue)'
  },
  sidebarContent: {
    flex: 1, overflowY: 'auto', padding: '1rem 0'
  },
  tableItem: {
    padding: '0.75rem 1.5rem', cursor: 'pointer', display: 'flex', transition: 'background 0.2s', fontSize: '0.95rem'
  },
  countBadge: {
    backgroundColor: 'var(--surface-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)'
  },
  sidebarFooter: {
    padding: '1rem', borderTop: '1px solid var(--border-color)'
  },
  btnLogout: {
    width: '100%', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--surface2-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)'
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', overflow: 'hidden'
  },
  header: {
    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)'
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)'
  },
  searchInput: {
    background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '200px'
  },
  btnRefresh: {
    marginLeft: '1rem', padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: 'var(--surface2-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)'
  },
  tableContainer: {
    flex: 1, overflow: 'auto', padding: '0'
  },
  table: {
    width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap'
  },
  th: {
    padding: '1rem', borderBottom: '2px solid var(--border-color)', position: 'sticky', top: 0, backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', zIndex: 10
  },
  tr: {
    borderBottom: '1px solid var(--border-color)'
  },
  td: {
    padding: '0.75rem 1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace', fontSize: '0.9rem'
  },
  badge: {
    padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block'
  },
  nullText: {
    color: 'var(--text-muted)', fontStyle: 'italic'
  },
  btnDelete: {
    color: 'var(--danger-color)', padding: '0.25rem', opacity: 0.7, transition: 'opacity 0.2s', cursor: 'pointer'
  },
  centerMsg: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)'
  },
  pagination: {
    padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)'
  },
  btnPage: {
    padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  modal: {
    backgroundColor: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '450px'
  },
  btnCancel: {
    padding: '0.75rem 1rem', borderRadius: '4px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)'
  }
};
