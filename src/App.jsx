import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
// Simple popup modal for feedback
function PopupModal({ title = 'Support Ticket Submitted', message, onClose }) {
  return (
    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(1px)' }}>
      <div className="confirm-modal animate-fade" style={{ width: '350px', textAlign: 'center', padding: '35px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ width: '70px', height: '70px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: '2.5rem', color: '#10b981' }}>✓</span>
        </div>
        <h3 style={{ color: 'var(--navy-dark)', marginBottom: '10px', fontSize: '1.3rem', fontWeight: '800' }}>{title}</h3>
        <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>{message}</p>
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '700', borderRadius: '10px' }} onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
import { GoogleLogin } from '@react-oauth/google';
import api from './api';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';
import './producer-styles.css';
import './signup.css';

// [NEW] FALLBACK MOCK DATA
const MOCK_MACHINES = [
  { id: 'local-1', name: 'Hydraulic Press #08', machine_type: 'Hydraulic Press', oem: 'Hydra-Tech Germany', model_year: 1998, condition_score: 45 },
  { id: 'local-2', name: 'CNC Mill X-200', machine_type: 'CNC Concentric', oem: 'Siemens Industrial', model_year: 2015, condition_score: 92 },
  { id: 'local-3', name: 'Backup Generator G-5', machine_type: 'Generator', oem: 'Caterpillar', model_year: 2020, condition_score: 98 }
];

