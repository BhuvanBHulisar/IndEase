import React, { useState, useEffect } from 'react';
import axios from 'axios';

// SVG Icons
const TrashIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const Shield = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SearchIcon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const AlertCircle = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ChevronLeft = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const DatabaseIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
    <path d="M3 12A9 3 0 0 0 21 12"></path>
  </svg>
)

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

  useEffect(() => {
    if (token) fetchCounts();
  }, [token]);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

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
      if (err.response?.status === 401) logout();
      else setError("Failed to fetch tables. Is server running?");
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
    if (selectedTable && token) fetchTableData(selectedTable);
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

  // --- LOGIN VIEW ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#0d9488]/10 text-[#0d9488] rounded-full flex items-center justify-center">
              <Shield size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight">
                <span className="text-[#0d9488]">IndEase</span> <span className="text-slate-900">DB</span>
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">Data Explorer Access</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Admin Email</label>
              <input
                type="email"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                value={authForm.email}
                onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="admin@indease.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-base font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DATA OPERATIONS ---
  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some(val => val !== null && val !== undefined && val.toString().toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  const renderCellContent = (key, val) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic font-normal">null</span>;
    if (typeof val === 'object') return <span>{JSON.stringify(val)}</span>;

    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
      return <span className="text-slate-400">••••••••</span>;
    }

    if (lowerKey === 'status' || lowerKey === 'role') {
      let badgeClasses = "px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase ";

      if (val === 'completed' || val === 'approved' || val === 'admin') badgeClasses += "bg-emerald-100 text-emerald-700";
      else if (val === 'pending') badgeClasses += "bg-amber-100 text-amber-700";
      else if (val === 'consumer') badgeClasses += "bg-blue-100 text-blue-700";
      else if (val === 'producer') badgeClasses += "bg-indigo-100 text-indigo-700";
      else badgeClasses += "bg-slate-100 text-slate-600";

      return <span className={badgeClasses}>{val}</span>;
    }

    if (typeof val === 'boolean') {
      return <span className={`font-bold ${val ? 'text-[#0d9488]' : 'text-slate-500'}`}>{val ? 'true' : 'false'}</span>;
    }

    const strVal = String(val);
    if (strVal.length > 50) return <span className="text-slate-600">{strVal.substring(0, 50)}...</span>;
    return <span className="text-slate-700">{strVal}</span>;
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-900 font-sans">

      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black tracking-tight">
            <span className="text-[#0d9488]">INDEASE</span> <span className="text-slate-900">DB</span>
          </h1>
        </div>

        <div className="flex items-center gap-5">
          {/* Mock Dark/Bell toggle matching UI screenshot */}
          <div className="flex items-center gap-4 text-slate-500 pr-5 border-r border-slate-200">
            <button className="hover:text-slate-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            </button>
            <button className="hover:text-slate-900 transition-colors relative">
              <BellIcon size={20} />
            </button>
          </div>

          {/* Avatar Section */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">Admin Root</p>
              <p className="text-xs font-semibold text-slate-500">Database Viewer</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#0d9488] text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-sm">
              AR
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-sm">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] mb-4 px-3 mt-2">Database Tables</div>
            {tablesList.map(t => {
              const isActive = selectedTable === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-[#0d9488]/10 text-[#0d9488]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <DatabaseIcon size={16} className={isActive ? "text-[#0d9488]" : "text-slate-400"} />
                    <span className="truncate tracking-tight capitalize">{t.replace(/_/g, ' ')}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-[#0d9488] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {counts[t] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-5 border-t border-slate-200">
            <button
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">

          {/* Top Actions Bar */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight mb-1">{selectedTable?.replace(/_/g, ' ')}</h2>
              <p className="text-sm font-semibold text-slate-500">{tableData.length} records retrieved</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="w-72 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <button
                onClick={() => fetchTableData(selectedTable)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold flex items-center gap-3 shadow-sm">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Data Grid Area */}
          <div className="flex-1 overflow-auto p-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0d9488] animate-spin" />
                <p className="font-bold text-sm tracking-wide">Syncing data...</p>
              </div>
            ) : tableData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                  <DatabaseIcon size={32} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-500">No records found mapped to this table.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-16 text-center">Actions</th>
                        {columns.map(col => (
                          <th key={col} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {col.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.map((row, idx) => (
                        <tr key={row.id || typeof row === 'object' ? JSON.stringify(row) : idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => setConfirmDelete({ open: true, row, table: selectedTable })}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Record"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </td>
                          {columns.map(col => (
                            <td key={col} className="px-6 py-3 text-[13px] font-semibold font-mono text-slate-600 max-w-[300px] truncate">
                              {renderCellContent(col, row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Bar */}
          {!loading && tableData.length > 0 && (
            <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
              <p className="text-sm font-semibold text-slate-500">
                Showing <span className="text-slate-900">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="text-slate-900">{filteredData.length}</span> results
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-bold"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="font-bold text-sm text-slate-700 px-3 border border-slate-200 rounded-xl h-10 flex items-center justify-center">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-bold"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Modern Pop / Modal for Deletion matches light theme */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center pt-10">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <TrashIcon size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Delete record?</h3>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed px-2">
                Drop <span className="font-bold text-slate-900">{confirmDelete.row?.id ? `ID #${confirmDelete.row.id.substring(0, 8)}` : 'this record'}</span> from <span className="font-black text-[#0d9488]">{confirmDelete.table?.replace(/_/g, ' ')}</span>? This action cannot be reversed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-8 pt-2">
              <button
                onClick={() => setConfirmDelete({ open: false, row: null, table: null })}
                className="py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
              >
                Keep it
              </button>
              <button
                onClick={handleDelete}
                className="py-3.5 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md hover:shadow-lg text-sm tracking-wide"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BellIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
