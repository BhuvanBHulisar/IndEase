import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
// Helper component for reports
function ReportField({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

// Simple popup modal for feedback
function PopupModal({ title = 'Support Ticket Submitted', message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="premium-modal animate-fade-in" style={{ maxWidth: '400px' }}>
        <div className="p-10 text-center space-y-6">
           <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10 text-[var(--success)]" strokeWidth={3} />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{message}</p>
           </div>
           <button 
              className="main-action-btn h-12 rounded-xl text-[10px]" 
              onClick={onClose}
           >
              Acknowledge
           </button>
        </div>
      </div>
    </div>
  );
}
import { GoogleLogin } from '@react-oauth/google';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin as LocationIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  ShieldCheck as VerifiedIcon,
  ClipboardList as AssignmentIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as CancelIcon,
  X,
  Info as InfoIcon,
  Download as DownloadIcon,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Settings,
  Cpu,
  Fingerprint,
  HardDrive,
  Trash2,
  AlertCircle,
  Menu,
  CheckCircle,
  CircleDot,
  Layout,
  Command,
  ArrowRight,
  Sparkles,
  BarChart3,
  Network,
  Play,
  FileText,
  CreditCard,
  Lock,
  UserPlus,
  Video,
  Search,
  MessageSquare,
  ClipboardCheck,
  FileText as FileTextIcon
} from 'lucide-react';

// Modern SaaS Dashboard Components
import DashboardLayout from './layouts/DashboardLayout';
import FleetView from './components/FleetView';
import MessagesView from './components/MessagesView';
import HistoryView from './components/HistoryView';
import LegacySearchView from './components/LegacySearchView';
import ProfileView from './components/ProfileView';
import { SupportView, SettingsView } from './components/SupportSettingsView';
import ProducerDashboard from './components/ProducerDashboard';

import api from './services/api';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.98]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToAuth = (targetRole, targetIsLogin) => {
    if (targetRole) setRole(targetRole);
    if (targetIsLogin !== undefined) setIsLogin(targetIsLogin);
    setView('auth');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
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
    // [FIX] Robust guard: Only fetch if authenticated and in dashboard view
    const token = localStorage.getItem('token');
    if (activeChatId && view === 'dashboard' && token) {
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
        })
        .catch(err => {
          console.warn("Failed to load chat history (DB Offline?), keeping demo chat.", err);
        });

      // Join the socket room for this job
      if (socket) {
        socket.emit('join_job', activeChatId);
      }
    }
  }, [activeChatId, socket, view]);

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

  // --- SHARED UI COMPONENTS (MODALS) ---
  const sharedModals = (
    <>
      {showCheckoutModal && checkoutDetails && (
        <div className="modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header-premium border-b border-slate-50">
               <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                  <CreditCard size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Secure Checkout</h3>
               <p className="text-slate-400 font-medium text-xs mt-2 uppercase tracking-widest">Protocol Version 4.02 // Encrypted</p>
               <button className="modal-close-btn" onClick={() => setShowCheckoutModal(false)}>
                  <X size={18} />
               </button>
            </div>
            
            <div className="modal-body-premium pt-10 space-y-8">
               <div className="space-y-4">
                  {[
                    { label: "Dispatch Value", value: `₹${checkoutDetails.providerPrice}` },
                    { label: "Network Service Fee", value: `₹${checkoutDetails.commission}` },
                    { label: "Government Levy (GST)", value: `₹${checkoutDetails.gst}` }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                       <strong className="text-sm font-black text-slate-900">{item.value}</strong>
                    </div>
                  ))}
               </div>

               <div className="p-8 bg-slate-50 rounded-[1.5rem] flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Settle</span>
                  <span className="text-2xl font-black text-[var(--primary)]">₹{checkoutDetails.totalPayable}</span>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4">
                  <button className="secondary-action-btn h-14 rounded-2xl" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
                  <button className="main-action-btn h-14 rounded-2xl bg-[var(--primary)]" onClick={initiateRazorpayCheckout}>Execute Pay</button>
               </div>

               <div className="flex items-center justify-center gap-3 py-4 opacity-40">
                  <Lock size={12} strokeWidth={3} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Z-Trust Secure Sockets Established</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {showAddMachineModal && (
        <div className="modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header-premium">
               <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <HardDrive size={24} strokeWidth={2.5} className="text-[var(--primary)]" />
               </div>
               <h3 className="modal-title">Register Node</h3>
               <p className="text-slate-400 font-medium text-xs mt-2 uppercase tracking-widest">Initialize New Industrial Asset</p>
               <button className="modal-close-btn" onClick={() => setShowAddMachineModal(false)}>
                  <X size={18} />
               </button>
            </div>
            
            <div className="modal-body-premium space-y-8">
               <div className="input-field-modern mb-0">
                  <label>Machine Identifier</label>
                  <input 
                    type="text" placeholder="e.g. Hydraulic Press #99"
                    value={newMachineData.name}
                    onChange={(e) => setNewMachineData({ ...newMachineData, name: e.target.value })}
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="input-field-modern mb-0">
                    <label>Module Category</label>
                    <select 
                      className="w-full h-[52px] px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[var(--primary)] outline-none transition-all appearance-none"
                      value={newMachineData.machine_type}
                      onChange={(e) => setNewMachineData({ ...newMachineData, machine_type: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Hydraulic Press">Hydraulic Press</option>
                      <option value="CNC Concentric">CNC Concentric</option>
                      <option value="Industrial Loom">Industrial Loom</option>
                      <option value="Generator">Generator</option>
                    </select>
                  </div>
                  <div className="input-field-modern mb-0">
                    <label>Epoch / Year</label>
                    <input 
                      type="number" placeholder="2024"
                      value={newMachineData.model_year}
                      onChange={(e) => setNewMachineData({ ...newMachineData, model_year: e.target.value })}
                    />
                  </div>
               </div>

               <div className="input-field-modern mb-0">
                  <label>OEM Source</label>
                  <input 
                    type="text" placeholder="e.g. Hydra-Tech Germany"
                    value={newMachineData.oem}
                    onChange={(e) => setNewMachineData({ ...newMachineData, oem: e.target.value })}
                  />
               </div>

               <button className="main-action-btn h-14 rounded-2xl mt-4" onClick={handleAddMachine}>Activate Node</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '440px' }}>
            <div className="p-12 text-center space-y-8">
               <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm">
                  <Trash2 className="w-10 h-10 text-[var(--danger)]" strokeWidth={2.5} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-red-950 tracking-tight">Identity Purge</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    This will permanently wipe all machine nodes and historical records associated with <strong>{email}</strong>.
                  </p>
               </div>
               <div className="space-y-4">
                  <button className="main-action-btn h-14 rounded-2xl bg-[var(--danger)] text-white" onClick={() => { setView('landing'); setShowDeleteModal(false); }}>Yes, Execute Purge</button>
                  <button className="secondary-action-btn h-14 border-none text-slate-400" onClick={() => setShowDeleteModal(false)}>Cancel Protocol</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {nodeToDelete && (
        <div className="modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '440px' }}>
            <div className="p-12 text-center space-y-8">
               <div className="w-20 h-20 bg-[var(--warning)] border border-amber-100 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle className="w-10 h-10 text-[var(--warning)]" strokeWidth={2.5} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Decommission</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    Are you sure you want to remove <strong>{nodeToDelete.name}</strong> from your active fleet?
                  </p>
               </div>
               <div className="space-y-4">
                  <button className="main-action-btn h-14 rounded-2xl bg-slate-900" onClick={confirmNodeDeletion}>Confirm Removal</button>
                  <button className="secondary-action-btn h-14 border-none text-slate-400" onClick={() => setNodeToDelete(null)}>Abor Protocol</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {showDiagnosisModal && (
        <div className="modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header-premium">
               <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-8">
                  <Cpu size={24} className="text-[var(--primary)]" strokeWidth={2.5} />
               </div>
               <h3 className="modal-title">Smart Signal Analysis</h3>
               <p className="text-slate-400 font-medium text-xs mt-2 uppercase tracking-widest">AI Hub Diagnosis // Local Mesh</p>
               <button className="modal-close-btn" onClick={() => { setShowDiagnosisModal(false); setDiagnosisStep(1); }}>
                  <X size={18} />
               </button>
            </div>
            
            <div className="modal-body-premium space-y-10">
               {diagnosisStep === 1 && (
                 <div className="animate-fade-in space-y-8">
                    <div 
                      className="h-48 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--primary)] hover:bg-[var(--accent-soft)] transition-all cursor-pointer overflow-hidden relative"
                      onClick={() => document.getElementById('video-input').click()}
                    >
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play size={20} className="text-[var(--primary)] ml-1" />
                       </div>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">
                          {videoFile ? videoFile.name : "Upload Anomaly Stream"}
                       </p>
                       <input type="file" id="video-input" hidden accept="video/*" onChange={handleVideoSelect} />
                    </div>

                    <div className="input-field-modern mb-0">
                       <label>Anomaly Context</label>
                       <textarea 
                         rows="3"
                         placeholder="Describe the noise, visual fault, or signal variance..."
                         className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:bg-white focus:border-[var(--primary)] outline-none transition-all resize-none"
                         value={diagnosisDesc}
                         onChange={(e) => setDiagnosisDesc(e.target.value)}
                       />
                    </div>
                    <button className="main-action-btn h-14 rounded-2xl" onClick={handleBroadcastJob}>Broadcast Dispatch</button>
                 </div>
               )}
               
               {diagnosisStep === 2 && (
                 <div className="py-20 flex flex-col items-center justify-center space-y-10 animate-fade-in">
                    <div className="relative">
                       <div className="w-24 h-24 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Globe size={24} className="text-[var(--primary)] animate-pulse" />
                       </div>
                    </div>
                    <div className="text-center space-y-3">
                       <h4 className="text-2xl font-black text-slate-900 tracking-tight">Broadcasting Signal</h4>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning local expert nodes...</p>
                    </div>
                 </div>
               )}

               {diagnosisStep === 3 && (
                 <div className="text-center py-10 space-y-10 animate-fade-in">
                    <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                       <CheckCircle className="w-10 h-10 text-[var(--success)]" strokeWidth={3} />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-3xl font-black text-slate-900 tracking-tight">Signal Latched</h4>
                       <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                          Your request for <strong>{activeJobMachine?.name}</strong> is now live on the industrial radar.
                       </p>
                    </div>
                    <button className="main-action-btn h-14 rounded-2xl bg-[var(--success)]" onClick={() => setShowDiagnosisModal(false)}>Return to Console</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div className="modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header-premium bg-slate-50">
               <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                     <FileText size={28} className="text-slate-900" strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Serial</p>
                     <p className="text-xl font-black text-slate-900 tracking-tighter">INV-{2020 + selectedReport.id}</p>
                  </div>
               </div>
               <h3 className="modal-title">Service Maintenance Log</h3>
               <button className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                  <X size={18} />
               </button>
            </div>
            
            <div className="modal-body-premium pt-12 space-y-12">
               <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <ReportField label="Service Date" value={selectedReport.date} />
                  <ReportField label="Node Identifier" value={selectedReport.machine} />
                  <ReportField label="Verified Expert" value={selectedReport.expert} />
                  <ReportField label="Settled Amount" value={selectedReport.cost} />
               </div>

               <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance Narrative</p>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed italic">
                     "{selectedReport.action}. System diagnostics were run post-service to ensure compliance with operational safety standards."
                  </p>
               </div>

               <div className="flex items-center gap-4">
                  <button className="main-action-btn flex-1" onClick={handleDownloadReport}>Download Artifact</button>
                  <button className="secondary-action-btn flex-1" onClick={() => alert("Digital copy dispatched to " + email)}>Email Ledger</button>
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

  // --- VIEW 1: PROFESSIONAL LANDING PAGE ---
  if (view === 'landing') {
    return (
      <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
        {/* Navigation */}
        <nav className={`nav-sticky ${scrolled ? 'scrolled' : ''}`}>
          <div className="logo-container" onClick={() => setView('landing')}>
            <div className="logo-text">origiNode</div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="snap-section">
          <header className="hero-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ scale: heroScale }}
          >
            <h1 className="hero-title">Connecting machine owners with manufacturers and expert technicians.</h1>
            <p className="hero-desc">
              Small and medium-scale industries often rely on older machines that become difficult to repair when manufacturers stop supporting them. 
              origiNode connects industries with experts who understand their machinery.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button 
                whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-10 py-4 text-base" 
                onClick={() => {
                  const el = document.getElementById('platform-access');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </header>
        </section>

        {/* Problem and Solution Section */}
        <section className="snap-section bg-white">
          <div className="content-section" style={{ maxWidth: '1200px' }}>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Problem Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                className="minimal-saas-card"
              >
                <div className="icon-container w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-6">
                  <AlertCircle size={20} />
                </div>
                <span className="saas-label text-red-600">The Problem</span>
                <h3 className="saas-heading">High Maintenance Costs & Downtime</h3>
                <p className="saas-description">
                  Small-scale industries often rely on specialized machinery that lacks modern support networks. 
                  When these legacy systems fail, finding the right expertise becomes an expensive hurdle that halts production.
                </p>
              </motion.div>

              {/* Our Solution Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
                className="minimal-saas-card"
              >
                <div className="icon-container w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Zap size={20} />
                </div>
                <span className="saas-label text-blue-600">Our Solution</span>
                <h3 className="saas-heading">A Direct Line to Industrial Expertise</h3>
                <p className="saas-description">
                  origiNode bridges the gap between factory operators and master technicians. 
                  We provide a unified platform for rapid diagnosis, verified repairs, and machine lifecycle management.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How the Platform Works */}
        <section className="snap-section">
          <section className="content-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="section-title">How the Platform Works</h2>
          </motion.div>
          <div className="compact-grid">
            {[
              { id: 1, title: "Register", icon: <UserPlus size={24}/>, desc: "Create an account as machine owner or service expert." },
              { id: 2, title: "Report Issue", icon: <Video size={24}/>, desc: "Upload machine video and describe the fault." },
              { id: 3, title: "Find Experts", icon: <Search size={24}/>, desc: "The platform identifies suitable manufacturers or technicians." },
              { id: 4, title: "Repair & Payment", icon: <CreditCard size={24}/>, desc: "Experts resolve the issue and payment is completed securely." }
            ].map((step, idx) => (
              <motion.div 
                key={step.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }} 
                className="step-box group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="card-title mb-0">{step.title}</h3>
                </div>
                <p className="card-text">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        </section>

        {/* Platform Access */}
        <section id="platform-access" className="snap-section-last bg-slate-50">
          <section className="content-section !py-0">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="platform-card"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-8">
                <Cpu size={28} />
              </div>
              <h3 className="card-title">Fleet Operator</h3>
              <p className="card-text mb-8">Register industrial assets, track maintenance cycles, and connect with verified service experts.</p>
              <div className="flex flex-col gap-3">
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full" onClick={() => navigateToAuth('consumer', true)}>Login</motion.button>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-secondary w-full" onClick={() => navigateToAuth('consumer', false)}>Sign Up</motion.button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="platform-card"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-8">
                <Shield size={28} />
              </div>
              <h3 className="card-title">Service Expert</h3>
              <p className="card-text mb-8">Manage service requests, dispatch technicians, and provide repair services.</p>
              <div className="flex flex-col gap-3">
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full bg-indigo-600" onClick={() => navigateToAuth('producer', true)}>Login</motion.button>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-secondary w-full" onClick={() => navigateToAuth('producer', false)}>Sign Up</motion.button>
              </div>
            </motion.div>
          </div>
        </section>
        </section>

        {/* Footer */}
        <footer className="footer-simple">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="logo-container mx-auto justify-center mb-4" onClick={() => {
              setView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>
              <div className="logo-text text-xl">origiNode</div>
            </div>
            <p className="text-sm font-bold text-slate-900">Industrial Intelligence Platform</p>
            <p className="text-xs text-slate-400">© 2026 origiNode. All rights reserved.</p>
          </div>
        </footer>
        {sharedModals}
      </div>
    );
  }

  // VIEW 2: PROFESSIONAL AUTHENTICATION PORTAL
  if (view === 'auth' || view === 'forgot') {
    return (
      <div className="auth-page-view">
         <div className="landing-grid-bg" />
         <div className="login-page-wrapper">
           <button className="back-btn-top" onClick={() => setView('landing')}>
             <ArrowRight size={14} className="rotate-180" />
             Back to Main
           </button>
           <div className="glass-container">
             <div className="login-visual">
               <div className="visual-noise" />
               <div className="p-16 text-white relative z-10 space-y-10 mt-auto">
                 <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em]">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                   Secure Protocol v4.02
                 </div>

                 <div>
                    <h3 className="text-5xl font-black tracking-tight mb-6 leading-none">
                      {view === 'forgot' ? 'Security Recovery' : (role === 'consumer' ? 'Fleet Operations' : 'Service Terminal')}
                    </h3>
                    <p className="text-white/60 font-medium max-w-sm leading-relaxed text-sm">
                      {view === 'forgot'
                        ? 'Restore your administrative access to the origiNode network.'
                        : (role === 'consumer'
                          ? 'Manage industrial assets with 21st-century precision and expert support.'
                          : 'Connect with a global network for industrial diagnostics and professional service requests.')}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10">
                    <div className="space-y-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Verified Nodes</span>
                       <p className="text-3xl font-black tabular-nums">1.2K+</p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Active Experts</span>
                       <p className="text-3xl font-black tabular-nums">8.4K</p>
                    </div>
                 </div>
               </div>
             </div>

             <div className="login-form-area">
               <div className="mb-12">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                    {view === 'forgot'
                      ? 'Reset Password'
                      : isLogin ? `${role === 'consumer' ? 'Operator' : 'Provider'} Portal` : `Identity Setup`}
                  </h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                     Industrial Authentication Required
                  </p>
               </div>

               {isLogin ? (
                 <div className="space-y-0">
                   <div className="input-field-modern">
                     <label>Professional Email Address</label>
                     <input
                       type="email"
                       placeholder="e.g. name@industrial.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                     />
                   </div>

                   {view !== 'forgot' && (
                     <div className="input-field-modern">
                       <div className="flex justify-between items-center mb-2">
                         <label className="m-0">Security Credential</label>
                         <span 
                           className="text-[10px] font-black text-[var(--primary)] uppercase cursor-pointer hover:underline tracking-widest" 
                           onClick={() => { setView('forgot'); setErrors({}); }}
                         >
                           Recover?
                         </span>
                       </div>
                       <input
                         type={showPassword ? "text" : "password"}
                         placeholder="••••••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                       />
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="space-y-0">
                    {signupStep === 1 ? (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="input-field-modern">
                             <label>Given Name</label>
                             <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                           </div>
                           <div className="input-field-modern">
                             <label>Family Name</label>
                             <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                           </div>
                        </div>
                        <div className="input-field-modern">
                          <label>Institutional Email</label>
                          <input type="email" placeholder="name@corporation.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="input-field-modern">
                          <label>Create Secure Password</label>
                          <input type="password" placeholder="Select a strong credential" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                      </>
                    ) : (
                      <div className="input-field-modern">
                         <label>{role === 'consumer' ? 'Enterprise Identity' : 'Technical Discipline'}</label>
                         <input 
                           type="text" 
                           placeholder={role === 'consumer' ? "e.g. Acme Industrial Systems" : "e.g. Precision CNC Maintenance"} 
                           onChange={(e) => setExtraInfo(e.target.value)} 
                         />
                      </div>
                    )}
                 </div>
               )}

               {errors.server && <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black my-6 uppercase tracking-widest leading-relaxed shadow-sm">{errors.server}</div>}

               <button className="main-action-btn h-16 rounded-2xl" onClick={handleLogin}>
                 {view === 'forgot' ? 'Dispatch Reset Token' : isLogin ? 'Authenticate Identity' : (signupStep === 1 ? 'Verify Protocol' : 'Finalize Identity')}
               </button>

               <div className="mt-10 space-y-8">
                 <div className="relative">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300"><span className="bg-white px-4">Mesh Link</span></div>
                 </div>
                 
                 <div className="flex justify-center">
                   <GoogleLogin
                     onSuccess={handleGoogleSuccess}
                     onError={handleGoogleError}
                     theme="outline"
                     shape="pill"
                     width="100%"
                   />
                 </div>
               </div>

               <p className="mt-12 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 {isLogin ? "Need a professional account?" : "Existing operative?"}
                 <button 
                   onClick={() => { setIsLogin(!isLogin); setSignupStep(1); setErrors({}); }} 
                   className="ml-2 text-[var(--primary)] font-black hover:underline"
                 >
                   {isLogin ? "Join System" : "Log In"}
                 </button>
               </p>
             </div>
           </div>
         </div>
          {sharedModals}
      </div>
    );
  }


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
      {sharedModals}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

// --- FALLBACK RENDER (SHOULD NOT BE REACHED IF VIEW IS LANDING OR DASHBOARD) ---
return null;
}


export default App;

