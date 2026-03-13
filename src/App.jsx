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

// Material UI
import {
  LocationOn as LocationIcon,
  Email as EmailIcon,
  LocalPhone as PhoneIcon,
  Verified as VerifiedIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';

// Modern SaaS Dashboard Components
import DashboardLayout from './layouts/DashboardLayout';
import FleetView from './components/FleetView';
import MessagesView from './components/MessagesView';
import HistoryView from './components/HistoryView';
import LegacySearchView from './components/LegacySearchView';
import ProfileView from './components/ProfileView';
import { SupportView, SettingsView } from './components/SupportSettingsView';
import ProducerDashboard from './components/ProducerDashboard';

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
  { id: 103, chatId: 1, sender: 'expert', text: "Not yet, but we recommend scheduling a valve seal replacement.", time: "10:15 AM" },
  { id: 104, chatId: 1, sender: 'expert', text: '[INVOICE]:{"amount":"4500", "desc":"Valve Seal Replacement"}', type: 'invoice', amount: "4500", desc: "Valve Seal Replacement", time: "10:18 AM" }
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

  // [NEW] CHECKOUT MODAL STATES
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [checkoutDesc, setCheckoutDesc] = useState('');

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
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [showPaymentReceived, setShowPaymentReceived] = useState(false);
  const [completedJobId, setCompletedJobId] = useState(null);

  const [showExpertProfileModal, setShowExpertProfileModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false);
  const [showInvoiceSuccess, setShowInvoiceSuccess] = useState(false);
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
    if (view !== 'dashboard') return;
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
  }, [activeTab, view, role]);

  // [NEW] FETCH SUPPORT TICKETS
  useEffect(() => {
    if (view !== 'dashboard') return;
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
    if (view !== 'dashboard') return;
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

    // Handle real-time invoice receipt
    newSocket.on('invoice_received', (data) => {
      console.log("[Socket] Targeted Invoice Received:", data);
      // Trigger the premium checkout flow directly
      handlePayment(`₹${data.amount}`, data.message || "Expert Service Invoice", data.requestId);
    });

    // Real-time: status updates for jobs
    newSocket.on('status_update', (data) => {
      console.log("[Socket] Status Update:", data);
      // Update UI if needed, e.g., mark as completed if status is 'completed'
      if (data.status === 'completed') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          chatId: data.requestId,
          sender: 'system',
          text: "✓ Service request marked as completed. Payment verified.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    });

    // Real-time: job completion specific event
    newSocket.on('job_completed', (data) => {
      console.log("[Socket] Job Completed:", data);
      if (role === 'producer') {
        setShowPaymentReceived(true);
      }
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
        const userStr = localStorage.getItem('user');
        const user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : { id: 1 };
        socket.emit('send_message', {
          requestId: activeChatId,
          senderId: user.id || user.user_id || 1, // Ensure ID is present
          text: formattedMsg
        });
      }

      setShowInvoiceSuccess(true);
      setShowInvoiceCreator(false);
      setInvoiceData({ amount: '', desc: '' });

    } catch (err) {
      console.error("Failed to create invoice", err);
      alert("Failed to send invoice. Reason: " + (err.response?.data?.message || err.message));
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
  const handleSendMessage = (text) => {
    const msgToSubmit = text || newMessage;
    if (msgToSubmit.trim() && socket) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      // Emit to Server
      socket.emit('send_message', {
        requestId: activeChatId,
        senderId: user.id,
        text: msgToSubmit
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
      date: th.created_at ? new Date(th.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
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

  // [REMOVED] Legacy mock payment logic replaced by premium Razorpay flow

  // [NEW] SUBMIT REVIEW HANDLER
  const handleSubmitReview = async () => {
    if (!completedJobId) return;

    // Optimistic UI Update
    setShowReviewModal(false);
    setShowReviewSuccess(true);

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
    if (!isLogin) {
      if (!validate()) return;
      try {
        const res = await api.post('/auth/register', {
          email,
          password,
          role,
          firstName,
          lastName,
          phone,
          dob,
          organization: extraInfo
        });

        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setRole(res.data.user.role || 'consumer');
            setActiveTab(res.data.user.role === 'consumer' ? 'fleet' : 'requests');
          }
          setView('dashboard');
        } else {
          setErrors({ server: "Invalid signup response." });
        }
      } catch (err) {
        setErrors({
          server: err.response?.data?.message || "Signup failed."
        });
      }
      return;
    }

    // Basic validation for Login
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
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          setRole(res.data.user.role || 'consumer');
          setActiveTab(res.data.user.role === 'consumer' ? 'fleet' : 'requests');
        }
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
          // Use the premium handlePayment flow
          handlePayment(`₹${data.amount}`, data.message || "Expert Service Invoice", data.requestId);
        }

        if (data.status === 'completed' && role === 'producer') {
          setShowPaymentReceived(true);
        }
      };

      // Since the event name is dynamic status_update_${jobId}, 
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

  const handlePayment = (amountStr, desc, requestId = null) => {
    const providerPrice = parseInt(String(amountStr).replace(/[^0-9]/g, '')) || 5000;
    const commissionPercentage = parseFloat(import.meta.env.VITE_PLATFORM_COMMISSION_PERCENTAGE || '10');
    const commission = (providerPrice * commissionPercentage) / 100;
    const gst = commission * 0.18;
    const totalPayable = providerPrice + commission + gst;

    setCheckoutDesc(desc || "Invoice Payment");
    setCheckoutDetails({
      providerPrice,
      commissionPercentage,
      commission: Math.round(commission * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
      requestId: requestId || activeChatId
    });
    setShowCheckoutModal(true);
  };

  const initiateRazorpayCheckout = async () => {
    if (!checkoutDetails) return;
    try {
      setShowCheckoutModal(false);
      const res = await api.post('/payment/create-order', {
        providerPrice: checkoutDetails.providerPrice,
        requestId: checkoutDetails.requestId || activeChatId || null
      });
      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: order.currency,
        name: "OrigiNode Industrial Services",
        description: checkoutDesc,
        order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of create-order.
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.success) {
              const successText = `✓ Payment of ₹${checkoutDetails.totalPayable} processed successfully. Ref: ${response.razorpay_payment_id}`;

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
              setShowPaymentSuccess(true);
              setCompletedJobId(activeChatId);

              // [NEW] Optimistic Service Ledger Update
              setTransactionHistory(prev => [{
                id: response.razorpay_payment_id || Date.now(),
                date: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
                client: "Online Payment",
                service: checkoutDesc,
                status: "Cleared",
                amount: `₹${checkoutDetails.totalPayable}`
              }, ...prev]);

              setEarningsStats(prev => ({
                ...prev,
                totalRevenue: Number(prev.totalRevenue || 0) + Number(checkoutDetails.totalPayable),
                totalSpent: Number(prev.totalSpent || 0) + Number(checkoutDetails.totalPayable)
              }));

            } else {
              setErrors({ server: 'Payment Verification Failed!' });
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            setErrors({ server: 'Payment Verification Error. Please check dashboard.' });
          }
        },
        prefill: {
          name: firstName || "Customer",
          email: email || "customer@example.com",
          contact: phone || "9000090000"
        },
        theme: {
          color: "#3399cc"
        }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setErrors({ server: "Payment Failed" });
        console.warn(response.error);
      });
      rzp1.open();
    } catch (err) {
      console.error('Payment intent failed', err);
      setErrors({ server: 'Could not initialize payment gateway.' });
    }
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

      const { user, token } = res.data;
      if (user) {
        if (socket) socket.emit('identify', user.id || user.user_id);
        if (token) localStorage.setItem('token', token);
        setView('dashboard');
        setRole(user.role || 'consumer');
        localStorage.setItem('user', JSON.stringify(user));
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
      {showCheckoutModal && checkoutDetails && (
        <div className="modal-overlay">
          <div className="confirm-modal checkout-modal animate-fade-in-up">
            <div className="checkout-header">
              <div className="icon-wrap">💳</div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Secure Checkout</h3>
              <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Review your service transaction</p>
            </div>
            <div className="checkout-body">
              <div className="checkout-summary-item">
                <span style={{ color: '#64748b' }}>Service Price</span>
                <strong style={{ color: 'var(--navy-dark)' }}>₹{checkoutDetails.providerPrice}</strong>
              </div>
              <div className="checkout-summary-item">
                <span style={{ color: '#64748b' }}>Platform Service Fee ({checkoutDetails.commissionPercentage}%)</span>
                <strong style={{ color: 'var(--navy-dark)' }}>₹{checkoutDetails.commission}</strong>
              </div>
              <div className="checkout-summary-item">
                <span style={{ color: '#64748b' }}>Tax (GST 18%)</span>
                <strong style={{ color: 'var(--navy-dark)' }}>₹{checkoutDetails.gst}</strong>
              </div>

              <div className="checkout-summary-item total">
                <span>Total Amount Due</span>
                <span style={{ color: 'var(--navy-primary)' }}>₹{checkoutDetails.totalPayable}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '30px' }}>
                <button className="btn btn-outline-dark" style={{ padding: '12px' }} onClick={() => setShowCheckoutModal(false)}>Keep Chatting</button>
                <button className="btn btn-primary" style={{ padding: '12px', background: 'var(--sage-green)', color: 'white' }} onClick={initiateRazorpayCheckout}>Confirm & Pay</button>
              </div>

              <div className="secure-badge">
                <span style={{ fontSize: '1.2rem' }}>🔒</span>
                SSL SECURE & ENCRYPTED PAYMENTS
              </div>
            </div>
          </div>
        </div>
      )}
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


    // --- VIEW 3: UNIFIED MODERN DASHBOARD ---
  if (view === 'dashboard') {
    const renderContent = () => {
      if (role === 'consumer') {
        switch (activeTab) {
          case 'fleet':
            return (
              <FleetView
                machines={machines}
                notifications={notifications}
                earningsStats={earningsStats}
                chartData={chartData}
                avgContinuity={avgContinuity}
                setShowAddMachineModal={setShowAddMachineModal}
                onDecommission={handleDeleteMachine}
              />
            );
          case 'messages':
            return (
              <MessagesView
                chats={chats}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                chatHistory={messages}
                onSendMessage={handleSendMessage}
                currentUser={{ id: 'user', name: firstName }}
              />
            );
          case 'history':
            return (
              <HistoryView
                serviceHistory={transactionHistory}
                onDownloadReport={handleDownloadReport}
                onViewReport={(item) => { setSelectedReport(item); setShowReportModal(true); }}
              />
            );
          case 'legacy':
            return (
              <LegacySearchView
                results={legacyResults}
                onSearch={handleLegacySearch}
                onRequestSpecs={handleRequestSpecs}
              />
            );
          case 'profile':
            return (
              <ProfileView
                user={{ firstName, lastName, extraInfo, phone, taxId, userPhoto }}
                isEditing={isEditingProfile}
                setIsEditing={setIsEditingProfile}
                onSave={handleSaveConsumerProfile}
                onPhotoUpload={handlePhotoUpload}
                onStartCamera={startCamera}
                onDeleteIdentity={() => setShowDeleteModal(true)}
              />
            );
          case 'help':
            return <SupportView onSubmitTicket={handleSubmitSupportTicket} />;
          case 'settings':
            return (
              <SettingsView
                is2FA={isTwoFactorEnabled}
                set2FA={setIsTwoFactorEnabled}
                visibility={profileVisibility}
                setVisibility={setProfileVisibility}
                onDeleteAccount={() => setShowDeleteModal(true)}
              />
            );
          default:
            return <FleetView machines={machines} notifications={notifications} earningsStats={earningsStats} chartData={chartData} avgContinuity={avgContinuity} setShowAddMachineModal={setShowAddMachineModal} onDecommission={handleDeleteMachine} />;
        }
      } else {
        // Producer views
        switch (activeTab) {
          case 'requests':
            return (
              <ProducerDashboard
                stats={producerDashStats}
                radarJobs={radarJobs}
                user={{ firstName, lastName, photo: userPhoto, id: profileData.id }}
                onAcceptJob={handleAcceptJob}
                onViewDetails={() => {}}
              />
            );
          case 'pro-messages':
            return (
                <MessagesView
                  chats={producerChats}
                  activeChatId={activeChatId}
                  setActiveChatId={setActiveChatId}
                  chatHistory={messages}
                  onSendMessage={handleSendMessage}
                  currentUser={{ id: 'expert', name: firstName }}
                />
              );
          case 'earnings':
          case 'history':
            return (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue (INR)</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">₹{producerDashStats.earnings.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jobs Completed</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">{producerDashStats.completedJobs}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expert Rating</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">{producerDashStats.rating.toFixed(1)}/5.0</h3>
                  </div>
                </div>
                <HistoryView serviceHistory={transactionHistory} onDownloadReport={handleDownloadReport} onViewReport={(item) => { setSelectedReport(item); setShowReportModal(true); }} />
              </div>
            );
          case 'profile':
              return (
                <ProfileView
                  user={{ 
                    firstName: profileData.name ? profileData.name.split(' ')[0] : firstName, 
                    lastName: profileData.name ? (profileData.name.split(' ')[1] || '') : lastName, 
                    extraInfo: profileData.role, 
                    phone: profileData.phone, 
                    taxId: profileData.id, 
                    userPhoto: userPhoto 
                  }}
                  isEditing={isEditingProfile}
                  setIsEditing={setIsEditingProfile}
                  onSave={handleSaveConsumerProfile}
                  onPhotoUpload={handlePhotoUpload}
                  onStartCamera={startCamera}
                  onDeleteIdentity={() => setShowDeleteModal(true)}
                  isProducer={true}
                />
              );
          case 'help':
          case 'support':
              return <SupportView onSubmitTicket={handleSubmitSupportTicket} />;
          case 'platform-settings':
          case 'settings':
              return (
                <SettingsView
                  is2FA={isTwoFactorEnabled}
                  set2FA={setIsTwoFactorEnabled}
                  visibility={profileVisibility}
                  setVisibility={setProfileVisibility}
                  onDeleteAccount={() => setShowDeleteModal(true)}
                />
              );
          default:
            return <ProducerDashboard stats={producerDashStats} radarJobs={radarJobs} user={{ firstName, lastName, photo: userPhoto, id: profileData.id }} onAcceptJob={handleAcceptJob} />;
        }
      }
    };

    return (
      <DashboardLayout
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={{ firstName, lastName, photo: userPhoto, email }}
        notifications={notifications}
        onLogout={handleLogout}
        onClearNotifs={handleClearNotifs}
      >
        <div className="animate-fade-in">
          {renderContent()}
        </div>
        {sharedModals}
      </DashboardLayout>
    );
  }

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