// [NEW] INDIAN INDUSTRIAL CITIES & STATES
const INDIAN_LOCATIONS = [
  { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nasik", "Aurangabad", "Thane"] },
  { state: "Karnataka", cities: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir", "Vijayanagara"] },
  { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode"] },
  { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"] },
  { state: "Delhi", cities: ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"] },
  { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam"] },
  { state: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"] },
  { state: "Uttar Pradesh", cities: ["Noida", "Kanpur", "Lucknow", "Ghaziabad", "Agra", "Varanasi"] },
  { state: "Punjab", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"] },
  { state: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"] },
  { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"] },
  { state: "Kerala", cities: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"] }
];

const MOCK_MESSAGES = [
  { id: 101, chatId: 1, sender: 'expert', text: "Systems check complete. We are seeing some pressure variance.", time: "10:04 AM" },
  { id: 102, chatId: 1, sender: 'user', text: "Noted. Is it critical?", time: "10:12 AM" },
  { id: 103, chatId: 1, sender: 'expert', text: "Not yet, but we recommend scheduling a valve seal replacement.", time: "10:15 AM" }
];

// Helper to parse special message types (Invoices)
const parseMessageBody = (text) => {
  if (text && text.startsWith('[INVOICE]:')) {
    try {
      const payload = JSON.parse(text.substring(10));
      return { type: 'invoice', amount: payload.amount, desc: payload.desc };
    } catch (e) {
      return { type: 'text', text: text };
    }
  }
  return { type: 'text', text: text };
};

function App() {
  // [NEW] LOGIN FORM STATE
  const [formData, setFormData] = useState({ email: '', password: '' });
  // Dark mode toggle handler
  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };
  // --- CORE APPLICATION STATES ---
  const [view, setView] = useState('landing');
  const [socket, setSocket] = useState(null);
  // Popup for booking expert
  const [showBookExpertModal, setShowBookExpertModal] = useState(false);
  // Real-time chart update listener
  useEffect(() => {
    if (!socket) return;
    const handleChartUpdate = async () => {
      try {
        const chartRes = await api.get('/finance/chart-data');
        setChartData(chartRes.data);
      } catch (err) {
        console.error('Failed to update chart data in real time', err);
      }
    };
    socket.on('finance_chart_update', handleChartUpdate);
    return () => socket.off('finance_chart_update', handleChartUpdate);
  }, [socket]);
  const [role, setRole] = useState('consumer'); // State to track Machine Owner vs Repair Expert
  const [isLogin, setIsLogin] = useState(true);
  // Handler to simulate booking expert (call this where booking happens)
  const handleBookExpert = () => {
    setShowBookExpertModal(true);
    // ...any other booking logic...
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // For toggling visibility
  const [activeTab, setActiveTab] = useState('fleet'); // Toggle between 'fleet', 'history', 'legacy', 'profile', 'help', 'settings'
  const [searchQuery, setSearchQuery] = useState(''); // Search state for history
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal for account deletion confirmation

  // [NEW SIGNUP STATES]
  const [helpSearch, setHelpSearch] = useState(''); // Search state for help section

  const [signupStep, setSignupStep] = useState(1); // 1: Details, 2: OTP, 3: Context
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState(''); // Added Phone Number
  const [confirmPassword, setConfirmPassword] = useState(''); // Added Confirm Password
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [taxId, setTaxId] = useState('');
  const [otp, setOtp] = useState('');
  const [extraInfo, setExtraInfo] = useState(''); // Company for Consumer, Skill for Producer

  // [NEW IDENTITY & PHOTO STATES]
  const [userPhoto, setUserPhoto] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  // Language selection removed as per request
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // [NEW NOTIFICATION STATE]
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', msg: 'Hydraulic Press #08: Pressure Drop Detected', time: '10 mins ago', read: false },
    { id: 2, type: 'info', msg: 'Service Ledger Updated: Motor Drive #A1', time: '2 hours ago', read: true },
    { id: 3, type: 'success', msg: 'New Expert Verified: XP-992 (Hydraulics)', time: '5 hours ago', read: true }
  ]);
  const [machines, setMachines] = useState(MOCK_MACHINES); // [FIX] Init with mock data


  // [NEW] NOTIFICATION & DROPDOWN STATES
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null); // Ref for closing dropdown when clicking outside

  // [NEW] PROFILE EDITING STATE
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Expert Technician",
    role: "Industrial Automation Specialist",
    location: "Mumbai, India",
    phone: "+91 98765 43210",
    email: "expert@originode.com",
    id: "IND-88219",
    skills: []
  });

  // [NEW] FILTER STATE & LOGIC
  const [activeFilter, setActiveFilter] = useState('All');
  const [fleetSearch, setFleetSearch] = useState('');

  const firstInitial = (firstName || '').charAt(0).toUpperCase();
  const lastInitial = (lastName || '').charAt(0).toUpperCase();

  // Filter logic
  // [FIX] Add safety check (machines || []) to prevent crash if state is momentarily null
  const filteredMachines = (machines || []).filter(m => {
    // 1. Filter by Tab
    let matchesTab = true;
    const score = Number(m?.condition_score ?? 0);
    if (activeFilter === 'Operational') matchesTab = score > 50;
    if (activeFilter === 'Maintenance') matchesTab = score <= 50;

    // 2. Filter by Search
    const machineName = (m?.name || '').toLowerCase();
    const machineType = (m?.machine_type || '').toLowerCase();
    const search = (fleetSearch || '').toLowerCase();
    const matchesSearch = machineName.includes(search) || machineType.includes(search);

    return matchesTab && matchesSearch;
  });

  // Dynamic Stats
  const activeNodesCount = (machines || []).length;
  const criticalIssuesCount = (machines || []).filter(m => m.condition_score <= 30).length;
  // Calculate average continuity (health)
  const avgContinuity = (machines || []).length > 0
    ? ((machines || []).reduce((acc, m) => acc + (m.condition_score || 0), 0) / (machines || []).length).toFixed(1)
    : '100.0';

  const [serviceRadius, setServiceRadius] = useState(50);



  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --- REFS ---
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  // [NEW] SETTINGS PREFERENCES
  // Add dark mode toggle button to settings tab
  // Render this button in your settings UI:
  // <button className="btn btn-primary" onClick={handleDarkModeToggle} style={{margin:'10px'}}>Toggle Dark Mode</button>
  // Start in light mode by default
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('Public');
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // [NEW] Social Account Selector States
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const simulatedAccounts = [
    { name: 'Bhuvan B H', email: 'bhuvan@originode.tech', avatar: 'https://ui-avatars.com/api/?name=Bhuvan+BH&background=020617&color=fff' },
    { name: 'Technical Admin', email: 'admin@originode.com', avatar: 'https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff' },
    { name: 'Industrial Guest', email: 'guest.identity@industries.in', avatar: 'https://ui-avatars.com/api/?name=Guest&background=334155&color=fff' }
  ];

  // [NEW] VIDEO DIAGNOSIS STATES
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState(1); // 1: Upload, 2: Scanning, 3: Results
  const [videoFile, setVideoFile] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [diagnosisResults, setDiagnosisResults] = useState([]);


  // [NEW] VIDEO DIAGNOSIS HANDLERS
  const [nodeToDelete, setNodeToDelete] = useState(null); // State for machine deletion confirmation modal

  // [NEW] PAYMENT STATE
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [showPaymentReceived, setShowPaymentReceived] = useState(false);
  const [completedJobId, setCompletedJobId] = useState(null);

  const [showExpertProfileModal, setShowExpertProfileModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false);
  const [invoiceData, setInvoiceData] = useState({ amount: '', desc: '' });
  const [supportTicket, setSupportTicket] = useState({ subject: 'Machine Diagnosis Error', description: '' });
  const [myTickets, setMyTickets] = useState([]);
  const [callRequest, setCallRequest] = useState({ machineId: '', preferredTime: '' });

  // Popup state for support ticket
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [supportPopupMsg, setSupportPopupMsg] = useState("");

  // [NEW] CHAT & MESSAGE STATES
  const [activeChatId, setActiveChatId] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState([
    { id: 1, name: "Expert Technician (You)", avatar: "XT", lastMsg: "Please review the invoice...", time: "2m ago", unread: 1 },
    { id: 2, name: "Hydra-Fix Specialists", avatar: "HF", lastMsg: "We can schedule a visit...", time: "1h ago", unread: 0 }
  ]);
  const [producerChats, setProducerChats] = useState([
    { id: 1, name: "Bhuvan B H (Consumer)", avatar: "BH", lastMsg: "Payment confirmed.", time: "1m ago", unread: 1 },
    { id: 2, name: "Solaris Power", avatar: "SP", lastMsg: "Invoice received, thanks.", time: "2h ago", unread: 0 }
  ]);
  const [messages, setMessages] = useState(MOCK_MESSAGES); // [FIX] Init with mock data

  const [radarJobs, setRadarJobs] = useState([]);

  // [NEW] DASHBOARD STATS
  const [producerDashStats, setProducerDashStats] = useState({ earnings: 0, completedJobs: 0, rating: 5.0 });
  const [earningsStats, setEarningsStats] = useState({ totalRevenue: 0, pendingPayout: 0, avgTicket: 0 });
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // [NEW] FETCH FINANCIAL STATS
  useEffect(() => {
    if (activeTab === 'earnings' || activeTab === 'history' || (activeTab === 'fleet' && role === 'consumer')) {
      const fetchFinanceData = async () => {
        try {
          const statsRes = await api.get('/finance/stats');
          setEarningsStats(statsRes.data);

          const historyRes = await api.get('/finance/history');
          setTransactionHistory(historyRes.data);

          const chartRes = await api.get('/finance/chart-data');
          setChartData(chartRes.data);
        } catch (err) {
          console.error("Failed to load financial data", err);
        }
      };

      fetchFinanceData();
    }
  }, [activeTab]);

  // [NEW] FETCH SUPPORT TICKETS
  useEffect(() => {
    if (activeTab === 'help' || activeTab === 'support') {
      const fetchTickets = async () => {
        try {
          const res = await api.get('/support/tickets');
          setMyTickets(res.data);
        } catch (err) {
          console.error("Failed to fetch support tickets", err);
        }
      };
      fetchTickets();
    }
  }, [activeTab]);

  // [NEW] FETCH EXPERT SCHEDULE
  useEffect(() => {
    if (activeTab === 'schedule' && role === 'producer') {
      const fetchSchedule = async () => {
        try {
          const res = await api.get('/schedule');
          setWeeklySchedule(res.data);
        } catch (err) {
          console.error("Failed to load schedule", err);
        }
      };
      fetchSchedule();
    }
  }, [activeTab]);

  const handleOptimizeSchedule = async () => {
    // AI intelligent scan and optimization removed from operation schedule
    // You can add your own schedule logic here if needed
  };

  const handleConfirmAISchedule = async () => {
    try {
      // Batch save suggested slots
      for (const slot of suggestedSlots) {
        await api.post('/schedule', slot);
      }
      setWeeklySchedule([...weeklySchedule, ...suggestedSlots]);
      setSuggestedSlots([]);
      alert("AI Suggestions synchronized with your operations log!");
    } catch (err) {
      alert("Failed to synchronize suggestions.");
    }
  };

  // [NEW] FETCH PROFILE DATA
  useEffect(() => {
    if (view === 'dashboard' && (activeTab === 'profile' || activeTab === 'settings')) {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/profile');
          const data = res.data;
          setProfileData({
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || "Expert Technician",
            role: data.role === 'producer' ? 'Industrial Automation Specialist' : 'Business Owner',
            location: data.location || "Not Set",
            phone: data.phone || phone,
            email: data.email,
            id: String(data.id || 'IND-88219').slice(0, 8).toUpperCase(),
            skills: data.skills || []
          });
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setPhone(data.phone || '');
          setDob(data.dob || '');
          setExtraInfo(data.organization || '');
          setLocation(data.location || '');
          if (data.location && data.location.includes(', ')) {
            const [city, state] = data.location.split(', ');
            setSelectedCity(city);
            setSelectedState(state);
          }
          setTaxId(data.tax_id || '');
          setUserPhoto(data.photo_url || null);
          setIsVerified(data.is_verified || false);
          if (data.service_radius) setServiceRadius(data.service_radius);
          setOriginalData(data);
        } catch (err) {
          console.error("Failed to load profile", err);
          // Potential reason: missing table columns in DB, check schema.sql
        }
      };
      fetchProfile();
    }
  }, [activeTab, view]);

  const handleSaveConsumerProfile = async () => {
    const hasChanged =
      firstName !== (originalData.first_name || '') ||
      lastName !== (originalData.last_name || '') ||
      phone !== (originalData.phone || '') ||
      dob !== (originalData.dob || '') ||
      extraInfo !== (originalData.organization || '') ||
      location !== (originalData.location || '') ||
      taxId !== (originalData.tax_id || '') ||
      userPhoto !== (originalData.photo_url || null);

    if (!hasChanged) {
      setShowNoChangesModal(true);
      setIsEditingProfile(false);
      return;
    }

    try {
      await api.patch('/profile', {
        first_name: firstName,
        last_name: lastName,
        phone,
        dob,
        organization: extraInfo,
        location,
        tax_id: taxId,
        photo_url: userPhoto
      });
      setShowSaveSuccessModal(true);
      setIsEditingProfile(false);
      // Update baseline after successful save
      setOriginalData({
        ...originalData,
        first_name: firstName,
        last_name: lastName,
        phone,
        dob,
        organization: extraInfo,
        location,
        tax_id: taxId,
        photo_url: userPhoto
      });
    } catch (err) {
      alert("Failed to sync profile changes.");
    }
  };

  const handleSaveExpertProfile = async () => {
    if (isEditingProfile) {
      const [fName, ...lNames] = profileData.name.split(' ');
      const hasChanged =
        fName !== (originalData.first_name || '') ||
        lNames.join(' ') !== (originalData.last_name || '') ||
        String(serviceRadius) !== String(originalData.service_radius || '') ||
        profileData.location !== (originalData.location || '') ||
        profileData.phone !== (originalData.phone || '') ||
        JSON.stringify(profileData.skills) !== JSON.stringify(originalData.skills || []);

      if (!hasChanged) {
        setShowNoChangesModal(true);
        setIsEditingProfile(false);
        return;
      }

      try {
        const payload = {
          first_name: fName,
          last_name: lNames.join(' '),
          service_radius: serviceRadius,
          skills: profileData.skills,
          location: profileData.location,
          phone: profileData.phone
        };

        await api.patch('/profile', payload);
        fName && setFirstName(fName);
        lNames.length > 0 && setLastName(lNames.join(' '));
        setPhone(profileData.phone);
        setLocation(profileData.location);
        setIsEditingProfile(false);
        setShowSaveSuccessModal(true);
        setOriginalData({
          ...originalData,
          ...payload
        });
      } catch (err) {
        console.error("Save failure:", err);
        alert("Failed to synchronize profile.");
      }
    } else {
      setIsEditingProfile(true);
    }
  };

  const handleAddSkill = async (newSkill) => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      try {
        await api.post('/profile/skills', { skill: newSkill });
        setProfileData({ ...profileData, skills: [...profileData.skills, newSkill] });
      } catch (err) {
        alert("Failed to update arsenal.");
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      await api.delete(`/profile/skills/${encodeURIComponent(skillToRemove)}`);
      setProfileData({
        ...profileData,
        skills: profileData.skills.filter(s => s !== skillToRemove)
      });
    } catch (err) {
      alert("Failed to decommission skill.");
    }
  };

  const handleExportCSV = () => {
    if (transactionHistory.length === 0) return alert("No industrial records to export");

    let csvContent = "data:text/csv;charset=utf-8,";
    const header = role === 'producer' ? "Date,Client,Service,Status,Amount" : "Date,Machine,Expert,Action,Status";
    csvContent += header + "\n";

    transactionHistory.forEach(tx => {
      if (role === 'producer') {
        csvContent += `${tx.date},${tx.client},${tx.service},${tx.status},${tx.amount}\n`;
      } else {
        // Consumer context (Ledger)
        csvContent += `${tx.date},${tx.machine || tx.client},${tx.expert || tx.service},${tx.action || tx.service},${tx.status}\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = role === 'producer' ? `origiNode_earnings_${new Date().toLocaleDateString()}.csv` : `origiNode_ledger_${new Date().toLocaleDateString()}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExpertInitials = () => {
    const parts = (profileData.name || "").split(" ");
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return (profileData.name || "X")[0];
  };

  // Placeholder for consolidated handlers removed to avoid duplicates


  // [NEW] PROFILE DASHBOARD DATA
  const trustScore = isVerified ? 98 : 45;
  const totalNodes = 24;

  // Language translation dictionary removed as per request

  // Translation proxy removed as language selection is not available
  // [NEW] SESSION & SOCKET INITIALIZATION
  useEffect(() => {
    // 1. Check for existing industrial session
    const token = localStorage.getItem('token');
    if (token) {
      // Actually verify with the backend now that we have the endpoint
      api.get('/auth/me')
        .then(res => {
          const user = res.data;
          setView('dashboard');
          setEmail(user.email || '');
          setRole(user.role || 'consumer');
          setFirstName(user.firstName || user.first_name || '');
          setLastName(user.lastName || user.last_name || '');

          // Update local storage in case it was stale
          localStorage.setItem('user', JSON.stringify(user));

          // Initial notification fetch
          fetchNotifications();
        })
        .catch(err => {
          console.warn('[Auth] Session invalid or expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setView('landing');
        });
    }

    // 2. Initialize Socket Connection
    const newSocket = io('http://localhost:5000');

    // Identify user for targeted events
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
          newSocket.emit('identify', user.id);
        }
      } catch (e) { }
    }

    newSocket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    // Real-time: new service broadcast from a consumer
    newSocket.on('new_signal', (newJob) => {
      setRadarJobs(prev => {
        // Avoid duplicates if we already have this job
        if (prev.some(j => j.id === newJob.id)) return prev;
        return [newJob, ...prev];
      });
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (Array.isArray(res.data)) {
        // Map backend to frontend schema
        const mapped = res.data.map(n => ({
          id: n.id,
          type: n.type || 'info',
          msg: n.message || n.title,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: n.is_read
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn('Notification retrieval offline.');
    }
  };

  // Logic to handle clicking outside notification dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- NOTIFICATION HANDLERS ---
  const handleClearNotifs = () => setNotifications([]);

  // [NEW] Legacy Search States
  const [legacyQuery, setLegacyQuery] = useState('');
  const [legacyResults, setLegacyResults] = useState([]);

  // [NEW] Demo Database of Legacy Makers
  const legacyDatabase = [
    { id: 101, name: "Hydra-Tech Germany", years: "1970-1995", status: "Dissolved", replacement: "Berlin Industrial Corp", category: "Hydraulics" },
    { id: 102, name: "Textile-Matic UK", years: "1982-2004", status: "Acquired", replacement: "Global Weaver Group", category: "Textiles" },
    { id: 103, name: "Precision Motors Inc", years: "1965-Present", status: "Active", replacement: "Direct Support Available", category: "Motors" }
  ];

  // [NEW] FAQ LIST FOR SEARCH
  const faqs = [
    { q: "What if my manufacturer is no longer in business?", a: "Use the Legacy Search tab to find the company that acquired their patents or assets. Our database contains information about successor companies and can help you trace the lineage of your equipment." },
    { q: "How do I become a Verified Expert?", a: "Switch to Producer role and submit your industrial certifications through the Expert Portal. Our team will verify your credentials within 3-5 business days." },
    { q: "How long does expert response typically take?", a: "Our verified experts typically respond within 2-4 hours during business hours. For urgent issues, you can upgrade to priority support for guaranteed 30-minute response times." },
    { q: "Can I export my service history?", a: "Yes! Go to your Fleet Overview, select machines, and use the Export Report button to download service history as PDF or CSV for your records." }
  ];

  // [NEW] HELP & SUPPORT UNLOCK STATES
  const [showCallModal, setShowCallModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // [NEW] REPORT MODAL STATE
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // [NEW] ADD MACHINE STATE
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [newMachineData, setNewMachineData] = useState({ name: '', oem: '', model_year: '', machine_type: '' });

  // Handlers and states moved to consolidated sections


  const handleSendInvoice = async () => {
    if (!invoiceData.amount || !invoiceData.desc) return alert("Please fill details");

    try {
      // 1. Call Backend API to Create Invoice & Update State
      await api.post(`/jobs/${activeChatId}/invoice`, {
        amount: invoiceData.amount
      });

      // 2. Send Chat Message for Record
      const invoicePayload = JSON.stringify({ amount: invoiceData.amount, desc: invoiceData.desc });
      const formattedMsg = `[INVOICE]:${invoicePayload}`;

      if (socket) {
        const user = JSON.parse(localStorage.getItem('user'));
        socket.emit('send_message', {
          requestId: activeChatId,
          senderId: user.id || user.user_id, // Ensure ID is present
          text: formattedMsg
        });
      }

      alert("Invoice Sent Successfully!");
      setShowInvoiceCreator(false);
      setInvoiceData({ amount: '', desc: '' });

    } catch (err) {
      console.error("Failed to create invoice", err);
      alert("Failed to send invoice. Please try again.");
    }
  };



  // [NEW VIDEO LIST]
  const tutorialVideos = [
    { id: 1, title: "How to trace legacy machines", duration: "5:20", thumbnail: "📹" },
    { id: 2, title: "Uploading diagnosis videos", duration: "3:45", thumbnail: "🎥" },
    { id: 3, title: "Managing service history", duration: "8:10", thumbnail: "📼" }
  ];

  // [NEW DOC LIST]
  const docLibrary = [
    { id: 1, title: "Hydraulic Press Maintenance Guide", type: "PDF", size: "2.4 MB" },
    { id: 2, title: "Industrial Wiring Standards 1990", type: "PDF", size: "8.1 MB" },
    { id: 3, title: "Safety Compliances 2025", type: "DOCX", size: "1.2 MB" }
  ];



  // [NEW] GLOBAL DARK MODE EFFECT
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Force update for input placeholders
    const allInputs = document.querySelectorAll('input, textarea, select');
    allInputs.forEach(el => {
      el.style.color = isDarkMode ? '#f3f4f6' : '';
      el.style.background = isDarkMode ? '#1e293b' : '';
      el.style.borderColor = isDarkMode ? '#334155' : '';
      if (el.placeholder) {
        el.style.setProperty('color', isDarkMode ? '#cbd5e1' : '', 'important');
      }
    });
  }, [isDarkMode]);




  // --- PHOTO & CAMERA LOGIC ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 400, 300);
    setUserPhoto(canvasRef.current.toDataURL('image/png'));
    stopCamera();
  };

  const handleDocVerify = async (e) => {
    if (e.target.files[0]) {
      try {
        await api.patch('/profile/verify');
        alert("Document received. Verifying your industrial identity...");
        // Fast mock for UX
        setTimeout(() => setIsVerified(true), 1500);
      } catch (err) {
        alert("Verification server unavailable. Try again later.");
      }
    }
  };

  // [NEW] VIDEO DIAGNOSIS HANDLERS
  const [activeJobMachine, setActiveJobMachine] = useState(null);
  const [diagnosisDesc, setDiagnosisDesc] = useState('');

  const handleVideoSelect = (e) => {
    if (e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const startDiagnosis = () => {
    if (!videoFile) return alert("Please upload a video first.");
    setDiagnosisStep(2);

    // Simulate AI Analysis
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setDiagnosisStep(3);
        setDiagnosisResults([
          { id: 901, name: "Berlin Industrial Corp", type: "Original Successor", match: 98, avatar: "BI" },
          { id: 902, name: "Hydra-Fix Specialists", type: "Verified 3rd Party", match: 85, avatar: "HF" }
        ]);
      }
    }, 400); // 4 seconds total
  };

  // [NEW] FETCH CHAT LIST (MY JOBS)
  useEffect(() => {
    if (activeTab === 'messages') {
      api.get('/jobs/my')
        .then(res => {
          // Map jobs to chat list format
          const myChats = (Array.isArray(res.data) ? res.data : []).map(job => ({
            id: job.id, // This is the requestId
            name: `${job.machine_name || 'Machine'} (${job.other_party || 'User'})`,
            avatar: (job.other_party || 'US').substring(0, 2).toUpperCase(),
            lastMsg: ((job.issue_description || 'Service request created').substring(0, 30)) + '...', // Ideally get last msg from DB
            time: new Date(job.created_at).toLocaleDateString(),
            unread: 0 // Ideally get unread count
          }));

          if (myChats.length > 0) {
            setChats(myChats);
            // Default to first chat if none selected
            if (!activeChatId) setActiveChatId(myChats[0].id);
          }
        })
        .catch(err => console.error("Failed to load chat list", err));
    }
  }, [activeTab]);

  const handleLegacySearch = async () => {
    if (!legacyQuery) return setLegacyResults([]);
    try {
      const res = await api.get(`/legacy/search?q=${encodeURIComponent(legacyQuery)}`);
      setLegacyResults(res.data);
    } catch (err) {
      console.warn("Legacy search offline, using local cache.");
      const results = legacyDatabase.filter(item =>
        item.name.toLowerCase().includes(legacyQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(legacyQuery.toLowerCase())
      );
      setLegacyResults(results);
    }
  };

  const handleRequestSpecs = (item) => {
    // Add to local notifications for instant feedback
    const newNotif = {
      id: Date.now(),
      type: 'info',
      msg: `Spec-Sheet request logged for ${item.name}. Successor (${item.replacement}) notified.`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setShowNotifDropdown(true); // Show the dropdown to confirm the action
  };

  const handleSubmitSupportTicket = async () => {
    if (!supportTicket.description) {
      setSupportPopupMsg("Please provide details in the description before submitting your ticket.");
      setShowSupportPopup(true);
      return;
    }
    try {
      const res = await api.post('/support/tickets', supportTicket);
      setSupportPopupMsg(res.data.message || "Ticket successfully logged!");
      setShowSupportPopup(true);
      setSupportTicket({ ...supportTicket, description: '' });
      const fetchRes = await api.get('/support/tickets');
      setMyTickets(fetchRes.data);
    } catch (err) {
      setSupportPopupMsg("Failed to sync ticket with industrial server.");
      setShowSupportPopup(true);
    }
  };

  const handleScheduleCall = async () => {
    if (!callRequest.machineId || !callRequest.preferredTime) return alert("Select machine and time.");
    try {
      // We can reuse the schedule endpoint or create a request.
      // For now, let's just log it as a notification for the system/user feedback.
      // In a real app, this would create a 'consultation' record.
      await api.post('/schedule', {
        day_of_week: new Date(callRequest.preferredTime).toLocaleDateString('en-US', { weekday: 'short' }),
        start_time: new Date(callRequest.preferredTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        end_time: '...', // calculate based on duration
        slot_type: 'job',
        title: `Consultation: ${machines.find(m => m.id == callRequest.machineId)?.name || 'Machine'}`,
        description: 'Machine owner requested a technical call.'
      });
      setShowCallModal(false);
      setShowBookExpertModal(true);
    } catch (err) {
      alert("Scheduling system currently maintenance. Please call support.");
    }
  };

  // [NEW] REAL-TIME CHAT HANDLERS

  // [NEW] FALLBACK MOCK DATA




  // ... (handleDeleteMachines, etc remain same)

  // 1. Fetch Chat History when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      // API Call with robust fallback
      api.get(`/chat/${activeChatId}`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const dbMessages = res.data.map(m => ({
              id: m.id,
              chatId: m.request_id,
              sender: m.role === 'consumer' ? 'user' : 'expert',
              text: m.message_text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ...parseMessageBody(m.message_text)
            }));
            setMessages(dbMessages);
          }
          // If empty array or error, we keep the initial MOCK_MESSAGES state
        })
        .catch(err => {
          console.warn("Failed to load chat history (DB Offline?), keeping demo chat.", err);
          // Keep existing state (MOCK_MESSAGES)
        });



      // Join the socket room for this job
      if (socket) {
        socket.emit('join_job', activeChatId);
      }
    }
  }, [activeChatId, socket]);

  // 2. Listen for Incoming Messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Only add if it belongs to current chat
      // [FIX] Use loose equality for potential string/number mismatch
      if (msg.request_id == activeChatId) {
        setMessages(prev => {
          // Avoid duplicates if we already have it
          if (prev.some(p => p.id === msg.id)) return prev;

          const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
          const isMe = currentUser && msg.sender_id === currentUser.id;

          // Determine sender type for UI styling
          // If I am the consumer, 'user' style is ME. 'expert' style is THEM.
          // If I am the producer, 'expert' style is ME. 'user' style is THEM.

          let uiSender;
          if (role === 'consumer') {
            uiSender = isMe ? 'user' : 'expert';
          } else {
            uiSender = isMe ? 'expert' : 'user';
          }

          // [FIX] Parse incoming message for type (invoice/text)
          const parsedContent = parseMessageBody(msg.message_text);


          // [NEW] Check for payment confirmation for Producer
          const messageText = msg?.message_text || '';
          if (role === 'producer' && messageText.includes('processed successfully') && messageText.includes('Payment of')) {
            setShowPaymentReceived(true);
          }

          return [...prev, {
            id: msg.id,
            chatId: msg.request_id,
            sender: uiSender,
            text: msg.message_text,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...parsedContent
          }];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeChatId, role]);




  // 3. Send Message Handler
  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      // Optimistic UI Update (optional, but good for UX)
      /* 
      const tempMsg = {
        id: 'temp-' + Date.now(),
        chatId: activeChatId,
        sender: role === 'consumer' ? 'user' : 'expert',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, tempMsg]);
      */

      // Emit to Server
      socket.emit('send_message', {
        requestId: activeChatId,
        senderId: user.id,
        text: newMessage
      });

      setNewMessage('');
    }
  };

  // [ADDED] Demo Data for Service History -> [MODIFIED] Now State
  const [historyData, setHistoryData] = useState([
    { id: 1, date: 'Jan 12, 2026', machine: 'Hydraulic Press #08', expert: 'Expert #XP-992', action: 'Valve Replacement', cost: '₹45000.00', status: 'verified' },
    { id: 2, date: 'Dec 05, 2025', machine: 'Industrial Loom #22', expert: 'Expert #XP-401', action: 'Legacy Sync Calibration', cost: '₹120000.00', status: 'verified' },
    { id: 3, date: 'Nov 22, 2025', machine: 'Motor Drive #A1', expert: 'In-House', action: 'Routine Lubrication', cost: '₹5000.00', status: 'pending' },
    { id: 4, date: 'Oct 15, 2025', machine: 'Hydraulic Press #08', expert: 'Expert #XP-992', action: 'Pressure Sensor Check', cost: '₹12000.00', status: 'verified' }
  ]);

  // [MODIFIED] Helper to get filtered history
  const filteredHistory = [
    ...(Array.isArray(transactionHistory) ? transactionHistory.map(th => ({
      id: th.id,
      date: new Date(th.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      machine: th.machine_name || 'Industrial System',
      expert: th.other_party || 'Verified Expert',
      action: 'Service Transaction',
      cost: `₹${th.amount}`,
      status: th.status === 'paid' ? 'verified' : 'pending'
    })) : []),
    ...historyData
  ].filter(item =>
    item.machine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // [NEW] PAYMENT LOGIC
  const handlePayment = (amountStr, desc) => {
    setPaymentConfig({ amountStr, desc });
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!paymentConfig) return;
    const { amountStr, desc, requestId } = paymentConfig;

    setIsPaymentProcessing(true);

    try {
      // 1. Create Order on Backend
      const amountFinal = parseInt(String(amountStr).replace(/[^0-9]/g, '')) || 5000;
      const orderRes = await api.post('/finance/pay-order', {
        requestId: requestId || activeChatId,
        amount: amountFinal
      });

      const orderData = orderRes.data;

      // [INTEGRATION] We would normally call Razorpay here.
      // For this implementation, we simulate the success response.
      setTimeout(async () => {
        try {
          // 2. Verify Payment on Backend (Using Mock Signatures for Demo)
          await api.post('/finance/verify', {
            razorpay_order_id: orderData.id,
            razorpay_payment_id: 'pay_mock_' + Date.now().toString().slice(-6),
            razorpay_signature: 'mock_signature' // Backend needs to handle mock sigs if in demo mode
          });

          // 3. Update local history and UI
          const successText = `✓ Payment of ${amountStr} processed successfully. Ref: PAY-${Date.now().toString().slice(-6)}`;

          setMessages(prev => [...prev, {
            id: Date.now(),
            chatId: activeChatId,
            sender: 'system',
            text: successText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);

          if (socket) {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : { id: 'unknown' };
            socket.emit('send_message', {
              requestId: activeChatId,
              senderId: user.id || user.user_id,
              text: successText
            });
          }

          setIsPaymentProcessing(false);
          setShowPaymentModal(false);
          setPaymentConfig(null);
          setShowPaymentSuccess(true);
          setCompletedJobId(activeChatId);

        } catch (innerErr) {
          console.error("Verification failed", innerErr);
          alert("Payment verification failed. Please contact support.");
          setIsPaymentProcessing(false);
        }
      }, 2000);

    } catch (err) {
      console.error("Order creation failed", err);
      alert("Failed to initiate secure portal. Check connection.");
      setIsPaymentProcessing(false);
    }
  };

  // [NEW] SUBMIT REVIEW HANDLER
  const handleSubmitReview = async () => {
    if (!completedJobId) return;

    // Optimistic UI Update
    setShowReviewModal(false);
    alert("Review Submitted! Thank you for your feedback.");

    try {
      await api.post('/reviews', {
        requestId: completedJobId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      // Reset State
      setReviewData({ rating: 5, comment: '' });
      setCompletedJobId(null);
    } catch (err) {
      console.error("Failed to submit review", err);
      // Optional: Handle error silently or notify user
    }
  };

  // Validation Logic based on your requirements
  const validate = () => {
    let tempErrors = {};
    if (!email.includes('@')) {
      tempErrors.email = "Invalid email format (missing @).";
    }

    if (view !== 'forgot') {
      if (!isLogin) {
        // Strict validation only for Sign Up
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          tempErrors.password = "Must be 8+ chars with Upper, Lower, Number, and Special Char.";
        }
        if (password !== confirmPassword) {
          tempErrors.confirmPassword = "Passwords do not match.";
        }
      } else {
        // Simple validation for Login
        if (!password) {
          tempErrors.password = "Password is required.";
        }
      }
    }

    if (!isLogin && signupStep === 1) {
      if (!firstName) tempErrors.firstName = "First name required.";
      if (!lastName) tempErrors.lastName = "Last name required.";
      if (!phone || phone.length < 10) tempErrors.phone = "Valid 10-digit phone number required.";
      if (!dob) tempErrors.dob = "Date of birth required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // [NEW] REPORT DOWNLOAD LOGIC
  const handleDownloadReport = () => {
    if (!selectedReport) return;

    const reportContent = `
ORIGINODE SERVICE REPORT
========================
INVOICE ID: INV-${2020 + selectedReport.id}
DATE: ${selectedReport.date}
STATUS: ${selectedReport.status.toUpperCase()}

CLIENT DETAILS
--------------
Authorized By: ${firstName} ${lastName}
Company: ${extraInfo}
Email: ${email}
Phone: ${phone}

MACHINE DETAILS
---------------
Machine ID: ${selectedReport.machine}
Model: Industrial Series-X
Location: Sector 7G

SERVICE RECORD
--------------
Provider: ${selectedReport.expert}
Action: ${selectedReport.action}
Total Cost: ${selectedReport.cost}

DIAGNOSTIC NOTES
----------------
System checks completed successfully.
Pressure levels stable.
Next maintenance due in 90 days.

Generated by OrigiNode Platform
www.originode.com
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OrigiNode_Report_INV-${2020 + selectedReport.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = async () => {
    setErrors({});

    if (view === 'forgot') {
      if (!email) {
        setErrors({ server: "Email is required." });
        return;
      }
      try {
        await api.post('/auth/forgot-password', { email });
      } catch (err) {
        console.warn(err);
      }
      setShowForgotModal(true);
      return;
    }

    // Basic validation
    if (!email || !password) {
      setErrors({ server: "Email and password are required." });
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        setView('dashboard');
      } else {
        setErrors({ server: "Invalid login response." });
      }
    } catch (err) {
      setErrors({
        server:
          err.response?.data?.message ||
          "Invalid email or password."
      });
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await api.get('/machines');
      if (Array.isArray(response.data)) {
        setMachines(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.warn('[Fleet] Offline mode active (DB disconnected). Using local backup.');
      setMachines(MOCK_MACHINES);
    }
  };

  const handleAddMachine = async () => {
    if (!newMachineData.name || !newMachineData.machine_type) return alert("Name and Type are required");

    // [DEMO MODE BYPASS]
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user && user.id === 'demo-123') {
      // Optimistically add to UI for instant feedback
      const mockMachine = {
        id: 'demo-new-' + Date.now(),
        name: newMachineData.name,
        machine_type: newMachineData.machine_type,
        oem: newMachineData.oem || 'Generic OEM',
        model_year: newMachineData.model_year || '2024',
        condition_score: 100
      };
      setMachines(prev => [mockMachine, ...prev]);
      setShowAddMachineModal(false);
      setNewMachineData({ name: '', oem: '', model_year: '', machine_type: '' });
      return;
    }

    try {
      await api.post('/machines', newMachineData);
      setShowAddMachineModal(false);
      setNewMachineData({ name: '', oem: '', model_year: '', machine_type: '' });
      fetchMachines(); // Refresh the fleet
    } catch (err) {
      console.error(err);
      alert("Failed to register node. Ensure server is running.");
    }
  };

  const handleDeleteMachine = (id, e) => {
    // Prevent event bubbling if triggered from a deeper element (like a menu)
    if (e) e.stopPropagation();
    const machine = machines.find(m => m.id === id);
    if (machine) {
      setNodeToDelete(machine);
    }
  };

  const confirmNodeDeletion = async () => {
    if (!nodeToDelete) return;
    const id = nodeToDelete.id;

    try {
      // [DEMO CHECK]
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (user && user.id === 'demo-123') {
        setMachines(prev => prev.filter(m => m.id !== id));
        setNodeToDelete(null);
        return;
      }

      await api.delete(`/machines/${id}`);
      // Optimistic update
      setMachines(prev => prev.filter(m => m.id !== id));
      setNodeToDelete(null);
    } catch (err) {
      alert("Failed to delete node: " + (err.response?.data?.message || err.message));
    }
  };

  // [NEW] SERVICE REQUEST BROADCAST HANDLER
  const handleBroadcastJob = async () => {
    if (!activeJobMachine) return alert("No machine selected");

    // 1. Simulate Analysis/Broadcasting UI
    setDiagnosisStep(2);

    try {
      // [DEMO MODE BYPASS]
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user && (user.id === 'demo-123' || String(activeJobMachine.id).startsWith('local'))) {
        setAnalysisProgress(0);
        let prog = 0;
        const interval = setInterval(() => {
          prog += 20;
          setAnalysisProgress(prog);
          if (prog >= 100) {
            clearInterval(interval);
            setDiagnosisStep(3);
          }
        }, 300);
        return;
      }

      // 2. Post to Backend
      const payload = {
        machineId: activeJobMachine.id,
        issueDescription: diagnosisDesc || "Routine maintenance check",
        priority: 'high',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Mock video for now
      };

      await api.post('/jobs/broadcast', payload);

      // 3. Show Success UI
      setAnalysisProgress(0);
      let p = 0;
      const inter = setInterval(() => {
        p += 25;
        setAnalysisProgress(p);
        if (p >= 100) {
          clearInterval(inter);
          setDiagnosisStep(3);
        }
      }, 400);

    } catch (err) {
      console.error(err);
      alert("Failed to broadcast request. Check connection.");
      setDiagnosisStep(1);
    }
  };

  // [NEW] LISTEN FOR JOB UPDATES (INVOICES)
  useEffect(() => {
    if (socket && view === 'dashboard') {
      const handleStatusUpdate = (data) => {
        console.log("Job Status Update Received:", data);
        if (data.status === 'payment_pending' && role === 'consumer') {
          // Show payment modal for consumer
          setPaymentConfig({
            requestId: activeChatId,
            amountStr: `₹${data.amount}`,
            desc: data.message
          });
          setShowPaymentModal(true);
        }

        if (data.status === 'completed' && role === 'producer') {
          setShowPaymentReceived(true);
        }
      };

      // Since the event name is dynamic status_update_${jobId}, 
      // but we might not know the jobId immediately, 
      // the backend should ideally emit a general 'job_update' or we subscribe to rooms.
      // For now, let's use the dynamic one if we have an active chat.
      if (activeChatId) {
        socket.on(`status_update_${activeChatId}`, handleStatusUpdate);
        return () => socket.off(`status_update_${activeChatId}`, handleStatusUpdate);
      }
    }
  }, [socket, view, activeChatId, role]);

  const fetchRadarJobs = async () => {
    try {
      const res = await api.get('/jobs/radar');
      setRadarJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Radar offline:", err);
      setRadarJobs([]);
    }
  };

  // Stable deterministic value based on job ID chars (no random on re-render)
  const getJobEstValue = (id) => {
    if (!id) return '₹5,000';
    const hash = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const val = 5000 + (hash % 20) * 1000;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const fetchProducerChats = async () => {
    try {
      const res = await api.get('/jobs/my');
      const myJobs = Array.isArray(res.data) ? res.data : [];
      if (myJobs.length > 0) {
        const chatList = myJobs.map(job => ({
          id: job.id,
          name: `${job.other_party || 'Client'} — ${job.machine_name || 'Machine'}`,
          avatar: (job.other_party || 'CL').substring(0, 2).toUpperCase(),
          lastMsg: (job.issue_description || 'Service request').substring(0, 35) + '...',
          time: new Date(job.created_at).toLocaleDateString(),
          unread: 0,
          status: job.status
        }));
        setProducerChats(chatList);
      }
    } catch (err) {
      console.error("Failed to load producer chat list:", err);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      const res = await api.patch(`/jobs/${jobId}/accept`);
      const acceptedJob = res.data;

      // Remove the accepted job from the radar board locally
      setRadarJobs(prev => prev.filter(j => j.id !== jobId));

      // Refresh the producer chat list to include the newly accepted job
      await fetchProducerChats();

      // Pre-select the accepted job chat and switch to messages tab
      setActiveChatId(jobId);
      setActiveTab('pro-messages');

    } catch (err) {
      alert("Failed to accept job: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeclineJob = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/decline`);
      // Remove from local radar — other producers can still see it
      setRadarJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      // Even if API fails (e.g., demo mode), remove locally for good UX
      setRadarJobs(prev => prev.filter(j => j.id !== jobId));
      console.warn("Decline API call failed (offline?)", err);
    }
  };

  useEffect(() => {
    if (view === 'dashboard' && role === 'consumer' && activeTab === 'fleet') {
      fetchMachines();
    }
  }, [view, role, activeTab]);

  useEffect(() => {
    if (view === 'dashboard' && role === 'producer') {
      const fetchStats = async () => {
        try {
          const res = await api.get('/jobs/producer-stats');
          setProducerDashStats(res.data);
        } catch (err) {
          console.error("Failed to load dashboard stats", err);
        }
      };

      fetchRadarJobs();
      fetchProducerChats();
      fetchStats();
      const interval = setInterval(() => {
        fetchRadarJobs();
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [view, role]);

  // When producer switches to messages tab, refresh their chat list
  useEffect(() => {
    if (activeTab === 'pro-messages' && role === 'producer') {
      fetchProducerChats();
    }
  }, [activeTab]);

  // [NEW] FETCH FINANCIAL STATS
  useEffect(() => {
    if (activeTab === 'earnings' || activeTab === 'history') {
      const fetchFinanceData = async () => {
        try {
          const statsRes = await api.get('/finance/stats');
          setEarningsStats(statsRes.data);

          const historyRes = await api.get('/finance/history');
          setTransactionHistory(historyRes.data);
        } catch (err) {
          console.error("Failed to load financial data", err);
        }
      };

      fetchFinanceData();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('landing');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setActiveTab('fleet');
  };

  // [NEW] Robust Google OAuth Implementation
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      setErrors({});

      const res = await api.post('/auth/google', {
        id_token: credential,
      }, { withCredentials: true });

      if (res.data && res.data.status === 'USER_NOT_FOUND') {
        if (isLogin) {
          setIsLogin(false);
          setSignupStep(1);
          setEmail(res.data.email || '');
          setFirstName(res.data.given_name || '');
          setLastName(res.data.family_name || '');
          setPhone('');
          setErrors({ server: 'No industrial account found for this Google identity. Please complete signup.' });
        } else {
          setEmail(res.data.email || '');
          setFirstName(res.data.given_name || '');
          setLastName(res.data.family_name || '');
          setErrors({});
        }
        return;
      }

      const { user } = res.data;
      if (user) {
        if (socket) socket.emit('identify', user.id || user.user_id);
        setView('dashboard');
        setActiveTab(user.role === 'consumer' ? 'fleet' : 'requests');
        fetchNotifications();
        return;
      }

      setErrors({ server: 'Authentication failed. Please try traditional credentials.' });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.status === 'USER_NOT_FOUND') {
        if (isLogin) {
          setIsLogin(false);
          setSignupStep(1);
          setEmail(err.response.data.email || '');
          setFirstName(err.response.data.given_name || '');
          setLastName(err.response.data.family_name || '');
          setErrors({ server: 'No account found. Complete your identity profile below.' });
        } else {
          setEmail(err.response.data.email || '');
          setFirstName(err.response.data.given_name || '');
          setLastName(err.response.data.family_name || '');
          setErrors({});
        }
        return;
      }
      setErrors({ server: 'Google authentication encountered a network error.' });
    }
  };

  const handleGoogleError = () => {
    setErrors({ server: 'Google login was cancelled or failed.' });
  };

  // Legacy social modal toggle (for Apple or others if needed)
  const handleSocialLogin = (provider) => {
    setSocialProvider(provider);
    setShowSocialModal(true);
  };

  // [NEW] Social Account Selector Modal Component
  const SocialLoginModal = () => (
    <div className="modal-overlay social-auth-overlay">
      <div className="social-selector-card animate-social-slide-up">
        <div className="social-modal-header">
          <div className="social-logo-wrap">
            {socialProvider === 'Google' ? (
              <svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>
            )}
          </div>
          <h3>Choose an industrial identity</h3>
          <p>to continue to <strong>origiNode</strong></p>
        </div>

        <div className="account-list">
          {simulatedAccounts.map((acc, idx) => (
            <div key={idx} className="account-item" onClick={() => finalizeSocialLogin(acc)}>
              <img src={acc.avatar} alt={acc.name} className="acc-avatar" />
              <div className="acc-info">
                <span className="acc-name">{acc.name}</span>
                <span className="acc-email">{acc.email}</span>
              </div>
            </div>
          ))}
          <div className="account-item use-another">
            <div className="add-icon">+</div>
            <span>Use another account</span>
          </div>
        </div>

        <div className="social-modal-footer">
          <p>By continuing, Google/Apple will share your name, email address, and profile picture with origiNode.</p>
          <button className="btn-cancel-social" onClick={() => setShowSocialModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const isFormValid = view === 'forgot'
    ? email.includes('@')
    : (email.includes('@') && password.length >= 8);

  // VIEW 1: ANIMATED SPLASH SCREEN
  if (view === 'landing') {
    return (
      <div className="app">
        <header className="app-header">
          <div className="branding-section">
            <h1 className="app-name">origiNode</h1>
            <p className="tagline">tracing the source to keep your business moving</p>
          </div>

          <div className="auth-portal">
            <div className="auth-card">
              <h2>Machine Owner</h2>
              <p>Find original owners or expert repair services.</p>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={() => { setView('auth'); setRole('consumer'); setIsLogin(true); setSignupStep(1); }}>
                  Consumer Login
                </button>
                <button className="btn btn-outline" onClick={() => { setView('auth'); setRole('consumer'); setIsLogin(false); setSignupStep(1); }}>
                  Create Account
                </button>
              </div>
            </div>

            <div className="auth-card">
              <h2>Repair Expert</h2>
              <p>Connect with industries and provide repair support.</p>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={() => { setView('auth'); setRole('producer'); setIsLogin(true); setSignupStep(1); }}>
                  Producer Login
                </button>
                <button className="btn btn-outline" onClick={() => { setView('auth'); setRole('producer'); setIsLogin(false); setSignupStep(1); }}>
                  Join as Expert
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  // --- SHARED UI COMPONENTS (MODALS) ---
  const sharedModals = (
    <>
      {showAddMachineModal && (
        <div className="modal-overlay">
          <div className="diagnosis-modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header-v2">
              <h3>Register Industrial Node</h3>
              <button className="btn-icon-label" onClick={() => setShowAddMachineModal(false)}>Close</button>
            </div>
            <div className="modal-body-v2">
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="machine_name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Machine Name / ID</label>
                <input id="machine_name" type="text" className="std-input" name="machine_name" placeholder="e.g. Hydraulic Press #99"
                  value={newMachineData.name}
                  onChange={(e) => setNewMachineData({ ...newMachineData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px' }} />
              </div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="machine_type" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Machine Type</label>
                <select id="machine_type" className="std-input" name="machine_type"
                  value={newMachineData.machine_type}
                  onChange={(e) => setNewMachineData({ ...newMachineData, machine_type: e.target.value })}
                  style={{ width: '100%', padding: '10px' }}>
                  <option value="">Select Type</option>
                  <option value="Hydraulic Press">Hydraulic Press</option>
                  <option value="CNC Concentric">CNC Concentric</option>
                  <option value="Industrial Loom">Industrial Loom</option>
                  <option value="Generator">Generator</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="oem" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Original Maker (OEM)</label>
                <input id="oem" type="text" className="std-input" name="oem" placeholder="e.g. Hydra-Tech Germany"
                  value={newMachineData.oem}
                  onChange={(e) => setNewMachineData({ ...newMachineData, oem: e.target.value })}
                  style={{ width: '100%', padding: '10px' }} />
              </div>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="model_year" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Model Year</label>
                <input id="model_year" type="number" className="std-input" name="model_year" placeholder="e.g. 1985"
                  value={newMachineData.model_year}
                  onChange={(e) => setNewMachineData({ ...newMachineData, model_year: e.target.value })}
                  style={{ width: '100%', padding: '10px' }} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddMachine}>Register Node</button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="modal-overlay">
          <div className="camera-modal">
            <h3>Capture Selfie</h3>
            <video ref={videoRef} autoPlay playsInline className="camera-stream"></video>
            <canvas ref={canvasRef} width="400" height="300" style={{ display: 'none' }}></canvas>
            <div className="modal-actions">
              <button className="btn btn-outline-dark" onClick={stopCamera}>Cancel</button>
              <button className="btn btn-primary" onClick={capturePhoto}>Capture Frame</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <div className="warning-icon">!</div>
              <h3>Permanent Identity Deletion</h3>
            </div>
            <p>Are you certain? This will wipe all machine nodes and historical records associated with <strong>{email || 'admin@originode.com'}</strong>.</p>
            <div className="modal-actions">
              <button className="btn btn-outline-dark" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { setView('landing'); setShowDeleteModal(false); }}>Yes, Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {nodeToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <div className="warning-icon">!</div>
              <h3>Decommission Node?</h3>
            </div>
            <p>Are you sure you want to remove <strong>{nodeToDelete.name}</strong> from your industrial fleet? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline-dark" onClick={() => setNodeToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmNodeDeletion}>Yes, Decommission</button>
            </div>
          </div>
        </div>
      )}

      {showDiagnosisModal && (
        <div className="modal-overlay">
          <div className="diagnosis-modal">
            <div className="modal-header-v2">
              <h3>Smart Diagnosis Support</h3>
              <button className="btn-icon-label" onClick={() => { setShowDiagnosisModal(false); setDiagnosisStep(1); setVideoFile(null); }}>Close</button>
            </div>
            <div className="modal-body-v2">
              {diagnosisStep === 1 && (
                <div className="upload-step animate-fade">
                  <p><strong>Step 1:</strong> Upload a video of the machine fault. clearly showing the sound or visual issue.</p>
                  <div className="upload-zone" onClick={() => document.getElementById('video-input').click()}>
                    <div className="upload-icon">📹</div>
                    {videoFile ? <div className="upload-text" style={{ color: 'var(--sage-green)' }}>{videoFile.name} Selected</div> : <div className="upload-text">Click to Upload Video</div>}
                    <p className="upload-hint">MP4, MOV supported (Max 50MB)</p>
                    <input type="file" id="video-input" hidden accept="video/*" onChange={handleVideoSelect} />
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--navy-dark)' }}>Describe the Issue</label>
                    <textarea className="table-search" rows="3"
                      placeholder={`Describe the issue with ${activeJobMachine?.name}...`}
                      value={diagnosisDesc}
                      onChange={(e) => setDiagnosisDesc(e.target.value)}
                      style={{ width: '100%', resize: 'none' }}></textarea>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleBroadcastJob}>Broadcast to Network</button>
                </div>
              )}
              {diagnosisStep === 2 && (
                <div className="scanning-container animate-fade">
                  <div className="scanner-ring"></div>
                  <h3 style={{ color: 'var(--navy-dark)' }}>Broadcasting Signal...</h3>
                  <p style={{ color: '#64748b' }}>Notifying verified experts in your vicinity.</p>
                  <div className="progress-bar-bg" style={{ background: '#e2e8f0', height: '6px', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ width: `${analysisProgress}%`, background: 'var(--navy-primary)', height: '100%', transition: '0.4s' }}></div>
                  </div>
                </div>
              )}
              {diagnosisStep === 3 && (
                <div className="results-step animate-fade">
                  <h3 style={{ marginBottom: '15px', color: 'var(--navy-dark)' }}>Signal Broadcasted!</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Your request for <strong>{activeJobMachine?.name}</strong> is now live on the industrial radar. Experts will review and bid shortly.</p>

                  <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>📡</span>
                    <h4 style={{ color: '#166534', margin: '10px 0' }}>Live on Radar</h4>
                    <button className="btn btn-primary" onClick={() => setShowDiagnosisModal(false)}>Return to Dashboard</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div className="modal-overlay">
          <div className="diagnosis-modal" style={{ width: '600px' }}>
            <div className="modal-header-v2">
              <h3>Service Report Details</h3>
              <button className="btn-icon-label" onClick={() => setShowReportModal(false)}>Close</button>
            </div>
            <div className="modal-body-v2">
              <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
                <h2 style={{ margin: 0, color: 'var(--navy-dark)' }}>INV-{2020 + selectedReport.id}</h2>
                <span className={`status-badge-pill ${selectedReport.status}`} style={{ display: 'inline-block', marginTop: '10px' }}>{selectedReport.status.toUpperCase()}</span>
              </div>
              <div className="report-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>SERVICE DATE</label><strong style={{ color: 'var(--navy-dark)' }}>{selectedReport.date}</strong></div>
                <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>MACHINE ID</label><strong style={{ color: 'var(--navy-dark)' }}>{selectedReport.machine}</strong></div>
                <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>SERVICE PROVIDER</label><strong style={{ color: 'var(--navy-dark)' }}>{selectedReport.expert}</strong></div>
                <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>TOTAL COST</label><strong style={{ color: 'var(--navy-dark)', fontSize: '1.2rem' }}>{selectedReport.cost}</strong></div>
              </div>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>SERVICE ACTION PERFORMED</label>
                <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>{selectedReport.action}. System diagnostics were run post-service to ensure compliance with operational safety standards.</p>
              </div>
              <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline-dark" style={{ flex: 1 }} onClick={handleDownloadReport}>Download Report</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert("Report emailed to " + email)}>Email Report</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="modal-overlay">
          <div className="diagnosis-modal" style={{ width: '800px', background: 'black' }}>
            <div className="modal-header-v2" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
              <h3 style={{ color: 'white' }}>Video Tutorials</h3>
              <button className="btn-icon-label" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} onClick={() => setShowVideoModal(false)}>Close</button>
            </div>
            <div className="modal-body-v2" style={{ padding: 0 }}>
              <div style={{ height: '400px', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column' }}>
                {activeVideo ? (
                  <>
                    <div style={{ fontSize: '4rem', color: 'var(--sage-green)' }}>▶</div>
                    <h2 style={{ marginTop: '20px' }}>{activeVideo.title}</h2>
                    <p style={{ color: '#94a3b8' }}>Now Playing • {activeVideo.duration}</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '4rem', opacity: 0.5 }}>▶</div>
                    <p style={{ marginTop: '20px' }}>Select a tutorial to play</p>
                  </>
                )}
              </div>
              <div style={{ padding: '20px', background: '#0f172a' }}>
                {tutorialVideos.map(vid => (
                  <div key={vid.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'white', padding: '10px', borderBottom: '1px solid #334155', cursor: 'pointer', background: activeVideo?.id === vid.id ? '#1e293b' : 'transparent' }} onClick={() => setActiveVideo(vid)}>
                    <span style={{ fontSize: '1.5rem' }}>{vid.thumbnail}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: activeVideo?.id === vid.id ? 'var(--sage-green)' : 'white' }}>{vid.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{vid.duration}</span>
                    </div>
                    {activeVideo?.id === vid.id ? <span style={{ color: 'var(--sage-green)', fontWeight: 'bold' }}>Playing</span> : <button className="btn-small" style={{ width: 'auto', borderColor: 'white', color: 'white' }}>Play</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCallModal && (
        <div className="modal-overlay">
          <div className="diagnosis-modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header-v2">
              <h3>Schedule Expert Call</h3>
              <button className="btn-icon-label" onClick={() => setShowCallModal(false)}>Close</button>
            </div>
            <div className="modal-body-v2">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}><div style={{ fontSize: '3rem' }}>📞</div><p style={{ color: '#64748b', marginTop: '10px' }}>Direct line to a verified industrial specialist.</p></div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Select Machine</label>
                <select className="std-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                  value={callRequest.machineId}
                  onChange={(e) => setCallRequest({ ...callRequest, machineId: e.target.value })}
                >
                  <option value="">Choose a Node...</option>
                  {(machines || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Preferred Time</label>
                <input type="datetime-local" className="std-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                  value={callRequest.preferredTime}
                  onChange={(e) => setCallRequest({ ...callRequest, preferredTime: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleScheduleCall}>Schedule Now</button>
            </div>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="modal-overlay">
          <div className="diagnosis-modal" style={{ width: '650px' }}>
            <div className="modal-header-v2">
              <h3>Technical Resource Library</h3>
              <button className="btn-icon-label" onClick={() => setShowDocModal(false)}>Close</button>
            </div>
            <div className="modal-body-v2" style={{ padding: 0 }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}><input type="text" className="table-search" placeholder="Search manuals, schematics, safety docs..." style={{ width: '100%' }} /></div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                {docLibrary.map(doc => (
                  <div key={doc.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', marginBottom: '10px', background: 'white' }}>
                    <span style={{ fontSize: '2rem' }}>{doc.type === 'PDF' ? '📕' : '📘'}</span>
                    <div style={{ flex: 1 }}><h4 style={{ margin: 0, color: 'var(--navy-dark)' }}>{doc.title}</h4><small style={{ color: '#64748b' }}>{doc.type} • {doc.size}</small></div>
                    <button className="btn-small-text" style={{ color: 'var(--navy-primary)', fontWeight: 'bold' }} onClick={() => alert(`Downloading ${doc.title}...`)}>Download</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );


  // [NEW] VIEW 3: CONSUMER DASHBOARD
  if (view === 'dashboard' && role === 'consumer') {
    return (
      <div className="dashboard-wrapper consumer-theme">
        <aside className="side-nav">

          <div className="profile-sidebar-summary" onClick={() => setActiveTab('profile')}>
            {userPhoto ? <img src={userPhoto} className="nav-avatar-img" alt="User" /> : <div className="nav-avatar-circle">{firstInitial}{lastInitial}</div>}
            <div className="nav-user-details">
              <span className="nav-name">{firstName} {lastName} {isVerified && "✓"}</span>
              <span className="nav-email-small">{email || 'admin@originode.com'}</span>
            </div>
          </div>

          <nav className="nav-links">
            <div className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>Fleet</div>
            <div className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>Messages {chats.some(c => c.unread > 0) && <span className="nav-badge" style={{ background: 'var(--error-red)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>1</span>}</div>
            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Service History</div>
            <div className={`nav-item ${activeTab === 'legacy' ? 'active' : ''}`} onClick={() => setActiveTab('legacy')}>Legacy Search</div>
            <div className="nav-divider"></div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</div>
            <div className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>Help & Support</div>
            <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</div>
            <div className="nav-item logout-btn-item" onClick={handleLogout}>Logout</div>
          </nav>
        </aside>


        <main className="dashboard-content">
          <header className="dashboard-top-bar">
            <div className="breadcrumb-info">origiNode / {activeTab.toUpperCase()}</div>
            <div className="top-bar-actions" ref={notifRef}>
              {/* NOTIFICATION BELL WITH DROPDOWN TRIGGER */}
              <div className="notif-bell-container" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                <span className="bell-icon">🔔</span>
                {notifications.some(n => !n.read) && <span className="notif-ping"></span>}
              </div>

              {/* [NEW] NOTIFICATION DROPDOWN MENU */}
              {showNotifDropdown && (
                <div className="notif-dropdown animate-fade">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <button className="btn-small-text" onClick={handleClearNotifs}>Clear History</button>
                  </div>
                  <div className="dropdown-body">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`notif-drop-item ${!n.read ? 'unread' : ''}`}>
                        <div className={`notif-indicator ${n.type}`}></div>
                        <div className="notif-drop-content">
                          <p>{n.msg}</p>
                          <span>{n.time}</span>
                        </div>
                      </div>
                    )) : <div className="empty-notif" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No new alerts</div>}
                  </div>
                </div>
              )}
            </div>
          </header>

          {activeTab === 'fleet' ? (


            <React.Fragment>
              <header className="content-header">
                <div>
                  <h2>Industrial Fleet Overview</h2>
                  <p style={{ color: '#64748b', margin: 0 }}>Monitor real-time status and health of your machinery.</p>
                </div>
                <div className="header-actions">
                  <div className="continuity-badge">
                    <span className="pulse-dot"></span>
                    <span>System Continuity: <strong>{avgContinuity}%</strong></span>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowAddMachineModal(true)}>+ Add Machine Node</button>
                </div>
              </header>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-bg info">
                    <span className="icon">🏭</span>
                  </div>
                  <div className="stat-info">
                    <h4>Active Nodes</h4>
                    <p className="stat-value">{activeNodesCount}</p>
                    <span className="stat-trend positive">↑ Connected</span>
                  </div>
                </div>
                <div className="stat-card critical">
                  <div className="stat-icon-bg alert">
                    <span className="icon">⚠️</span>
                  </div>
                  <div className="stat-info">
                    <h4>Critical Issues</h4>
                    <p className="stat-value">{criticalIssuesCount}</p>
                    <span className="stat-trend negative">Attention Required</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-bg success">
                    <span className="icon">💰</span>
                  </div>
                  <div className="stat-info">
                    <h4>Total Investment</h4>
                    <p className="stat-value">₹{Number(earningsStats.totalSpent || 0).toLocaleString()}</p>
                    <span className="stat-trend neutral">Managed via Escrow</span>
                  </div>
                </div>
              </div>

              {/* [NEW] FLEET SPENDING TREND */}
              <div className="glass-panel spending-trend-container" style={{ margin: '20px 0', padding: '20px', background: 'white' }}>
                <h4 className="section-title" style={{ marginBottom: '15px', color: 'var(--navy-dark)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Maintenance Spending Trend</h4>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `₹${v}`} width={60} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#fff', color: '#0f172a' }}
                        formatter={(value) => [`₹${value}`, 'Spent']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} fillOpacity={0.25} fill="#16A34A" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <section className="node-gallery">
                <div className="section-header" style={{ alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <h3>My Machines</h3>
                    <div style={{ marginTop: '10px', position: 'relative', maxWidth: '300px' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search fleet..."
                        className="table-search"
                        style={{ width: '100%', paddingLeft: '32px' }}
                        value={fleetSearch}
                        onChange={(e) => setFleetSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="filter-tabs">
                    <span className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</span>
                    <span className={`filter-tab ${activeFilter === 'Operational' ? 'active' : ''}`} onClick={() => setActiveFilter('Operational')}>Operational</span>
                    <span className={`filter-tab ${activeFilter === 'Maintenance' ? 'active' : ''}`} onClick={() => setActiveFilter('Maintenance')}>Maintenance</span>
                  </div>
                </div>

                <div className="node-grid">
                  {filteredMachines.length > 0 ? filteredMachines.map(machine => (
                    <div key={machine.id} className="node-card">
                      <div className="node-image-placeholder active">
                        <span className="node-emoji">⚙️</span>
                        <div className={`status-overlay ${machine.condition_score > 50 ? 'operational' : 'maintenance'}`}>
                          {machine.condition_score > 50 ? 'Online' : 'Maintenance'}
                        </div>
                      </div>
                      <div className="node-content">
                        <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0 }}>{machine.name}</h4>
                          <button
                            className="btn-icon-label"
                            onClick={(e) => { e.stopPropagation(); handleDeleteMachine(machine.id); }}
                            style={{
                              color: '#ef4444',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '1.2rem',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px'
                            }}
                            title="Decommission Node"
                            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            🗑️
                          </button>
                        </div>
                        <p className="node-model">{machine.machine_type} • {machine.oem || 'Unknown OEM'}</p>
                        <div className="node-metrics">
                          <div className="metric">
                            <span className="label">Year</span>
                            <span className="value">{machine.model_year}</span>
                          </div>
                          <div className="metric">
                            <span className="label">Condition</span>
                            <span className="value">{machine.condition_score}%</span>
                          </div>
                        </div>
                        {/* [NEW] DYNAMIC HEALTH BAR */}
                        <div className="health-bar-container" style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px' }}>
                          <div className="health-bar-fill" style={{
                            width: `${machine.condition_score}%`,
                            height: '100%',
                            background: machine.condition_score > 70 ? 'var(--sage-green)' : (machine.condition_score > 30 ? '#f59e0b' : '#ef4444'),
                            borderRadius: '2px',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}></div>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                          <button className="btn-small btn-alert" style={{ width: '100%' }}
                            onClick={() => { setActiveJobMachine(machine); setDiagnosisStep(1); setShowDiagnosisModal(true); }}>
                            Request Service
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state-machine" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏭</div>
                      <h3>No Machines Registered</h3>
                      <p>Add your first industrial node to begin monitoring.</p>
                    </div>
                  )}
                </div>
              </section>
            </React.Fragment>

          ) : activeTab === 'messages' ? (
            <div className="messages-view animate-fade">
              <aside className="messages-sidebar">
                <div className="chat-search-bar">
                  <input type="text" className="table-search" placeholder="Search chats..." style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                </div>
                <div className="chat-list">
                  {chats.map(chat => (
                    <div key={chat.id} className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`} onClick={() => setActiveChatId(chat.id)}>
                      <div className="chat-avatar">{chat.avatar}</div>
                      <div className="chat-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 className="chat-name">{chat.name}</h4>
                          <span className="chat-time">{chat.time}</span>
                        </div>
                        <p className="chat-preview" style={chat.unread ? { fontWeight: '700', color: 'var(--navy-dark)' } : {}}>{chat.lastMsg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <main className="chat-window">
                <header className="chat-header">
                  <div className="chat-partner-info">
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-dark)' }}>{chats.find(c => c.id == activeChatId)?.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--sage-green)', fontWeight: '600' }}>● Online</span>
                  </div>
                  <button className="btn-icon-label" style={{ fontSize: '0.8rem' }} onClick={() => {
                    const chat = chats.find(c => c.id == activeChatId);
                    if (chat) {
                      console.log('Opening profile for:', chat);
                      setSelectedExpert({ name: chat.name, avatar: chat.avatar });
                      setShowExpertProfileModal(true);
                    } else {
                      console.error('Chat not found for ID:', activeChatId);
                    }
                  }}>View Profile</button>
                </header>

                <div className="chat-body">
                  {messages.filter(m => m.chatId === activeChatId).map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender === 'user' ? 'sent' : 'received'}`}>
                      {msg.type === 'invoice' ? (
                        <div className="invoice-message-card">
                          <div className="invoice-header">INVOICE REQUEST</div>
                          <div className="invoice-body">
                            <div className="invoice-row"><span>Service:</span> <strong>{msg.desc}</strong></div>
                            <div className="invoice-total"><span>Total:</span> <span>{msg.amount}</span></div>
                            {role === 'consumer' && (
                              <button type="button" className="btn-pay-now" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePayment(msg.amount, msg.desc); }}>PAY {msg.amount}</button>
                            )}
                          </div>
                        </div>
                      ) : (
                        msg.text
                      )}
                      <span className="message-time">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn btn-primary" style={{ padding: '0 20px' }} onClick={handleSendMessage}>Send</button>
                </div>
              </main>
            </div>
          ) : activeTab === 'history' ? (
            <div className="history-view">
              <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Service Ledger <small>Historical Maintenance Records</small></h2>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div className="search-bar-container">
                    <input
                      type="text"
                      placeholder="Search Ledger..."
                      className="table-search"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn-icon-label" onClick={handleExportCSV}>Export CSV</button>
                </div>
              </header>

              <div className="history-timeline-container">
                {filteredHistory.length > 0 ? (
                  <div className="timeline-feed">
                    {filteredHistory.map((item) => (
                      <div key={item.id} className="timeline-row animate-fade">
                        {/* Date Column */}
                        <div className="timeline-date-col">
                          <span className="t-month">{item.date.split(' ')[0]}</span>
                          <span className="t-day">{item.date.split(' ')[1].replace(',', '')}</span>
                          <span className="t-year">{item.date.split(' ')[2]}</span>
                        </div>

                        {/* Connector Column */}
                        <div className="timeline-connector">
                          <div className={`timeline-dot ${item.status}`}></div>
                          <div className="timeline-line"></div>
                        </div>

                        {/* content Card */}
                        <div className="timeline-content-card">
                          <div className="t-card-header">
                            <div>
                              <h4>{item.action}</h4>
                              <span className="t-machine-name">{item.machine}</span>
                            </div>
                            <div className="t-cost-tag">{item.cost}</div>
                          </div>

                          <div className="t-card-body">
                            <div className="t-info-item">
                              <span className="icon">👷</span>
                              <span>{item.expert}</span>
                            </div>
                            <div className="t-info-item">
                              <span className="icon">📄</span>
                              <span>Invoice #INV-{2020 + item.id}</span>
                            </div>
                          </div>

                          <div className="t-card-footer">
                            <span className={`status-badge-pill ${item.status}`}>{item.status}</span>
                            <button className="btn-text-small" onClick={() => { setSelectedReport(item); setShowReportModal(true); }}>View Report →</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-history">
                    <div className="empty-icon">📂</div>
                    <h3>No Records Found</h3>
                    <p>Try adjusting your search filters.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'legacy' ? (
            <div className="legacy-search-view">
              <header className="content-header">
                <h2>Legacy Lookup <small>Trace original manufacturers</small></h2>
              </header>
              <div className="search-interface-card">
                <p>Enter the machine name, manufacturer ID, or serial number found on the metal nameplate.</p>
                <div className="search-input-group">
                  <input
                    type="text"
                    className="legacy-input"
                    placeholder="e.g. Hydra-Tech or TEXT-40..."
                    onChange={(e) => setLegacyQuery(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleLegacySearch}>Search Source</button>
                </div>
              </div>
              <div className="results-grid">
                {legacyResults.length > 0 ? legacyResults.map(item => (
                  <div key={item.id} className="result-card">
                    <div className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</div>
                    <h3>{item.name}</h3>
                    <p><strong>Operating Years:</strong> {item.years}</p>
                    <p><strong>Current Support:</strong> {item.replacement}</p>
                    <button className="btn-small" onClick={() => handleRequestSpecs(item)}>Request Specialist Specs</button>
                  </div>
                )) : (
                  <div className="empty-search">
                    <p>Enter a manufacturer name to trace the source.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="full-screen-profile animate-fade">
              <div className="profile-hero-banner">
                <div className="profile-photo-section">
                  <div className="large-avatar-container">
                    {userPhoto ? <img src={userPhoto} className="profile-main-img" alt="Profile" /> : <div className="large-avatar-placeholder">{firstInitial}{lastInitial}</div>}
                    <div className="photo-controls">
                      <button className="btn-icon-label" onClick={() => fileInputRef.current.click()}>Upload Photo</button>
                      <button className="btn-icon-label" onClick={startCamera}>Take Selfie</button>
                      {userPhoto && <button className="btn-icon-label btn-remove" onClick={() => setUserPhoto(null)}>Remove</button>}
                      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
                    </div>
                  </div>
                  <div className="profile-header-text">
                    <h2 className="full-user-name">{(firstName || lastName) ? `${firstName} ${lastName}` : "Industrial Account User"} {isVerified && <span className="verified-badge">✓</span>}</h2>
                    <p className="full-user-org">{extraInfo || "No Organization Linked"}</p>
                  </div>
                </div>
              </div>

              <div className="identity-settings-list" style={{ position: 'relative' }}>
                {!isEditingProfile && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                    <button className="btn-text-action" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                  </div>
                )}
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Name</h4>
                    {!isEditingProfile ? (
                      <p>{(firstName || lastName) ? `${firstName} ${lastName}` : "Not Set"}</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <input className="std-input" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        <input className="std-input" value={lastName} onChange={e => setLastName(e.target.value)} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Organization</h4>
                    {!isEditingProfile ? (
                      <p>{extraInfo || "Not Set"}</p>
                    ) : (
                      <input className="std-input" style={{ width: '100%', marginTop: '5px' }} value={extraInfo} onChange={e => setExtraInfo(e.target.value)} />
                    )}
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Phone</h4>
                    {!isEditingProfile ? (
                      <p>{phone || "Not Set"}</p>
                    ) : (
                      <input className="std-input" style={{ width: '100%', marginTop: '5px' }} value={phone} onChange={e => setPhone(e.target.value)} />
                    )}
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Location</h4>
                    {!isEditingProfile ? (
                      <p>{location || "Not Set"}</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <select
                          className="std-input"
                          style={{ flex: 1, background: 'white' }}
                          value={selectedState}
                          onChange={e => {
                            const newState = e.target.value;
                            setSelectedState(newState);
                            const firstCity = INDIAN_LOCATIONS.find(l => l.state === newState)?.cities[0] || '';
                            setSelectedCity(firstCity);
                            setLocation(`${firstCity}, ${newState}`);
                          }}
                        >
                          <option value="">Select State</option>
                          {INDIAN_LOCATIONS.map(loc => (
                            <option key={loc.state} value={loc.state}>{loc.state}</option>
                          ))}
                        </select>
                        <select
                          className="std-input"
                          style={{ flex: 1, background: 'white' }}
                          value={selectedCity}
                          onChange={e => {
                            const newCity = e.target.value;
                            setSelectedCity(newCity);
                            setLocation(`${newCity}, ${selectedState}`);
                          }}
                          disabled={!selectedState}
                        >
                          <option value="">Select City / District</option>
                          {INDIAN_LOCATIONS.find(l => l.state === selectedState)?.cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Tax ID</h4>
                    {!isEditingProfile ? (
                      <p>{taxId || "Not Set"}</p>
                    ) : (
                      <input className="std-input" style={{ width: '100%', marginTop: '5px' }} value={taxId} onChange={e => setTaxId(e.target.value)} />
                    )}
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Date of Birth</h4>
                    {!isEditingProfile ? (
                      <p>{dob || "Not Set"}</p>
                    ) : (
                      <input type="date" className="std-input" style={{ width: '100%', marginTop: '5px' }} value={dob} onChange={e => setDob(e.target.value)} />
                    )}
                  </div>
                </div>

                <div className="document-upload-card">
                  <span className="doc-upload-icon">📄</span>
                  <p className="doc-upload-text">Industrial Verification</p>
                  <p className="doc-upload-hint">Upload factory license or certification to get verified.</p>
                  <button className="btn btn-primary" onClick={() => docInputRef.current.click()}>Choose Document</button>
                  <input type="file" ref={docInputRef} onChange={handleDocVerify} hidden accept=".pdf,image/*" />
                </div>

                {isEditingProfile && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                    <button className="btn btn-primary" style={{ padding: '12px 60px', fontSize: '1rem', background: 'var(--sage-green)' }} onClick={handleSaveConsumerProfile}>Save Industrial Changes</button>
                  </div>
                )}

                <div className="setting-row danger-row">
                  <div className="setting-info"><h4 className="danger-text">Purge Data</h4><p>Wipe all industrial nodes and historical records.</p></div>
                  <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
                </div>
              </div>
            </div>
          ) : activeTab === 'help' ? (
            <div className="support-view animate-fade" style={{ paddingTop: '20px' }}>
              <div className="help-quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div className="action-card-mini glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'white' }}>
                  <span style={{ fontSize: '2rem' }}>📞</span>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--navy-dark)' }}>Book Expert Call</h4>
                    <button className="btn-small-text" style={{ padding: 0, color: 'var(--sage-green)', fontWeight: 'bold' }} onClick={() => setShowCallModal(true)}>Book Now →</button>
                  </div>
                </div>
                <div className="action-card-mini glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', background: 'white' }}>
                  <span style={{ fontSize: '2rem' }}>📄</span>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--navy-dark)' }}>Technical Library</h4>
                    <button className="btn-small-text" style={{ padding: 0, color: 'var(--sage-green)', fontWeight: 'bold' }} onClick={() => setShowDocModal(true)}>Explore →</button>
                  </div>
                </div>
              </div>
              <div className="support-grid glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Left Column: Contact Form */}
                <div className="support-form-section">
                  <h3 className="panel-title" style={{ borderLeft: '4px solid var(--sage-green)', color: 'var(--navy-dark)' }}>Report an Issue</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Describe the machine fault or account issue you are facing.</p>

                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label className="field-label" style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b' }}>Subject</label>
                    <select className="std-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      value={supportTicket.subject}
                      onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                    >
                      <option>Machine Diagnosis Error</option>
                      <option>Expert Connection Issue</option>
                      <option>Billing / Invoice Dispute</option>
                      <option>Account Verification</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label className="field-label" style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b' }}>Description</label>
                    <textarea className="std-input" rows="5"
                      placeholder="Please provide details..."
                      style={{ width: '100%', resize: 'none', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      value={supportTicket.description}
                      onChange={(e) => setSupportTicket({ ...supportTicket, description: e.target.value })}
                    ></textarea>
                  </div>

                  <button className="btn-primary" onClick={handleSubmitSupportTicket}>Submit Ticket</button>
                  {showSupportPopup && (
                    <PopupModal message={supportPopupMsg} onClose={() => setShowSupportPopup(false)} />
                  )}
                </div>

                {/* Right Column: FAQs & Direct Contact */}
                <div className="support-info-section" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '40px' }}>
                  <h3 className="panel-title" style={{ borderLeft: '4px solid var(--sage-green)', color: 'var(--navy-dark)' }}>Quick Solutions</h3>
                  <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    <div className="faq-item">
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-dark)', margin: '0 0 5px' }}>How do I upload a video?</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Go to 'Get Diagnosis', select 'Video Analysis', and upload your file.</p>
                    </div>
                    <div className="faq-item">
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-dark)', margin: '0 0 5px' }}>Is my machine data private?</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Yes, all diagnostics are encrypted and only shared with experts you approve.</p>
                    </div>
                  </div>

                  <div className="direct-contact-box" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 10px', color: 'var(--sage-green)' }}>Emergency Contact</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span>📞</span>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)' }}>+91 1800-ORIGI-HELP</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>✉️</span>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)' }}>support@originode.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* [NEW] MY TICKETS SECTION */}
              <div className="support-history glass-panel" style={{ marginTop: '30px' }}>
                <h3 className="panel-title" style={{ borderLeft: '4px solid var(--sage-green)', color: 'var(--navy-dark)' }}>My Recent Tickets</h3>
                {myTickets.length > 0 ? (
                  <table className="data-table" style={{ width: '100%', marginTop: '15px' }}>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTickets.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontFamily: 'monospace', color: '#64748b' }}>#{String(t.id).substring(0, 8)}</td>
                          <td style={{ fontWeight: '600', color: 'var(--navy-dark)' }}>{t.subject}</td>
                          <td><span className={`status-pill ${t.status === 'open' ? 'pending' : 'completed'}`}>{t.status || 'open'}</span></td>
                          <td>{new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#64748b', padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', marginTop: '15px' }}>No previous tickets found.</p>
                )}
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="settings-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">CONTROL CENTER</h2>
                  <p className="tech-subtitle">Industrial Terminal Preferences & Security Protocols</p>
                </div>
              </header>

              <div className="glass-panel settings-section">
                <h3 className="panel-title">Interface Configuration</h3>
                <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Dark Mode (Beta)</span>
                      <small style={{ color: '#64748b' }}>Enable high-contrast dark theme for night missions.</small>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  {/* System Language option removed as per request */}
                </div>
              </div>

              <div className="glass-panel settings-section" style={{ marginTop: '25px' }}>
                <h3 className="panel-title">Security & Access</h3>
                <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Two-Factor Auth</span>
                      <small style={{ color: '#64748b' }}>Biological or token-based verification protocols.</small>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={isTwoFactorEnabled} onChange={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Network Visibility</span>
                      <small style={{ color: '#64748b' }}>Manage your industrial node broadcast range.</small>
                    </div>
                    <select className="custom-select-v3" value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)} style={{ width: 'auto' }}>
                      <option value="Public">Public Network</option>
                      <option value="Private">Private Mesh</option>
                      <option value="Partners">Partners Only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-panel settings-section" style={{ marginTop: '25px', borderColor: '#fecaca' }}>
                <h3 className="panel-title" style={{ color: '#dc2626', borderLeftColor: '#dc2626' }}>Storage & Identity</h3>
                <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Local Cache</span>
                      <small style={{ color: '#64748b' }}>Clear temporary files and diagnosis logs.</small>
                    </div>
                    <button className="btn-small-outline" style={{ width: 'auto' }}>Clear Data</button>
                  </div>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#dc2626', display: 'block' }}>Purge Identity</span>
                      <small style={{ color: '#64748b' }}>Permanently delete node account and history.</small>
                    </div>
                    <button className="btn-small-danger" onClick={() => setShowDeleteModal(true)} style={{ width: 'auto' }}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
              <h2>Section Under Development</h2>
              <p>This module will be available in the next update.</p>
            </div>
          )}
        </main>
        {showPaymentModal && (
          <div className="modal-overlay">
            <div className="confirm-modal" style={{ width: '400px', padding: '0', overflow: 'hidden' }}>
              {isPaymentProcessing ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="spinner-loader" style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid var(--sage-green)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <h3 style={{ marginTop: '25px', color: 'var(--navy-dark)' }}>Processing Secure Payment...</h3>
                  <p style={{ color: '#64748b' }}>Please do not close this window.</p>
                </div>
              ) : (
                <>
                  <div className="payment-modal-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: 'var(--navy-dark)', fontSize: '1.1rem' }}>Secure Payment</h3>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🔒 SSL Encrypted</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>PAYING TO</label>
                      <div style={{ fontWeight: '600', color: 'var(--navy-dark)' }}>OrigiNode Escrow Secure</div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>AMOUNT</label>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--sage-green)' }}>{paymentConfig?.amountStr}</div>
                      <small style={{ color: '#64748b' }}>{paymentConfig?.desc}</small>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '10px', color: '#475569' }}>PAYMENT METHOD</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}>💳 Card</div>
                        <div style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}>🏦 NetBanking</div>
                        <div style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}>📱 UPI</div>
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', justifyContent: 'center' }} onClick={confirmPayment}>
                      Pay {paymentConfig?.amountStr} Now
                    </button>
                    <button className="btn-small-text" style={{ width: '100%', marginTop: '15px', textAlign: 'center', color: '#94a3b8' }} onClick={() => setShowPaymentModal(false)}>
                      Cancel Transaction
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {showPaymentSuccess && (
          <div className="modal-overlay">
            <div className="confirm-modal" style={{ width: '350px', textAlign: 'center', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--sage-green)' }}>✅</div>
              <h3 style={{ color: 'var(--navy-dark)', marginBottom: '10px', fontSize: '1.4rem' }}>Payment Successful</h3>
              <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.5' }}>Your transaction has been securely processed. A receipt has been sent to your email.</p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', justifyContent: 'center' }} onClick={() => { setShowPaymentSuccess(false); setShowReviewModal(true); }}>Done</button>
            </div>
          </div>
        )}

        {showSaveSuccessModal && (
          <div className="modal-overlay">
            <div className="confirm-modal animate-fade" style={{ width: '380px', textAlign: 'center', padding: '35px', background: 'white', borderRadius: '15px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '70px', height: '70px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontSize: '2.5rem', color: '#10b981' }}>✓</span>
              </div>
              <h3 style={{ color: 'var(--navy-dark)', marginBottom: '10px', fontSize: '1.5rem', fontWeight: '800' }}>IDENTITY SAVED</h3>
              <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>Your professional industrial profile has been successfully synchronized with the origiNode network.</p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '10px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }} onClick={() => setShowSaveSuccessModal(false)}>Acknowledge & Close</button>
            </div>
          </div>
        )}

        {showNoChangesModal && (
          <div className="modal-overlay">
            <div className="confirm-modal animate-fade" style={{ width: '380px', textAlign: 'center', padding: '35px', background: 'white', borderRadius: '15px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '70px', height: '70px', background: '#fefce8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontSize: '2.5rem', color: '#eab308' }}>ℹ️</span>
              </div>
              <h3 style={{ color: 'var(--navy-dark)', marginBottom: '10px', fontSize: '1.5rem', fontWeight: '800' }}>NO CHANGES</h3>
              <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>The current profile information is already synchronized. No new updates were detected.</p>
              <button className="btn btn-secondary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '10px' }} onClick={() => setShowNoChangesModal(false)}>Back to Profile</button>
            </div>
          </div>
        )}

        {/* [NEW] REVIEW MODAL */}
        {showReviewModal && (
          <div className="modal-overlay">
            <div className="confirm-modal" style={{ width: '400px', textAlign: 'center', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⭐</div>
              <h3 style={{ color: 'var(--navy-dark)', marginBottom: '5px', fontSize: '1.4rem' }}>Rate Your Experience</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>How was the service provided by the expert?</p>

              <div className="rating-stars" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', fontSize: '2rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    style={{ color: star <= reviewData.rating ? 'var(--amber-gold)' : '#e2e8f0', transition: 'color 0.2s' }}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                className="std-input"
                rows="3"
                placeholder="Share your feedback (optional)..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                style={{ width: '100%', marginBottom: '20px', resize: 'none' }}
              ></textarea>

              <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', justifyContent: 'center' }} onClick={handleSubmitReview}>Submit Review</button>
              <button className="btn-small-text" style={{ marginTop: '15px', color: '#94a3b8' }} onClick={() => setShowReviewModal(false)}>Skip Feedback</button>
            </div>
          </div>
        )}

        {/* [NEW] EXPERT PROFILE MODAL */}
        {showExpertProfileModal && selectedExpert && (
          <div className="modal-overlay">
            <div className="confirm-modal" style={{ width: '400px', padding: '0', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy-dark)', padding: '30px 20px', textAlign: 'center', color: 'white' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--amber-gold)', borderRadius: '50%', color: 'black', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' }}>
                  {selectedExpert.avatar}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedExpert.name}</h2>
                <p style={{ margin: '5px 0 0', opacity: 0.8 }}>Certified Industry Specialist</p>
              </div>
              <div style={{ padding: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>4.9/5</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Rating</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--sage-green)' }}>98%</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Job Success</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Specializations</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                  {['Hydraulics', 'Pneumatics', 'PLC Systems', 'Safety Audits'].map(s => (
                    <span key={s} style={{ background: '#e2e8f0', color: '#475569', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem' }}>{s}</span>
                  ))}
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowExpertProfileModal(false)}>Close Profile</button>
              </div>
            </div>
          </div>
        )}

        {sharedModals}
      </div>
    );
  }



  // [NEW] VIEW 4: PRODUCER DASHBOARD (SERVICE REQUESTS)
  if (view === 'dashboard' && role === 'producer') {
    return (
      <div className="dashboard-wrapper producer-theme">
        <aside className="side-nav">

          <div className="profile-sidebar-summary" style={{ background: 'var(--navy-dark)' }}>
            <div className="nav-avatar-circle" style={{ background: 'var(--amber-gold)', color: 'black' }}>{getExpertInitials()}</div>
            <div className="nav-user-details">
              <span className="nav-name" style={{ color: 'white' }}>{profileData.name}</span>
              <span className="nav-email-small" style={{ color: '#94a3b8' }}>Verified Specialist</span>
            </div>
          </div>

          <nav className="nav-links">
            <div className={`nav-item ${activeTab === 'fleet' || activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
              Service Board
              {radarJobs.length > 0 && <span className="nav-badge" style={{ background: 'var(--error-red)', marginLeft: 'auto' }}>{radarJobs.length}</span>}
            </div>
            <div className={`nav-item ${activeTab === 'pro-messages' ? 'active' : ''}`} onClick={() => setActiveTab('pro-messages')}>
              Client Messages
              {producerChats.some(c => c.unread > 0) && <span className="nav-badge" style={{ background: 'var(--amber-gold)', marginLeft: 'auto', color: 'black' }}>!</span>}
            </div>
            <div className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>Earnings Report</div>
            <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Expert Profile</div>
            <div className="nav-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
            <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Operations Schedule</div>
            <div className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Parts Inventory</div>
            <div className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>Help & Support</div>
            <div className={`nav-item ${activeTab === 'platform-settings' ? 'active' : ''}`} onClick={() => setActiveTab('platform-settings')}>Platform Settings</div>
            <div className="nav-item logout-btn-item" onClick={handleLogout}>Logout</div>
          </nav>
        </aside>

        <main className="dashboard-content">
          <header className="dashboard-top-bar">
            {/* ... restored standard header content ... */}
            <div className="breadcrumb-info">origiNode / EXPERT TERMINAL</div>
            <div className="top-bar-actions" ref={notifRef}>
              <div className="status-badge-pill operational">● Available for Work</div>
              <div className="notif-bell-container" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                <span className="bell-icon">🔔</span>
                {(notifications || []).some(n => !n.read) && <span className="notif-ping"></span>}
              </div>

              {/* NOTIFICATION DROP DOWN */}
              {showNotifDropdown && (
                <div className="notif-dropdown animate-fade">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <button className="btn-small-text" onClick={handleClearNotifs}>Clear History</button>
                  </div>
                  <div className="dropdown-body">
                    {(notifications || []).length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`notif-drop-item ${!n.read ? 'unread' : ''}`}>
                        <div className={`notif-indicator ${n.type}`}></div>
                        <div className="notif-drop-content">
                          <p>{n.msg}</p>
                          <span>{n.time}</span>
                        </div>
                      </div>
                    )) : <div className="empty-notif" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No new alerts</div>}
                  </div>
                </div>
              )}
            </div>
          </header>

          {activeTab === 'requests' || activeTab === 'fleet' ? (
            // ... existing Service Board view ...
            <div className="animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">JOB COMMAND CENTER</h2>
                  <p className="tech-subtitle">Active Signal Monitoring & Job Queue</p>
                </div>
                <div className="header-actions">
                  <div className="tech-stat-group">
                    <div className="tech-stat-item">
                      <span className="label">SIGNAL STRENGTH</span>
                      <span className="value text-success">EXCELLENT</span>
                    </div>
                    <div className="tech-stat-divider"></div>
                    <div className="tech-stat-item">
                      <span className="label">QUEUE LOAD</span>
                      <span className="value">{(radarJobs || []).length} REQUESTS</span>
                    </div>
                    <div className="tech-stat-divider"></div>
                    <div className="tech-stat-item">
                      <span className="label">EST. EARNINGS</span>
                      <span className="value text-amber">₹78.5K</span>
                    </div>
                  </div>
                </div>
              </header>
              <div className="service-board-grid">
                {Array.isArray(radarJobs) && radarJobs.length > 0 ? radarJobs.map(req => {
                  // Stable distance from job ID hash
                  const distHash = String(req.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                  const dist = 5 + (distHash % 45);
                  return (
                    <div key={req.id} className={`job-card ${req.priority || 'normal'}`}>
                      <div className="job-card-header">
                        <div className="client-badge">
                          <div className="client-avatar">
                            {req.client_name ? (req.client_name[0] || 'C') + (req.client_name[1] || '') : 'C'}
                          </div>
                          <div className="client-meta">
                            <h4>{req.client_name || "Unknown Client"}</h4>
                            <span>Ticket #{String(req.id || '').substring(0, 6).toUpperCase()} • {req.created_at ? new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                          </div>
                        </div>
                        <div className="job-value">{getJobEstValue(req.id)}</div>
                      </div>
                      <div className="job-card-body">
                        {req.priority === 'critical' && <div className="priority-banner">⚠️ IMMEDIATE ATTENTION REQUIRED</div>}
                        <div className="machine-spec">
                          <span className="icon">⚙️</span>
                          <span className="name">{req.machine_name || 'Unknown Machine'}</span>
                        </div>
                        <p className="issue-desc">"{req.issue_description || 'No description provided'}"</p>
                        <div className="job-tags">
                          <span className="job-tag">{req.priority || 'Normal'}</span>
                          <span className="job-tag">Repair</span>
                          {req.video_url && <span className="job-tag">Has Video</span>}
                          <span className="job-dist">📍 {dist}km</span>
                        </div>
                      </div>
                      <div className="job-card-footer">
                        <button className="btn-job-action decline" onClick={() => handleDeclineJob(req.id)}>DECLINE</button>
                        <button className="btn-job-action accept" onClick={() => handleAcceptJob(req.id)}>ACCEPT ASSIGNMENT</button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="empty-state-container animate-fade" style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Top Row: Welcome & Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr 1fr 1fr', gap: '20px' }}>
                      <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid #e2e8f0', background: 'white' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--navy-dark)' }}>Welcome back, {profileData?.name || "Expert"}</h3>
                        <p style={{ color: '#64748b' }}>Your terminal is actively monitoring for new service requests.</p>
                      </div>
                      <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', border: '1px solid #e2e8f0', background: 'white' }}>
                        <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Earnings (This Week)</h4>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>₹{producerDashStats.earnings.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', border: '1px solid #e2e8f0', background: 'white' }}>
                        <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Completed Jobs</h4>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>{producerDashStats.completedJobs}</p>
                      </div>
                      <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', border: '1px solid #e2e8f0', background: 'white' }}>
                        <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Expert Rating</h4>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--navy-dark)' }}>⭐ {producerDashStats.rating.toFixed(1)}</p>
                      </div>
                    </div>

                    {/* Bottom Row: Active Jobs & Upcoming Schedule */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>

                      {/* Active Assignments */}
                      <div className="glass-panel" style={{ padding: '25px', border: '1px solid #e2e8f0', background: 'white' }}>
                        <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--navy-dark)' }}>
                          Current Assignments
                          <span style={{ fontSize: '0.8rem', background: '#eef2ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                            {producerChats.length} Active
                          </span>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {producerChats.length > 0 ? producerChats.slice(0, 3).map(chat => (
                            <div key={chat.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }} onClick={() => { setActiveChatId(chat.id); setActiveTab('pro-messages'); }}>
                              <div style={{ width: '45px', height: '45px', background: 'var(--navy-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>{chat.avatar}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <strong style={{ color: 'var(--navy-dark)' }}>{chat.name}</strong>
                                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '8px', background: chat.status === 'payment_pending' ? '#fef3c7' : '#dcfce7', color: chat.status === 'payment_pending' ? '#b45309' : '#166534', fontWeight: 'bold' }}>
                                    {chat.status === 'payment_pending' ? 'INVOICED' : 'IN PROGRESS'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{chat.lastMsg}</div>
                              </div>
                            </div>
                          )) : (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '0.9rem' }}>No active assignments currently.</div>
                          )}

                          {producerChats.length > 3 && (
                            <button className="btn-small-text" style={{ marginTop: '10px', alignSelf: 'center', color: 'var(--navy-primary)' }} onClick={() => setActiveTab('pro-messages')}>Review all assignments →</button>
                          )}
                        </div>
                      </div>

                      {/* Upcoming Schedule */}
                      <div className="glass-panel" style={{ padding: '25px', border: '1px solid #e2e8f0', background: 'white' }}>
                        <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--navy-dark)' }}>
                          Upcoming Schedule
                          <button className="btn-small-text" onClick={() => setActiveTab('schedule')} style={{ color: 'var(--navy-primary)' }}>Manage ⚙️</button>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid var(--sage-green)', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', textAlign: 'center', minWidth: '65px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '2px' }}>Tomorrow</div>
                              <div style={{ fontSize: '1.2rem', color: 'var(--navy-dark)', fontWeight: 'bold' }}>09:00</div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', marginBottom: '6px', fontSize: '0.95rem' }}>Routine Maintenance: Line 4 Motors</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span>📍 Solaris Power</span>
                                <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                <span>15km away</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #facc15', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', textAlign: 'center', minWidth: '65px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '2px' }}>Friday</div>
                              <div style={{ fontSize: '1.2rem', color: 'var(--navy-dark)', fontWeight: 'bold' }}>14:30</div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: 'var(--navy-dark)', marginBottom: '6px', fontSize: '0.95rem' }}>Follow-up: Hydraulic Pressure Reset</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span>📍 Apex Manufacturing</span>
                                <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                <span>22km away</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'inventory' ? (
            <div className="inventory-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">PARTS INVENTORY</h2>
                  <p className="tech-subtitle">Toolkit & Spare Parts Ledger</p>
                </div>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => alert("Order Requisition Form Opening...")}>+ Requisition Order</button>
                </div>
              </header>

              <div className="inventory-grid">
                {[
                  { name: "Hydraulic Seals (Series A)", stock: 12, status: "Good", cat: "Consumables" },
                  { name: "PLC Logic Controller", stock: 2, status: "Low Stock", cat: "Electronics" },
                  { name: "Torque Wrench Set", stock: 1, status: "Available", cat: "Tools" },
                  { name: "Industrial Fuse (Amps)", stock: 45, status: "Good", cat: "Consumables" },
                  { name: "Lubricant (Grade 4)", stock: 5, status: "Critical", cat: "Fluids" },
                ].map((part, idx) => (
                  <div key={idx} className="part-card glass-panel">
                    <div className="part-icon">{part.cat === 'Tools' ? '🔧' : part.cat === 'Electronics' ? '📟' : '🔩'}</div>
                    <div className="part-info">
                      <h4>{part.name}</h4>
                      <span className="part-cat">{part.cat}</span>
                    </div>
                    <div className="part-stock">
                      <span className="stock-count">{part.stock}</span>
                      <span className={`stock-status ${part.status === 'Critical' || part.status === 'Low Stock' ? 'red' : 'green'}`}>{part.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'schedule' ? (
            <div className="schedule-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">OPERATIONS SCHEDULE</h2>
                  <p className="tech-subtitle">Weekly Operational Planning</p>
                </div>
                <div className="header-actions" style={{ gap: '15px' }}>
                  <div className="date-nav">
                    <button className="btn-icon">◀</button>
                    <span style={{ fontWeight: '700', color: 'var(--navy-dark)' }}>Feb 19 - Feb 25, 2026</span>
                    <button className="btn-icon">▶</button>
                  </div>
                </div>
              </header>

              <div className="glass-panel schedule-container" style={{ position: 'relative' }}>
                <div className="schedule-grid">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="day-col">
                      <div className="day-header">{day}</div>
                      <div className="day-slots">
                        {/* CURRENT SLOTS */}
                        {weeklySchedule.filter(s => s.day_of_week === day).map((slot, sIdx) => (
                          <div
                            key={sIdx}
                            className={`schedule-card ${slot.slot_type}`}
                            style={slot.start_time ? { top: `${(parseInt(slot.start_time.split(':')[0]) - 8) * 60}px` } : {}}
                          >
                            <span className="time">{slot.start_time} - {slot.end_time}</span>
                            <h4>{slot.title}</h4>
                            <p>{slot.description}</p>
                          </div>
                        ))}

                        {/* AI SUGGESTED SLOTS */}
                        {suggestedSlots.filter(s => s.day_of_week === day).map((slot, sIdx) => (
                          <div
                            key={`suggested-${sIdx}`}
                            className="schedule-card suggested animate-pulse-subtle"
                            style={slot.start_time ? { top: `${(parseInt(slot.start_time.split(':')[0]) - 8) * 60}px` } : {}}
                          >
                            <div className="ai-badge">AI PROP</div>
                            <span className="time">{slot.start_time} - {slot.end_time}</span>
                            <h4>{slot.title}</h4>
                            <p>{slot.description}</p>
                            <div className="suggested-actions">
                              <button className="btn-confirm-mini" onClick={() => {
                                setWeeklySchedule([...weeklySchedule, slot]);
                                setSuggestedSlots(suggestedSlots.filter(s => s !== slot));
                                api.post('/schedule', slot);
                              }}>Accept</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {suggestedSlots.length > 0 && (
                  <div className="ai-suggestion-footer animate-slide-up">
                    <div className="ai-insight">
                      <span className="icon">🧠</span>
                      <span>AI found <strong>{suggestedSlots.length} optimal windows</strong> for pending industrial signals.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-secondary-dark" onClick={() => setSuggestedSlots([])}>Discard</button>
                      <button className="btn-primary-tech" onClick={handleConfirmAISchedule}>Synchronize All Proposals</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'support' ? (
            <div className="support-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">HELP & SUPPORT</h2>
                  <p className="tech-subtitle">24/7 Expert Assistance Center</p>
                </div>
              </header>

              <div className="support-grid glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Left Column: Contact Form */}
                <div className="support-form-section">
                  <h3 className="panel-title">Report an Issue</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Describe the technical or account issue you are facing.</p>

                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label className="field-label">Subject</label>
                    <select className="std-input" style={{ width: '100%' }}>
                      <option>Payment / Payout Issue</option>
                      <option>Technical Glitch (App)</option>
                      <option>Job Dispute</option>
                      <option>Account Verification</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label className="field-label">Description</label>
                    <textarea className="std-input" rows="5" placeholder="Please provide details..." style={{ width: '100%', resize: 'none' }}></textarea>
                  </div>

                  <button className="btn-primary" onClick={() => alert("Ticket #9920 Created! Support team will contact you shortly.")}>Submit Ticket</button>
                </div>

                {/* Right Column: FAQs & Direct Contact */}
                <div className="support-info-section" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '40px' }}>
                  <h3 className="panel-title">Quick Solutions</h3>
                  <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    <div className="faq-item">
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-dark)', margin: '0 0 5px' }}>My payout is pending?</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Payouts are processed every Wednesday. Please check your bank details.</p>
                    </div>
                    <div className="faq-item">
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-dark)', margin: '0 0 5px' }}>How to decline a job?</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Use the 'Decline' button on the Job Card. Repeated declines may affect score.</p>
                    </div>
                  </div>

                  <div className="direct-contact-box" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 10px', color: 'var(--navy-primary)' }}>Emergency Contact</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span>📞</span>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)' }}>+91 1800-ORIGI-HELP</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>✉️</span>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)' }}>support@originode.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'platform-settings' ? (
            <div className="settings-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">PLATFORM CONFIGURATION</h2>
                  <p className="tech-subtitle">System Preferences & Privacy Controls</p>
                </div>
              </header>
              <div className="glass-panel settings-section">
                <h3 className="panel-title">General Preferences</h3>
                <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Dark Mode (Beta)</span>
                      <small style={{ color: '#64748b' }}>Enable high-contrast dark theme for night shifts.</small>
                    </div>
                    <div className="toggle-switch"></div>
                  </div>
                  {/* Language dropdown removed as per request */}
                </div>
              </div>

              <div className="glass-panel settings-section" style={{ marginTop: '25px' }}>
                <h3 className="panel-title">Notification Channels</h3>
                <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>SMS Alerts</span>
                      <small style={{ color: '#64748b' }}>Receive critical job offers via SMS.</small>
                    </div>
                    <div className="toggle-switch active"></div>
                  </div>
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Email Summaries</span>
                      <small style={{ color: '#64748b' }}>Daily earnings reports and weekly stats.</small>
                    </div>
                    <div className="toggle-switch active"></div>
                  </div>
                </div>
              </div>

              <div className="glass-panel settings-section" style={{ marginTop: '25px', borderColor: '#fecaca' }}>
                <h3 className="panel-title" style={{ color: '#dc2626', borderLeftColor: '#dc2626' }}>Danger Zone</h3>
                <div className="settings-grid">
                  <button className="btn-secondary" style={{ color: '#dc2626', borderColor: '#fecaca', width: '100%' }} onClick={() => alert("Are you sure? This action cannot be undone.")}>Request Account Deletion</button>
                </div>
              </div>
            </div>
          ) : activeTab === 'pro-messages' ? (
            <div className="messages-view animate-fade">
              <aside className="messages-sidebar">
                <div className="chat-search-bar">
                </div>
                <div className="chat-list">
                  {producerChats.length > 0 ? producerChats.map(chat => (
                    <div key={chat.id} className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`} onClick={() => setActiveChatId(chat.id)}>
                      <div className="chat-avatar">{chat.avatar}</div>
                      <div className="chat-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 className="chat-name">{chat.name}</h4>
                          <span className="chat-time">{chat.time}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="chat-preview" style={chat.unread ? { fontWeight: '700', color: 'var(--navy-dark)' } : {}}>{chat.lastMsg}</p>
                          {chat.status && <span style={{ fontSize: '0.65rem', background: chat.status === 'accepted' ? '#dcfce7' : '#fef3c7', color: chat.status === 'accepted' ? '#166534' : '#92400e', padding: '2px 6px', borderRadius: '8px', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '4px' }}>{chat.status.toUpperCase()}</span>}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💬</p>
                      <p>No active jobs yet.<br />Accept a job to start chatting.</p>
                    </div>
                  )}
                </div>
              </aside>

              <main className="chat-window">
                <header className="chat-header">
                  <div className="chat-partner-info">
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-dark)' }}>{producerChats.find(c => c.id === activeChatId)?.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--sage-green)', fontWeight: '600' }}>● Key Account</span>
                  </div>
                  <button className="btn-icon-label" style={{ fontSize: '0.8rem' }}>View Contract</button>
                </header>

                <div className="chat-body">
                  {messages.filter(m => m.chatId === activeChatId).map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender === 'expert' ? 'sent' : 'received'}`}>
                      {/* INVOICE LOGIC REUSED IF NEEDED OR JUST TEXT */}
                      {msg.type === 'invoice' ? (
                        <div className="invoice-message-card">
                          <div className="invoice-header">INVOICE SENT</div>
                          <div className="invoice-body">
                            <div className="invoice-row"><span>Service:</span> <strong>{msg.desc}</strong></div>
                            <div className="invoice-total"><span>Total:</span> <span>{msg.amount}</span></div>
                          </div>
                        </div>
                      ) : (
                        msg.text
                      )}
                      <span className="message-time">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className="chat-input-area">
                  <button className="btn-icon" onClick={() => setShowInvoiceCreator(true)} title="Create Invoice" style={{ marginRight: '10px', fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none' }}>🧾</button>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn btn-primary" style={{ padding: '0 20px' }} onClick={handleSendMessage}>Send</button>
                </div>
              </main>
            </div>
          ) : activeTab === 'earnings' ? (
            <div className="earnings-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">FINANCIAL PERFORMANCE</h2>
                  <p className="tech-subtitle">Revenue Streams & Payout History</p>
                </div>
                <div className="header-actions">
                  <button className="btn-secondary" onClick={handleExportCSV}>Export CSV</button>
                </div>
              </header>

              <div className="earnings-stats-grid">
                <div className="stat-card">
                  <div className="stat-label">TOTAL REVENUE (YTD)</div>
                  <div className="stat-value">₹{earningsStats.totalRevenue.toLocaleString()}</div>
                  <div className="stat-trend positive">▲ 12.5% vs last month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">PENDING PAYOUT</div>
                  <div className="stat-value">₹{earningsStats.pendingPayout.toLocaleString()}</div>
                  <div className="stat-sub">Next payout: Feb 21</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">AVG. TICKET VALUE</div>
                  <div className="stat-value">₹{earningsStats.avgTicket}</div>
                  <div className="stat-trend neutral">─ Stable</div>
                </div>
              </div>

              {/* [NEW] ANALYTICS CHART */}
              <div className="glass-panel analytics-chart-container" style={{ marginBottom: '25px', padding: '20px', background: 'white' }}>
                <h3 className="section-title" style={{ marginBottom: '20px' }}>Revenue Analytics</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--navy-primary)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="var(--navy-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--navy-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="transactions-section glass-panel">
                <h3 className="section-title">Recent Transactions</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Service ID</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionHistory.length > 0 ? (
                      transactionHistory.map(tx => (
                        <tr key={tx.id}>
                          <td>{tx.date}</td>
                          <td style={{ fontWeight: '600', color: 'var(--navy-dark)' }}>{tx.client}</td>
                          <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{tx.service}</td>
                          <td>
                            <span className={`status-pill ${tx.status.toLowerCase()}`}>{tx.status}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--navy-dark)' }}>{tx.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No transactions recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="profile-view animate-fade">
              <header className="content-header glass-header">
                <div>
                  <h2 className="tech-title">EXPERT PROFILE</h2>
                  <p className="tech-subtitle">Manage Credentials & specialized skills</p>
                </div>
                {!isEditingProfile && (
                  <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                  </div>
                )}
              </header>

              <div className="profile-grid">
                {/* ID Card / Main Info */}
                <div className="glass-panel profile-card">
                  <div className="profile-header-visual">
                    <div className="profile-avatar-large">{getExpertInitials()}</div>
                    <div className="verification-badge">✔ VERIFIED EXPERT</div>
                  </div>
                  <div className="profile-info-body">
                    {isEditingProfile ? (
                      <div className="edit-mode-inputs">
                        <label>Display Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="std-input"
                        />
                        <label>Professional Role</label>
                        <input
                          type="text"
                          value={profileData.role}
                          onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                          className="std-input"
                        />
                      </div>
                    ) : (
                      <>
                        <h3>{profileData.name}</h3>
                        <p className="role-text">{profileData.role}</p>
                      </>
                    )}

                    <div className="profile-meta-row" style={isEditingProfile ? { flexDirection: 'column', gap: '10px' } : {}}>
                      {isEditingProfile ? (
                        <>
                          <div className="edit-field-row">
                            <span>🆔 ID:</span>
                            <input type="text" value={profileData.id} onChange={(e) => setProfileData({ ...profileData, id: e.target.value })} className="std-input compact" />
                          </div>
                          <div className="edit-field-row">
                            <span>📍 Location:</span>
                            <input type="text" value={profileData.location} onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} className="std-input compact" />
                          </div>
                        </>
                      ) : (
                        <>
                          <span>🆔 {profileData.id}</span>
                          <span>📍 {profileData.location}</span>
                        </>
                      )}
                    </div>

                    {/* Contact Info Section (New Request) */}
                    <div className="profile-contact-section" style={{ borderTop: '1px solid #e2e8f0', width: '100%', padding: '15px 0', marginBottom: '15px' }}>
                      <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Contact Details</h4>
                      {isEditingProfile ? (
                        <div className="edit-contact-grid">
                          <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="std-input" placeholder="Email" />
                          <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="std-input" placeholder="Phone" />
                        </div>
                      ) : (
                        <div className="contact-display">
                          <div className="contact-item">📧 {profileData.email}</div>
                          <div className="contact-item">📞 {profileData.phone}</div>
                        </div>
                      )}
                    </div>

                    <div className="profile-stats-row">
                      <div className="p-stat"><strong>4.9</strong><span>Rating</span></div>
                      <div className="p-stat"><strong>142</strong><span>Jobs</span></div>
                      <div className="p-stat"><strong>98%</strong><span>Success</span></div>
                    </div>
                  </div>
                </div>

                {/* Skills & Certifications */}
                <div className="glass-panel skills-card">
                  <h3 className="panel-title">Technical Specializations</h3>
                  <div className="skills-tags-container">
                    {(profileData.skills || []).map(skill => (
                      <span key={skill} className="tech-tag">
                        {skill}
                        {isEditingProfile && <button onClick={() => handleRemoveSkill(skill)} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>×</button>}
                      </span>
                    ))}
                    {isEditingProfile && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '10px' }}>
                        <input
                          type="text"
                          className="std-input compact"
                          placeholder="Add new skill..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSkill(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="panel-title" style={{ marginTop: '25px' }}>Certifications</h3>
                  <div className="cert-list">
                    <div className="cert-item">
                      <span className="cert-icon">📜</span>
                      <div className="cert-details">
                        <h4>Certified Automation Professional (CAP)</h4>
                        <span>Issued: Jan 2024 • Valid until: 2027</span>
                      </div>
                      <span className="cert-status valid">Valid</span>
                    </div>
                    <div className="cert-item">
                      <span className="cert-icon">⚡</span>
                      <div className="cert-details">
                        <h4>High Voltage Safety Level 3</h4>
                        <span>Issued: Mar 2023 • Valid until: 2025</span>
                      </div>
                      <span className="cert-status valid">Valid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="glass-panel settings-section" style={{ marginTop: '25px' }}>
                <h3 className="panel-title">Account Settings</h3>
                <div className="settings-grid">
                  <div className="setting-item">
                    <label>Availability Status</label>
                    <select className="std-input">
                      <option>Available for Work</option>
                      <option>Busy / On Job</option>
                      <option>Offline</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Service Radius (km)</label>
                    <input type="range" min="10" max="100" value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)} className="range-slider" />
                    <span className="range-value">{serviceRadius} km</span>
                  </div>
                  <div className="setting-item">
                    <label>Critical Alerts</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                      <span style={{ marginRight: '10px', fontSize: '0.8rem', color: '#64748b' }}>Off</span>
                      <div className="toggle-switch active"></div>
                      <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--navy-primary)', fontWeight: 'bold' }}>On</span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '14px 60px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 8px 25px rgba(15, 23, 42, 0.2)', background: 'var(--sage-green)' }}
                    onClick={handleSaveExpertProfile}
                  >
                    Save Expert Identity
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="animate-fade" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
              <h2>Section Under Development</h2>
              <p>This module will be available in the next update.</p>
            </div>
          )}
        </main>

        {/* [NEW] INVOICE CREATOR MODAL */}
        {showInvoiceCreator && (
          <div className="modal-overlay">
            <div className="confirm-modal" style={{ width: '350px', padding: '25px' }}>
              <h3>Create Invoice</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
                <input type="number" className="std-input" value={invoiceData.amount} onChange={e => setInvoiceData({ ...invoiceData, amount: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                <input type="text" className="std-input" value={invoiceData.desc} onChange={e => setInvoiceData({ ...invoiceData, desc: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSendInvoice}>Send Invoice</button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowInvoiceCreator(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Book Expert Modal */}
        {showBookExpertModal && (
          <div className="modal-overlay">
            <div className="confirm-modal" style={{ width: '350px', padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'var(--sage-green)' }}>📅</div>
              <h3 style={{ color: 'var(--navy-dark)', marginBottom: '10px' }}>Expert Booked!</h3>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>Your request to book an expert has been received. You will be notified when the expert confirms the appointment.</p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowBookExpertModal(false)}>OK</button>
            </div>
          </div>
        )}

        {
          showPaymentReceived && (
            <div className="modal-overlay">
              <div className="confirm-modal" style={{ width: '400px', textAlign: 'center', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderTop: '5px solid var(--sage-green)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
                <h3 style={{ color: 'var(--navy-dark)', marginBottom: '5px', fontSize: '1.4rem' }}>Payment Received!</h3>
                <p style={{ color: 'var(--sage-green)', fontWeight: '700', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Job Completed</p>
                <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.5' }}>Funds have been deposited to your escrow wallet. You can withdraw them in the Earnings tab.</p>
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', justifyContent: 'center' }} onClick={() => setShowPaymentReceived(false)}>Acknowledge</button>
              </div>
            </div>
          )
        }

        {sharedModals}
      </div >
    );
  }
  // End of modal logic


  // --- RETURN: LOGIN / SIGNUP / LANDING VIEW ---
  return (
    <div className={`login-page-wrapper ${role}-theme`}>
      <button className="back-btn-top" onClick={() => setView('landing')}>← Exit to origiNode</button>


      <div className="glass-container">
        <div className={`login-visual ${role}-bg`}>
          <div className="visual-overlay">
            <div className="visual-integrity-badge">
              <div className="v-pulse"></div>
              <span>SYSTEM INTEGRITY: SECURE</span>
            </div>

            <h3>
              {view === 'forgot' ? 'Security Recovery' : (role === 'consumer' ? 'Industrial Continuity' : 'Expert Terminal')}
            </h3>
            <p>
              {view === 'forgot'
                ? 'Protecting your industrial access and identity.'
                : (role === 'consumer'
                  ? 'Managing legacy hardware with 21st-century precision.'
                  : 'Accessing the global network for industrial support and diagnostics.')}
            </p>

            <div className="visual-stats-grid">
              <div className="v-stat">
                <span className="v-label">{role === 'consumer' ? 'MACHINES' : 'THROUGHPUT'}</span>
                <span className="v-value">{role === 'consumer' ? '850K+' : '4.2 TB/S'}</span>
              </div>
              <div className="v-stat">
                <span className="v-label">{role === 'consumer' ? 'UPTIME' : 'EXPERTS'}</span>
                <span className="v-value">{role === 'consumer' ? '99.9%' : '12.8K+'}</span>
              </div>
              <div className="v-stat">
                <span className="v-label">{role === 'consumer' ? 'NODES' : 'RECOVERY'}</span>
                <span className="v-value">{role === 'consumer' ? '1.2K' : '99.4%'}</span>
              </div>
            </div>

            <div className="status-indicator">
              <span className="dot"></span> {role === 'consumer' ? 'Platform Active' : 'Network Online'}
            </div>
          </div>
        </div>

        <div className="login-form-area">
          <h1 className="form-title" style={{ marginBottom: '15px', fontSize: '1.6rem' }}>
            {view === 'forgot'
              ? 'Reset Password'
              : isLogin ? `${role === 'consumer' ? 'Consumer' : 'Producer'} Login` : `Signup Step ${signupStep === 3 ? '2' : '1'}`}
          </h1>

          {isLogin ? (
            // LOGIN FORM
            <div className="animate-fade">
              <div className="input-row" style={{ marginBottom: '12px' }}>
                <label>Work Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'field-error' : ''}
                />
                {errors.email && <small className="error-msg">{errors.email}</small>}
              </div>

              {view !== 'forgot' && (
                <div className="input-row" style={{ marginBottom: '10px' }}>
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? 'field-error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <span className="forgot-password-link" onClick={() => { setView('forgot'); setErrors({}); }} style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}>Forgot Password?</span>
                  </div>
                  {errors.password && <small className="error-msg">{errors.password}</small>}
                </div>
              )}
            </div>
          ) : (
            // SIGNUP STEPS
            // SIGNUP STEPS - ENHANCED UI
            <div className="animate-fade">
              {/* VISUAL STEPPER */}
              <div className="signup-stepper">
                <div className={`step-item ${signupStep >= 1 ? 'active' : ''}`}>
                  <div className="step-circle">{signupStep === 3 ? '✓' : '1'}</div>
                  <span className="step-label">Identity</span>
                </div>
                <div className={`step-line ${signupStep === 3 ? 'filled' : ''}`}></div>
                <div className={`step-item ${signupStep === 3 ? 'active' : ''}`}>
                  <div className="step-circle">2</div>
                  <span className="step-label">Profile</span>
                </div>
              </div>

              {signupStep === 1 && (
                <div className="signup-form-step">
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-field-modern">
                      <label>First Name</label>
                      <input type="text" placeholder="John" value={firstName} autoComplete="off" onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="input-field-modern">
                      <label>Last Name</label>
                      <input type="text" placeholder="Doe" value={lastName} autoComplete="off" onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-field-modern" style={{ flex: 1.5 }}>
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+91 98765 43210" value={phone} autoComplete="tel" onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="input-field-modern" style={{ flex: 1 }}>
                      <label>Birth Date</label>
                      <input type="date" onChange={(e) => setDob(e.target.value)} />
                    </div>
                  </div>
                  {errors.phone && <small className="error-msg" style={{ display: 'block', marginBottom: '5px' }}>{errors.phone}</small>}

                  <div className="input-field-modern">
                    <label>Work Email</label>
                    <input type="email" placeholder="name@company.com" value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-field-modern" style={{ flex: 1 }}>
                      <label>Password</label>
                      <input type="password" placeholder="Min 8 chars" value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-field-modern" style={{ flex: 1 }}>
                      <label>Confirm</label>
                      <input type="password" placeholder="Repeat password" value={confirmPassword} autoComplete="new-password" onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                  </div>
                  {errors.confirmPassword && <small className="error-msg">{errors.confirmPassword}</small>}
                  {errors.password && <small className="error-msg">{errors.password}</small>}
                </div>
              )}

              {signupStep === 3 && (
                <div className="signup-form-step">
                  <div className="input-field-modern">
                    <label>{role === 'consumer' ? 'Company / Organization Name' : 'Technical Specialization Area'}</label>
                    <div className="input-icon-wrapper">
                      <span className="input-prefix-icon">{role === 'consumer' ? '🏢' : '🛠️'}</span>
                      <input type="text" placeholder={role === 'consumer' ? "e.g. Acme Industries Ltd." : "e.g. Industrial Hydraulics, Automation..."} onChange={(e) => setExtraInfo(e.target.value)} style={{ paddingLeft: '40px' }} autoFocus />
                    </div>
                    <small style={{ color: '#94a3b8', marginTop: '5px', display: 'block' }}>
                      {role === 'consumer' ? 'Visible on your service requests' : 'Helps match you with relevant jobs'}
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}

          {errors.server && <div className="error-alert animate-fade">{errors.server}</div>}
          {showSaveSuccessModal && <div className="success-alert animate-fade">Operation Successful! Redirecting...</div>}

          <button className="main-action-btn" onClick={handleLogin}>
            {view === 'forgot' ? 'Send Reset Link' : isLogin ? 'Enter Portal' : (signupStep === 1 ? 'Continue' : 'Finish Setup')}
          </button>

          {view !== 'forgot' && (
            <div className="animate-fade">
              {isLogin && (
                <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
                  Demo: admin@originode.com / Demo@1234
                </p>
              )}
              <div className="divider" style={{ margin: '12px 0' }}><span>OR</span></div>
              <div className="social-grid" style={{ gap: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
                <button className="btn-social apple" onClick={() => handleSocialLogin('Apple')}>
                  <svg width="20" height="20" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                  </svg>
                  <span style={{ flex: 1, textAlign: 'center' }}>Continue with Apple</span>
                </button>
              </div>
            </div>
          )}

          <p className="switch-text" style={{ marginTop: '15px', fontSize: '0.85rem' }}>
            {isLogin ? "New to the platform?" : "Already registered?"}
            <span onClick={() => { setIsLogin(!isLogin); setSignupStep(1); setErrors({}); }}> {isLogin ? "Sign Up" : "Login"}</span>
          </p>
          {sharedModals}
        </div>
      </div>
      {showSocialModal && <SocialLoginModal />}
      {showForgotModal && (
        <PopupModal
          title="Reset Link Sent"
          message={`If an account exists, a reset link has been sent to ${email}`}
          onClose={() => {
            setShowForgotModal(false);
          }}
        />
      )}
    </div >
  );
}


export default App;

