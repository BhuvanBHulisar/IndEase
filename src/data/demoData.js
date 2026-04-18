// Static demo data — used exclusively in Demo Mode
// Real user data is NEVER mixed with this

// ── Demo user personas ────────────────────────────────────────────────────────
export const DEMO_USERS = {
  producer: {
    name: 'Demo Expert',
    firstName: 'Demo',
    lastName: 'Expert',
    email: 'demo_expert@originode.com',
    phone: '9999999999',
    company: 'IndEase Industrial',
    location: 'Mumbai, Maharashtra',
    role: 'producer',
    skills: ['Hydraulics', 'CNC', 'Motors', 'PLC Programming'],
    rating: 4.8,
    level: 'Gold',
    points: 420,
    salary: 18000,
  },
  consumer: {
    name: 'Demo Fleet',
    firstName: 'Demo',
    lastName: 'Fleet',
    email: 'demo_fleet@originode.com',
    phone: '8888888888',
    company: 'Demo Logistics Pvt. Ltd.',
    location: 'Pune, Maharashtra',
    role: 'consumer',
  },
};

export const DEMO_STATS = {
  earnings: 12400,
  completedJobs: 8,
  rating: 4.8,
  totalJobs: 11,
  pendingJobs: 3,
};

export const DEMO_PRODUCER_STATS = {
  earnings: 12400,
  completedJobs: 8,
  rating: 4.8,
};

export const DEMO_RADAR_JOBS = [
  {
    id: 'demo-job-001',
    machine_name: 'Conveyor Motor #12',
    issue_description: 'Routine maintenance check',
    priority: 'normal',
    status: 'broadcast',
    client_name: 'Demo',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-job-002',
    machine_name: 'Hydraulic Press #08',
    issue_description: 'Oil leakage from main cylinder seal',
    priority: 'critical',
    status: 'broadcast',
    client_name: 'Demo',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-job-003',
    machine_name: 'CNC Lathe #03',
    issue_description: 'Spindle vibration at high RPM',
    priority: 'normal',
    status: 'broadcast',
    client_name: 'Demo',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_CHATS = [
  {
    id: 'demo-chat-1',
    name: 'ABC Industries',
    avatar: 'AI',
    lastMsg: 'Please resolve the oil leakage ASAP',
    time: '2m ago',
    unread: 2,
    status: 'in_progress',
    expertId: 'demo-expert-1',
  },
  {
    id: 'demo-chat-2',
    name: 'Precision Parts Ltd',
    avatar: 'PP',
    lastMsg: 'When can you visit?',
    time: '1h ago',
    unread: 0,
    status: 'accepted',
    expertId: 'demo-expert-2',
  },
];

export const DEMO_MACHINES = [
  {
    id: 'demo-machine-1',
    name: 'Hydraulic Press #08',
    oem: 'Bosch Rexroth',
    machine_type: 'Hydraulic Press',
    condition_score: 72,
    status: 'fault',
    last_service: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-machine-2',
    name: 'CNC Lathe #03',
    oem: 'Haas Automation',
    machine_type: 'CNC Lathe',
    condition_score: 91,
    status: 'operational',
    last_service: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-machine-3',
    name: 'Conveyor Motor #12',
    oem: 'Siemens',
    machine_type: 'Motor',
    condition_score: 58,
    status: 'maintenance',
    last_service: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_ACTIVE_REQUESTS = [];

export const DEMO_TRANSACTION_HISTORY = [
  {
    id: 'demo-txn-1',
    date: '12 Jan 2026',
    machine: 'CNC Lathe #03',
    service: 'Spindle Bearing Replacement',
    expert: 'Rajesh Kumar',
    expert_level: 'Gold',
    expert_rating: 4.9,
    status: 'Completed',
    cost: '₹8,500',
    amount: 8500,
  },
  {
    id: 'demo-txn-2',
    date: '28 Dec 2025',
    machine: 'Conveyor Motor #12',
    service: 'Motor Rewinding',
    expert: 'Suresh Patel',
    expert_level: 'Silver',
    expert_rating: 4.6,
    status: 'Completed',
    cost: '₹3,900',
    amount: 3900,
  },
];

export const DEMO_EARNINGS_STATS = {
  totalRevenue: 0,
  pendingPayout: 0,
  avgTicket: 0,
  totalSpent: 12400,
};

export const DEMO_PERFORMANCE_EVENTS = [
  { id: 'pe-1', pointChange: 20, reason: 'Job completed', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pe-2', pointChange: 15, reason: '5-star rating received', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pe-3', pointChange: 5, reason: 'Request accepted under 1 hour', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'pe-4', pointChange: 20, reason: 'Job completed', createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
];
