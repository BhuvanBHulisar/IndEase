import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './producer-styles.css';
import './signup.css';

function App() {
  // --- CORE APPLICATION STATES ---
  const [view, setView] = useState('landing');
  const [role, setRole] = useState('consumer'); // State to track Machine Owner vs Repair Expert
  const [isLogin, setIsLogin] = useState(true);
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
  const [firstName, setFirstName] = useState('Bhuvan');
  const [lastName, setLastName] = useState('B H');
  const [phone, setPhone] = useState('+91 98765 24210'); // Added Phone Number
  const [confirmPassword, setConfirmPassword] = useState(''); // Added Confirm Password
  const [dob, setDob] = useState('2000-01-17');
  const [otp, setOtp] = useState('');
  const [extraInfo, setExtraInfo] = useState('Doe Industrial Manufacturing Ltd.'); // Company for Consumer, Skill for Producer

  // [NEW IDENTITY & PHOTO STATES]
  const [userPhoto, setUserPhoto] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [language, setLanguage] = useState('English');

  // [NEW NOTIFICATION STATE]
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', msg: 'Hydraulic Press #08: Pressure Drop Detected', time: '10 mins ago', read: false },
    { id: 2, type: 'info', msg: 'Service Ledger Updated: Motor Drive #A1', time: '2 hours ago', read: true },
    { id: 3, type: 'success', msg: 'New Expert Verified: XP-992 (Hydraulics)', time: '5 hours ago', read: true }
  ]);

  // [NEW OTP RESEND TIMER STATES]
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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
    id: "IND-88219"
  });

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('Public');
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // [NEW] VIDEO DIAGNOSIS STATES
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState(1); // 1: Upload, 2: Scanning, 3: Results
  const [videoFile, setVideoFile] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [diagnosisResults, setDiagnosisResults] = useState([]);



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
  const [messages, setMessages] = useState([
    { id: 1, chatId: 1, sender: 'expert', text: "Hello Bhuvan! We reviewed your video. The knocking sound is definitely the main piston valve.", time: "10:30 AM" },
    { id: 2, chatId: 1, sender: 'user', text: "That makes sense. It started after the last power surge.", time: "10:32 AM" },
    { id: 3, chatId: 1, sender: 'expert', text: "We have the replacement part in stock. Here is the invoice for the part and service.", time: "10:35 AM" },
    { id: 4, chatId: 1, sender: 'expert', type: 'invoice', amount: '₹45000.00', desc: 'Valve Replacement Service', time: "10:35 AM" }
  ]);

  // [NEW] PROFILE DASHBOARD DATA
  const trustScore = isVerified ? 98 : 45;
  const totalNodes = 24;

  // --- TRANSLATIONS DICTIONARY ---
  const translations = {
    Kannada: {
      identity: "ಕೈಗಾರಿಕಾ ಗುರುತು",
      fleet: "ಯಂತ್ರಗಳ ಸಮೂಹ",
      logout: "ಹೊರಹೋಗಿ",
      name: "ಹೆಸರು",
      phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      purge: "ಗುರುತನ್ನು ಅಳಿಸಿ",
      settings: "ವೇದಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      notif_history: "ಅಧಿಸೂಚನೆ ಇತಿಹಾಸ"
    },
    English: {
      identity: "Industrial Identity",
      fleet: "Fleet Overview",
      logout: "Logout System",
      name: "Display Name",
      phone: "Mobile Number",
      purge: "Purge Identity",
      settings: "Platform Settings",
      notif_history: "Notification History"
    },
    Hindi: {
      identity: "औद्योगिक पहचान",
      fleet: "फ्लीट अवलोकन",
      logout: "लॉगआउट",
      name: "नाम",
      phone: "मोबाइल नंबर",
      purge: "पहचान मिटाएं",
      settings: "प्लेटफार्म सेटिंग्स",
      notif_history: "अधिसूचना इतिहास"
    }
  };

  const t = translations[language];
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

  // OTP Timer Logic
  useEffect(() => {
    let interval;
    if (signupStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, signupStep]);

  // [NEW] GLOBAL DARK MODE EFFECT
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);


  const handleResendOTP = () => {
    if (canResend) {
      console.log(`Resending OTP to +91 ${phone}...`);
      setTimer(30);
      setCanResend(false);
      alert(`A new code has been sent to +91 ${phone}`);
    }
  };

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

  const handleDocVerify = (e) => {
    if (e.target.files[0]) {
      alert("Document uploaded. Verifying industrial identity...");
      setTimeout(() => setIsVerified(true), 2000);
    }
  };

  // [NEW] VIDEO DIAGNOSIS HANDLERS
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

  const handleLegacySearch = () => {
    const results = legacyDatabase.filter(item =>
      item.name.toLowerCase().includes(legacyQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(legacyQuery.toLowerCase())
    );
    setLegacyResults(results);
  };

  // [NEW] CHAT HANDLERS
  // [NEW] CHAT HANDLERS - UPDATED FOR DUAL ROLE
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const msg = {
        id: messages.length + 1,
        chatId: activeChatId,
        sender: role === 'consumer' ? 'user' : 'expert',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');

      // Auto-reply logic (Disabled for Chat ID 1 to allow manual demo)
      if (activeChatId !== 1) {
        setTimeout(() => {
          const reply = {
            id: messages.length + 2,
            chatId: activeChatId,
            sender: role === 'consumer' ? 'expert' : 'user',
            text: "This is an automated response. Our team will get back to you shortly.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, reply]);
        }, 2000);
      }
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
  const filteredHistory = historyData.filter(item =>
    item.machine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // [NEW] PAYMENT LOGIC
  // [NEW] RAZORPAY INTEGRATION
  const handlePayment = (amountStr, desc) => {
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ""), 10); // Extract number from string (e.g., ₹450 -> 450)
    const razorpayKey = "rzp_test_DUMMY_KEY"; // Replace with your actual Razorpay Key ID

    const handleSuccess = (paymentId) => {
      // 1. Add to Service History
      const newRecord = {
        id: historyData.length + 1,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        machine: "Hydraulic Press #08",
        expert: "Berlin Industrial Corp",
        action: desc,
        cost: amountStr,
        status: 'verified'
      };
      setHistoryData(prev => [newRecord, ...prev]);

      // 2. Add confirmation to chat
      const successMsg = {
        id: messages.length + 1,
        chatId: activeChatId,
        sender: 'system',
        text: `✓ Payment of ${amountStr} processed successfully. Order ID: ${paymentId}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, successMsg]);

      alert(`Payment Successful! Payment ID: ${paymentId}`);
    };

    // SIMULATION MODE CHECK
    if (razorpayKey === "rzp_test_DUMMY_KEY") {
      // If no valid key is provided, simulate the payment flow
      if (window.confirm(`[DEMO MODE] Confirm simulated payment of ${amountStr}?`)) {
        setTimeout(() => {
          handleSuccess(`pay_simulated_${Date.now()}`);
        }, 1500);
      }
      return;
    }

    const options = {
      key: razorpayKey,
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "OrigiNode Industrial",
      description: desc,
      image: "https://via.placeholder.com/150",
      handler: function (response) {
        handleSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: `${firstName} ${lastName}`,
        email: email,
        contact: phone
      },
      theme: {
        color: "#1E5A99"
      }
    };

    if (window.Razorpay) {
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();
    } else {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
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

  const handleLogin = () => {
    if (isLogin) {
      const isDemoAccount = email === 'admin@originode.com' && password === 'Demo@1234';
      if (isDemoAccount) {
        setView('dashboard');
        setErrors({});
      } else if (validate()) {
        setView('dashboard');
      }
    } else {
      if (signupStep === 1 && validate()) {
        setTimer(30);
        setCanResend(false);
        setSignupStep(2);
      } else if (signupStep === 2) {
        if (otp === '1234') {
          setSignupStep(3);
          setErrors({});
        } else {
          setErrors({ otp: "Invalid OTP. Use '1234'." });
        }
      } else if (signupStep === 3) {
        setView('dashboard');
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setView('dashboard');
  };

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

  // [NEW] VIEW 3: CONSUMER DASHBOARD
  if (view === 'dashboard' && role === 'consumer') {
    return (
      <div className="dashboard-wrapper consumer-theme">
        <aside className="side-nav">

          <div className="profile-sidebar-summary" onClick={() => setActiveTab('profile')}>
            {userPhoto ? <img src={userPhoto} className="nav-avatar-img" alt="User" /> : <div className="nav-avatar-circle">{firstName[0]}{lastName[0]}</div>}
            <div className="nav-user-details">
              <span className="nav-name">{firstName} {lastName} {isVerified && "✓"}</span>
              <span className="nav-email-small">{email || 'admin@originode.com'}</span>
            </div>
          </div>

          <nav className="nav-links">
            <div className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>{t.fleet}</div>
            <div className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>Messages {chats.some(c => c.unread > 0) && <span className="nav-badge" style={{ background: 'var(--error-red)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>1</span>}</div>
            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Service History</div>
            <div className={`nav-item ${activeTab === 'legacy' ? 'active' : ''}`} onClick={() => setActiveTab('legacy')}>Legacy Search</div>
            <div className="nav-divider"></div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>{t.identity}</div>
            <div className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>Help & Support</div>
            <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</div>
            <div className="nav-item logout-btn-item" onClick={() => setView('landing')}>{t.logout}</div>
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
                    <span>System Continuity: <strong>98.4%</strong></span>
                  </div>
                  <button className="btn btn-primary">+ Add Machine Node</button>
                </div>
              </header>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-bg info">
                    <span className="icon">🏭</span>
                  </div>
                  <div className="stat-info">
                    <h4>Active Nodes</h4>
                    <p className="stat-value">24</p>
                    <span className="stat-trend positive">↑ 2 New this month</span>
                  </div>
                </div>
                <div className="stat-card critical">
                  <div className="stat-icon-bg alert">
                    <span className="icon">⚠️</span>
                  </div>
                  <div className="stat-info">
                    <h4>Critical Issues</h4>
                    <p className="stat-value">2</p>
                    <span className="stat-trend negative">Attention Required</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-bg success">
                    <span className="icon">👨‍🔧</span>
                  </div>
                  <div className="stat-info">
                    <h4>Experts Online</h4>
                    <p className="stat-value">156</p>
                    <span className="stat-trend neutral">Avg response: 5m</span>
                  </div>
                </div>
              </div>

              <section className="node-gallery">
                <div className="section-header">
                  <h3>My Machines</h3>
                  <div className="filter-tabs">
                    <span className="filter-tab active">All</span>
                    <span className="filter-tab">Operational</span>
                    <span className="filter-tab">Maintenance</span>
                  </div>
                </div>

                <div className="node-grid">
                  <div className="node-card">
                    <div className="node-image-placeholder active">
                      <span className="node-emoji">⚙️</span>
                      <div className="status-overlay operational">Running</div>
                    </div>
                    <div className="node-content">
                      <div className="node-header">
                        <h4>Hydraulic Press #08</h4>
                        <span className="menu-dots">⋮</span>
                      </div>
                      <p className="node-model">Model: HP-200 (Legacy)</p>
                      <div className="node-metrics">
                        <div className="metric">
                          <span className="label">Temp</span>
                          <span className="value">65°C</span>
                        </div>
                        <div className="metric">
                          <span className="label">Uptime</span>
                          <span className="value">99%</span>
                        </div>
                      </div>
                      <button className="btn-small">View Live Telemetry</button>
                    </div>
                  </div>

                  <div className="node-card down">
                    <div className="node-image-placeholder issue">
                      <span className="node-emoji">🧶</span>
                      <div className="status-overlay critical">Stopped</div>
                    </div>
                    <div className="node-content">
                      <div className="node-header">
                        <h4>Industrial Loom #22</h4>
                        <span className="menu-dots">⋮</span>
                      </div>
                      <p className="node-model">Model: TEXT-40 (Original Maker: Unknown)</p>
                      <div className="issue-banner">
                        <span>⚠ Motor Synchronization Error</span>
                      </div>
                      <button className="btn-small btn-alert" onClick={() => setShowDiagnosisModal(true)}>Connect with Expert</button>
                    </div>
                  </div>

                  {/* Added a third card for variety */}
                  <div className="node-card">
                    <div className="node-image-placeholder active">
                      <span className="node-emoji">🔋</span>
                      <div className="status-overlay operational">Running</div>
                    </div>
                    <div className="node-content">
                      <div className="node-header">
                        <h4>Generator Unit A1</h4>
                        <span className="menu-dots">⋮</span>
                      </div>
                      <p className="node-model">Model: GEN-X500</p>
                      <div className="node-metrics">
                        <div className="metric">
                          <span className="label">Output</span>
                          <span className="value">480V</span>
                        </div>
                        <div className="metric">
                          <span className="label">Load</span>
                          <span className="value">82%</span>
                        </div>
                      </div>
                      <button className="btn-small">View Live Telemetry</button>
                    </div>
                  </div>
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
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-dark)' }}>{chats.find(c => c.id === activeChatId)?.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--sage-green)', fontWeight: '600' }}>● Online</span>
                  </div>
                  <button className="btn-icon-label" style={{ fontSize: '0.8rem' }}>View Profile</button>
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
                            <button className="btn-pay-now" onClick={() => handlePayment(msg.amount, msg.desc)}>PAY {msg.amount}</button>
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
              <header className="content-header">
                <h2>Service Ledger <small>Historical Maintenance Records</small></h2>
                <div className="search-bar-container">
                  <input
                    type="text"
                    placeholder="Search by Machine, Expert, or Action..."
                    className="table-search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                    <button className="btn-small">Request Specialist Specs</button>
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
                    {userPhoto ? <img src={userPhoto} className="profile-main-img" alt="Profile" /> : <div className="large-avatar-placeholder">{firstName[0]}{lastName[0]}</div>}
                    <div className="photo-controls">
                      <button className="btn-icon-label" onClick={() => fileInputRef.current.click()}>Upload Photo</button>
                      <button className="btn-icon-label" onClick={startCamera}>Take Selfie</button>
                      {userPhoto && <button className="btn-icon-label btn-remove" onClick={() => setUserPhoto(null)}>Remove</button>}
                      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
                    </div>
                  </div>
                  <div className="profile-header-text">
                    <h2 className="full-user-name">{firstName} {lastName} {isVerified && <span className="verified-badge">✓</span>}</h2>
                    <p className="full-user-org">{extraInfo}</p>
                  </div>
                </div>
              </div>

              <div className="identity-settings-list">
                <div className="setting-row">
                  <div className="setting-info"><h4>{t.name}</h4><p>{firstName} {lastName}</p></div>
                  <button className="btn-text-action">Edit Name</button>
                </div>
                <div className="setting-row">
                  <div className="setting-info"><h4>{t.phone}</h4><p>{phone}</p></div>
                  <button className="btn-text-action">Change Phone</button>
                </div>
                <div className="setting-row">
                  <div className="setting-info"><h4>Date of Birth</h4><p>{dob}</p></div>
                  <button className="btn-text-action">Edit DOB</button>
                </div>

                <div className="document-upload-card">
                  <span className="doc-upload-icon">📄</span>
                  <p className="doc-upload-text">Industrial Verification</p>
                  <p className="doc-upload-hint">Upload factory license or certification to get verified.</p>
                  <button className="btn btn-primary" onClick={() => docInputRef.current.click()}>Choose Document</button>
                  <input type="file" ref={docInputRef} onChange={handleDocVerify} hidden accept=".pdf,image/*" />
                </div>

                <div className="setting-row danger-row">
                  <div className="setting-info"><h4 className="danger-text">{t.purge}</h4><p>Wipe all industrial nodes and historical records.</p></div>
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
                    <select className="std-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option>Machine Diagnosis Error</option>
                      <option>Expert Connection Issue</option>
                      <option>Billing / Invoice Dispute</option>
                      <option>Account Verification</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label className="field-label" style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b' }}>Description</label>
                    <textarea className="std-input" rows="5" placeholder="Please provide details..." style={{ width: '100%', resize: 'none', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                  </div>

                  <button className="btn-primary" onClick={() => alert("Ticket #CONSUMER-102 Created! Support team will contact you shortly.")}>Submit Ticket</button>
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
            </div>
          ) : activeTab === 'settings' ? (
            <div className="settings-view animate-fade">
              {/* Settings Hero */}
              <div className="settings-hero">
                <div className="settings-hero-content">
                  <h1>Control Center</h1>
                  <p>Manage your industrial terminal preferences and security protocols.</p>
                </div>
              </div>

              <div className="settings-grid-enhanced">
                {/* Appearance Card */}
                <div className="setting-card-enhanced">
                  <div className="card-icon-header">
                    <span className="icon-box">🎨</span>
                    <h3>Appearance</h3>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h4>Interface Theme</h4>
                      <p>Toggle between Day and Night command modes.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h4>System Language</h4>
                      <p>Select your preferred dialect.</p>
                    </div>
                    <select className="custom-select-v3" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="English">English</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                {/* Security Card */}
                <div className="setting-card-enhanced">
                  <div className="card-icon-header">
                    <span className="icon-box">🛡️</span>
                    <h3>Security Protocols</h3>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h4>Two-Factor Auth</h4>
                      <p>Enable biological or token-based verification.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={isTwoFactorEnabled} onChange={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h4>Network Visibility</h4>
                      <p>Manage your node broadcast range.</p>
                    </div>
                    <div className="select-wrapper">
                      <select className="custom-select-v3" value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)}>
                        <option value="Public">Public Network</option>
                        <option value="Private">Private Mesh</option>
                        <option value="Partners">Partners Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Data Card (New Placeholder) */}
                <div className="setting-card-enhanced">
                  <div className="card-icon-header">
                    <span className="icon-box">💾</span>
                    <h3>Data Management</h3>
                  </div>
                  <div className="setting-row">
                    <div>
                      <h4>Local Cache</h4>
                      <p>Clear temporary files and diagnosis logs.</p>
                    </div>
                    <button className="btn-small-outline">Clear Data</button>
                  </div>
                  <div className="setting-row">
                    <div style={{ color: 'var(--error-red)' }}>
                      <h4 style={{ color: 'var(--error-red)' }}>Purge Identity</h4>
                      <p>Permanently delete account.</p>
                    </div>
                    <button className="btn-small-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>

        {/* MODALS */}
        {
          showCamera && (
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
          )
        }

        {
          showDeleteModal && (
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
          )
        }

        {/* [NEW] VIDEO DIAGNOSIS MODAL */}
        {
          showDiagnosisModal && (
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
                        {videoFile ? (
                          <div className="upload-text" style={{ color: 'var(--sage-green)' }}>{videoFile.name} Selected</div>
                        ) : (
                          <div className="upload-text">Click to Upload Video</div>
                        )}
                        <p className="upload-hint">MP4, MOV supported (Max 50MB)</p>
                        <input type="file" id="video-input" hidden accept="video/*" onChange={handleVideoSelect} />
                      </div>

                      <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--navy-dark)' }}>Describe the Issue</label>
                        <textarea
                          className="table-search"
                          rows="3"
                          placeholder="e.g. Strange knocking sound coming from the main cylinder..."
                          style={{ width: '100%', resize: 'none' }}
                        ></textarea>
                      </div>

                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={startDiagnosis}>
                        Analyze & Find Experts
                      </button>
                    </div>
                  )}

                  {diagnosisStep === 2 && (
                    <div className="scanning-container animate-fade">
                      <div className="scanner-ring"></div>
                      <h3 style={{ color: 'var(--navy-dark)' }}>Analyzing Fault Signature...</h3>
                      <p style={{ color: '#64748b' }}>Matching audio/visual patterns with legacy database.</p>
                      <div className="progress-bar-bg" style={{ background: '#e2e8f0', height: '6px', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
                        <div className="progress-fill" style={{ width: `${analysisProgress}%`, background: 'var(--navy-primary)', height: '100%', transition: '0.4s' }}></div>
                      </div>
                    </div>
                  )}

                  {diagnosisStep === 3 && (
                    <div className="results-step animate-fade">
                      <h3 style={{ marginBottom: '15px', color: 'var(--navy-dark)' }}>Diagnosis Complete</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>We identified the machine as a <strong>1985 Text-Matic Series</strong>. Based on the fault, here are the best available experts:</p>

                      {diagnosisResults.map(expert => (
                        <div key={expert.id} className="expert-result-card" onClick={() => alert("Chat Feature Comming Soon!")}>
                          <div className="expert-avatar">{expert.avatar}</div>
                          <div className="expert-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <h4>{expert.name}</h4>
                              <span className="match-score">{expert.match}% Match</span>
                            </div>
                            <p>{expert.type}</p>
                          </div>
                          <button className="btn-small" style={{ width: 'auto', marginTop: 0 }}>Connect</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
        {/* [NEW] SERVICE REPORT MODAL */}
        {
          showReportModal && selectedReport && (
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
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>SERVICE DATE</label>
                      <strong style={{ color: 'var(--navy-dark)' }}>{selectedReport.date}</strong>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>MACHINE ID</label>
                      <strong style={{ color: 'var(--navy-dark)' }}>{selectedReport.machine}</strong>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>SERVICE PROVIDER</label>
                      <strong style={{ color: 'var(--navy-dark)' }}>{selectedReport.expert}</strong>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>TOTAL COST</label>
                      <strong style={{ color: 'var(--navy-dark)', fontSize: '1.2rem' }}>{selectedReport.cost}</strong>
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>SERVICE ACTION PERFORMED</label>
                    <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
                      {selectedReport.action}. System diagnostics were run post-service to ensure compliance with operational safety standards.
                    </p>
                  </div>
                  <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline-dark" style={{ flex: 1 }} onClick={handleDownloadReport}>Download Report</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert("Report emailed to " + email)}>Email Report</button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* [NEW] VIDEO PLAYER MODAL */}
        {
          showVideoModal && (
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

        {/* [NEW] EXPERT CALL MODAL */}
        {
          showCallModal && (
            <div className="modal-overlay">
              <div className="diagnosis-modal" style={{ maxWidth: '450px' }}>
                <div className="modal-header-v2">
                  <h3>Schedule Expert Call</h3>
                  <button className="btn-icon-label" onClick={() => setShowCallModal(false)}>Close</button>
                </div>
                <div className="modal-body-v2">
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '3rem' }}>📞</div>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Direct line to a verified industrial specialist.</p>
                  </div>
                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Select Machine</label>
                    <select className="std-input" style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>
                      <option>Hydraulic Press H-200</option>
                      <option>CNC Milling Center</option>
                      <option>Rotary Pump Delta-9</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--navy-dark)' }}>Preferred Time</label>
                    <input type="datetime-local" className="std-input" style={{ width: '100%', padding: '10px', borderRadius: '8px' }} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { alert("Consultation Request Sent! Expected callback within 2 hours."); setShowCallModal(false); }}>Schedule Now</button>
                </div>
              </div>
            </div>
          )
        }

        {/* [NEW] TECHNICAL LIBRARY MODAL */}
        {
          showDocModal && (
            <div className="modal-overlay">
              <div className="diagnosis-modal" style={{ width: '650px' }}>
                <div className="modal-header-v2">
                  <h3>Technical Resource Library</h3>
                  <button className="btn-icon-label" onClick={() => setShowDocModal(false)}>Close</button>
                </div>
                <div className="modal-body-v2" style={{ padding: 0 }}>
                  <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="text" className="table-search" placeholder="Search manuals, schematics, safety docs..." style={{ width: '100%' }} />
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                    {docLibrary.map(doc => (
                      <div key={doc.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', marginBottom: '10px', background: 'white' }}>
                        <span style={{ fontSize: '2rem' }}>{doc.type === 'PDF' ? '📕' : '📘'}</span>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, color: 'var(--navy-dark)' }}>{doc.title}</h4>
                          <small style={{ color: '#64748b' }}>{doc.type} • {doc.size}</small>
                        </div>
                        <button className="btn-small-text" style={{ color: 'var(--navy-primary)', fontWeight: 'bold' }} onClick={() => alert(`Downloading ${doc.title}...`)}>Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }

  // [NEW] VIEW 4: PRODUCER DASHBOARD (SERVICE REQUESTS)
  if (view === 'dashboard' && role === 'producer') {
    const requests = [
      { id: 101, client: "Apex Heavy Industries", machine: "Hydraulic Press H-200", issue: "Main seal leakage detected during operation.", priority: "critical", time: "2h ago", avatar: "AH", value: "₹25,000", distance: "12km", tags: ["Hydraulics", "Urgent"] },
      { id: 102, client: "Solaris Power", machine: "Turbine Generator GEN-X", issue: "Vibration metrics exceeding safety thresholds.", priority: "high", time: "4h ago", avatar: "SP", value: "₹45,000", distance: "34km", tags: ["Power/Elect", "Analysis"] },
      { id: 103, client: "Constructo Inc", machine: "Excavator Arm", issue: "Routine maintenance schedule check.", priority: "normal", time: "1d ago", avatar: "CI", value: "₹8,500", distance: "5km", tags: ["Mechanical", "Routine"] }
    ];

    return (
      <div className="dashboard-wrapper producer-theme">
        <aside className="side-nav">

          <div className="profile-sidebar-summary" style={{ background: 'var(--navy-dark)' }}>
            <div className="nav-avatar-circle" style={{ background: 'var(--amber-gold)', color: 'black' }}>PR</div>
            <div className="nav-user-details">
              <span className="nav-name" style={{ color: 'white' }}>Expert Technician</span>
              <span className="nav-email-small" style={{ color: '#94a3b8' }}>Verified Specialist</span>
            </div>
          </div>

          <nav className="nav-links">
            <div className={`nav-item ${activeTab === 'fleet' || activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Service Board <span className="nav-badge" style={{ background: 'var(--error-red)', marginLeft: 'auto' }}>3</span></div>
            <div className={`nav-item ${activeTab === 'pro-messages' ? 'active' : ''}`} onClick={() => setActiveTab('pro-messages')}>Client Messages</div>
            <div className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>Earnings Report</div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Expert Profile</div>
            <div className="nav-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
            <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Operations Schedule</div>
            <div className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Parts Inventory</div>
            <div className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>Help & Support</div>
            <div className={`nav-item ${activeTab === 'platform-settings' ? 'active' : ''}`} onClick={() => setActiveTab('platform-settings')}>Platform Settings</div>
            <div className="nav-item logout-btn-item" onClick={() => setView('landing')}>Logout</div>
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
                {notifications.some(n => !n.read) && <span className="notif-ping"></span>}
              </div>

              {/* NOTIFICATION DROP DOWN */}
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
                      <span className="value">3 REQUESTS</span>
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
                {requests.map(req => (
                  <div key={req.id} className={`job-card ${req.priority}`}>
                    <div className="job-card-header">
                      <div className="client-badge">
                        <div className="client-avatar">{req.avatar}</div>
                        <div className="client-meta">
                          <h4>{req.client}</h4>
                          <span>Ticket #{req.id * 83} • {req.time}</span>
                        </div>
                      </div>
                      <div className="job-value">{req.value}</div>
                    </div>
                    <div className="job-card-body">
                      {req.priority === 'critical' && <div className="priority-banner">⚠️ IMMEDIATE ATTENTION REQUIRED</div>}
                      <div className="machine-spec">
                        <span className="icon">⚙️</span>
                        <span className="name">{req.machine}</span>
                      </div>
                      <p className="issue-desc">"{req.issue}"</p>
                      <div className="job-tags">
                        {req.tags.map(tag => <span key={tag} className="job-tag">{tag}</span>)}
                        <span className="job-dist">📍 {req.distance}</span>
                      </div>
                    </div>
                    <div className="job-card-footer">
                      <button className="btn-job-action decline">DECLINE</button>
                      <button className="btn-job-action accept" onClick={() => alert("Job Accepted! Redirecting to Diagnosis workspace...")}>ACCEPT ASSIGNMENT</button>
                    </div>
                  </div>
                ))}
                <div className="radar-card">
                  <div className="radar-circle">
                    <div className="radar-sweep"></div>
                  </div>
                  <h3>Scanning Sector 7...</h3>
                  <p>Searching for new industrial signals in your vicinity.</p>
                </div>
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
                <div className="header-actions">
                  <div className="date-nav">
                    <button className="btn-icon">◀</button>
                    <span style={{ fontWeight: '700', color: 'var(--navy-dark)' }}>Feb 19 - Feb 25, 2026</span>
                    <button className="btn-icon">▶</button>
                  </div>
                </div>
              </header>

              <div className="glass-panel schedule-container">
                <div className="schedule-grid">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="day-col">
                      <div className="day-header">{day}</div>
                      <div className="day-slots">
                        {day === 'Mon' && <div className="schedule-card job">
                          <span className="time">09:00 AM</span>
                          <h4>Site Inspection</h4>
                          <p>Apex Heavy Ind.</p>
                        </div>}
                        {day === 'Mon' && <div className="schedule-card break" style={{ top: '140px' }}>
                          <span className="time">01:00 PM</span>
                          <h4>Lunch Break</h4>
                        </div>}
                        {day === 'Tue' && <div className="schedule-card job" style={{ height: '120px', background: '#ecfdf5', borderColor: '#d1fae5' }}>
                          <span className="time">10:30 AM</span>
                          <h4 style={{ color: '#065f46' }}>Hydraulic Repair</h4>
                          <p style={{ color: '#047857' }}>GreenField Agri</p>
                        </div>}
                        {day === 'Thu' && <div className="schedule-card unavailable">
                          <h4>Unavailable</h4>
                          <p>Personal Leave</p>
                        </div>}
                        {day === 'Fri' && <div className="schedule-card job">
                          <span className="time">02:00 PM</span>
                          <h4>System Calibration</h4>
                          <p>Solaris Power</p>
                        </div>}
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="setting-item toggle-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy-dark)', display: 'block' }}>Language</span>
                      <small style={{ color: '#64748b' }}>Select your preferred interface language.</small>
                    </div>
                    <select className="std-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Kannada</option>
                    </select>
                  </div>
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
                  {producerChats.map(chat => (
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
                  <button className="btn-secondary">Export CSV</button>
                </div>
              </header>

              <div className="earnings-stats-grid">
                <div className="stat-card">
                  <div className="stat-label">TOTAL REVENUE (YTD)</div>
                  <div className="stat-value">₹8,45,200</div>
                  <div className="stat-trend positive">▲ 12.5% vs last month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">PENDING PAYOUT</div>
                  <div className="stat-value">₹42,500</div>
                  <div className="stat-sub">Next payout: Feb 21</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">AVG. TICKET VALUE</div>
                  <div className="stat-value">₹18,500</div>
                  <div className="stat-trend neutral">─ Stable</div>
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
                    {[
                      { id: 1, date: 'Feb 15, 2026', client: 'Apex Heavy Industries', service: '#SR-8921', status: 'Completed', amount: '₹22,000' },
                      { id: 2, date: 'Feb 12, 2026', client: 'Solaris Power', service: '#SR-8840', status: 'Processing', amount: '₹15,500' },
                      { id: 3, date: 'Feb 10, 2026', client: 'Hydra-Fix Specialists', service: '#SR-8812', status: 'Paid', amount: '₹8,400' },
                      { id: 4, date: 'Feb 08, 2026', client: 'GreenField Agri', service: '#SR-8755', status: 'Paid', amount: '₹35,000' },
                    ].map(tx => (
                      <tr key={tx.id}>
                        <td>{tx.date}</td>
                        <td style={{ fontWeight: '600', color: 'var(--navy-dark)' }}>{tx.client}</td>
                        <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{tx.service}</td>
                        <td>
                          <span className={`status-pill ${tx.status.toLowerCase()}`}>{tx.status}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--navy-dark)' }}>{tx.amount}</td>
                      </tr>
                    ))}
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
                <div className="header-actions">
                  <button
                    className={isEditingProfile ? "btn-primary" : "btn-secondary"}
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Save Changes" : "Edit Profile"}
                  </button>
                </div>
              </header>

              <div className="profile-grid">
                {/* ID Card / Main Info */}
                <div className="glass-panel profile-card">
                  <div className="profile-header-visual">
                    <div className="profile-avatar-large">XT</div>
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
                    {['Hydraulics Systems', 'PLC Programming', 'Siemens S7', 'Industrial IoT', 'Pneumatic Actuators', 'Safety Protocols'].map(skill => (
                      <span key={skill} className="tech-tag">{skill}</span>
                    ))}
                    <button className="add-tag-btn">+ Add Skill</button>
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

            </div>
          ) : (
            <div className="animate-fade" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
              <h2>Section Under Development</h2>
              <p>This module will be available in the next update.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- RETURN: LOGIN / SIGNUP / LANDING VIEW ---
  return (
    <div className={`login-page-wrapper ${role}-theme`}>
      <button className="back-btn-top" onClick={() => setView('landing')}>← Exit to origiNode</button>


      <div className="glass-container">
        <div className={`login-visual ${role}-bg`}>
          <div className="visual-overlay">
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
            <div className="status-indicator">
              <span className="dot"></span> {role === 'consumer' ? 'Platform Active' : 'Network Online'}
            </div>
          </div>
        </div>

        <div className="login-form-area">
          <h1 className="form-title" style={{ marginBottom: '15px', fontSize: '1.6rem' }}>
            {view === 'forgot'
              ? 'Reset Password'
              : isLogin ? `${role === 'consumer' ? 'Consumer' : 'Producer'} Login` : `Signup Step ${signupStep}`}
          </h1>

          {isLogin ? (
            // LOGIN FORM
            <div className="animate-fade">
              <div className="input-row" style={{ marginBottom: '12px' }}>
                <label>Work Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'field-error' : ''}
                />
                {errors.email && <small className="error-msg">{errors.email}</small>}
              </div>

              <div className="input-row" style={{ marginBottom: '10px' }}>
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
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
                  <span className="forgot-password-link" onClick={() => setView('forgot')} style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}>Forgot Password?</span>
                </div>
                {errors.password && <small className="error-msg">{errors.password}</small>}
              </div>
            </div>
          ) : (
            // SIGNUP STEPS
            // SIGNUP STEPS - ENHANCED UI
            <div className="animate-fade">
              {/* VISUAL STEPPER */}
              <div className="signup-stepper">
                <div className={`step-item ${signupStep >= 1 ? 'active' : ''}`}>
                  <div className="step-circle">{signupStep > 1 ? '✓' : '1'}</div>
                  <span className="step-label">Identity</span>
                </div>
                <div className={`step-line ${signupStep >= 2 ? 'filled' : ''}`}></div>
                <div className={`step-item ${signupStep >= 2 ? 'active' : ''}`}>
                  <div className="step-circle">{signupStep > 2 ? '✓' : '2'}</div>
                  <span className="step-label">Verify</span>
                </div>
                <div className={`step-line ${signupStep >= 3 ? 'filled' : ''}`}></div>
                <div className={`step-item ${signupStep >= 3 ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <span className="step-label">Profile</span>
                </div>
              </div>

              {signupStep === 1 && (
                <div className="signup-form-step">
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-field-modern">
                      <label>First Name</label>
                      <input type="text" placeholder="John" onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="input-field-modern">
                      <label>Last Name</label>
                      <input type="text" placeholder="Doe" onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-field-modern" style={{ flex: 1.5 }}>
                      <label>Is This Right?</label>
                      <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="input-field-modern" style={{ flex: 1 }}>
                      <label>Birth Date</label>
                      <input type="date" onChange={(e) => setDob(e.target.value)} />
                    </div>
                  </div>
                  {errors.phone && <small className="error-msg" style={{ display: 'block', marginBottom: '5px' }}>{errors.phone}</small>}

                  <div className="input-field-modern">
                    <label>Work Email</label>
                    <input type="email" placeholder="name@company.com" onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-field-modern" style={{ flex: 1 }}>
                      <label>Password</label>
                      <input type="password" placeholder="Min 8 chars" onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="input-field-modern" style={{ flex: 1 }}>
                      <label>Confirm</label>
                      <input type="password" placeholder="Repeat" onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                  </div>
                  {errors.confirmPassword && <small className="error-msg">{errors.confirmPassword}</small>}
                  {errors.password && <small className="error-msg">{errors.password}</small>}
                </div>
              )}

              {signupStep === 2 && (
                <div className="signup-form-step text-center">
                  <div className="otp-visual-icon">📱</div>
                  <h3>Verify Your Number</h3>
                  <p className="otp-desc">We sent a 4-digit code to <strong>+91 {phone}</strong></p>

                  <div className="otp-input-wrapper">
                    <input type="text" maxLength="4" className="otp-input-box-enhanced" placeholder="• • • •" onChange={(e) => setOtp(e.target.value)} autoFocus />
                  </div>

                  {errors.otp && <small className="error-msg">{errors.otp}</small>}

                  <div className="resend-container">
                    {timer > 0 ? (
                      <p className="timer-text">Resend code in <span>00:{timer < 10 ? `0${timer}` : timer}</span></p>
                    ) : (
                      <button className="btn-text-only" onClick={handleResendOTP}>Resend Code</button>
                    )}
                  </div>
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

          <button className="main-action-btn" onClick={handleLogin}>
            {view === 'forgot' ? 'Send Reset Link' : isLogin ? 'Enter Portal' : (signupStep === 1 ? 'Verify Phone' : signupStep === 2 ? 'Verify OTP' : 'Finish Setup')}
          </button>

          {view !== 'forgot' && (
            <div className="animate-fade">
              {isLogin && (
                <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
                  Demo: admin@originode.com / Demo@1234
                </p>
              )}
              <div className="divider" style={{ margin: '12px 0' }}><span>OR</span></div>
              <div className="social-grid" style={{ gap: '10px' }}>
                <button className="btn-social google" onClick={() => handleSocialLogin('Google')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span style={{ flex: 1, textAlign: 'center' }}>Continue with Google</span>
                </button>
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
            <span onClick={() => { setIsLogin(!isLogin); setSignupStep(1); }}> {isLogin ? "Sign Up" : "Login"}</span>
          </p>
        </div>
      </div>
    </div >

  );
}


export default App;

