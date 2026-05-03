import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Send, 
  MessageSquare, 
  Paperclip, 
  CheckCheck,
  ShieldCheck,
  User,
  CreditCard,
  Image as ImageIcon,
  FileText,
  X,
  Play,
  CheckCircle
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';
import { motion, AnimatePresence } from 'framer-motion';
import { getServiceStageMeta } from '../utils/serviceRequestStatus';

function RatingPromptPlaceholder() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-md rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-5 py-4 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Rate your experience</p>
        <p className="text-xs text-slate-500 mt-1.5">Your rating will be available here.</p>
      </div>
    </div>
  );
}

export default function MessagesView({ 
  chats, 
  activeChatId, 
  setActiveChatId, 
  chatHistory, 
  onSendMessage,
  currentUser,
  onViewProfile,
  onProcessPayment,
  paidInvoices = [],
  jobStatus,
  onStartWork,
  onMarkComplete,
  loading = false,
  onAppointmentAction
}) {
  const navigate = useNavigate();
  const [msgInput, setMsgInput] = useState('');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('On-site Visit');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const isExpertView = currentUser?.id === 'expert' || currentUser?.role === 'producer';

  const jobSt = (jobStatus || '').toLowerCase();
  const statusMeta = getServiceStageMeta(jobStatus, null);
  const canStartWork =
    isExpertView &&
    typeof onStartWork === 'function' &&
    (jobSt === 'accepted' || jobSt === 'payment_pending');
  const canMarkComplete =
    isExpertView &&
    typeof onMarkComplete === 'function' &&
    (jobSt === 'in_progress' || jobSt === 'accepted' || jobSt === 'payment_pending');
  const showCompletedBadge =
    isExpertView && jobSt === 'completed';

  const handleViewProfile = () => {
    // Call the modal handler passed via props
    if (onViewProfile) {
      onViewProfile(activeChat);
    }
  };

  // FIX 5 — Wrapper to handle appointment action with prefill for reschedule
  const handleAppointmentActionWithPrefill = (msg, action) => {
    if (onAppointmentAction) {
      onAppointmentAction(msg, action, (prefillData) => {
        // Prefill callback for reschedule
        setAppointmentDate(prefillData.date);
        setAppointmentTime(prefillData.time);
        setAppointmentType(prefillData.type);
        setAppointmentNote(prefillData.note);
        setShowAppointmentForm(true);
      });
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeChatId]);

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden shadow-sm animate-fade-in">
      {/* Left Panel: Conversations List */}
      <div className="w-80 lg:w-96 flex flex-col border-r border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="p-6 border-b border-[#E5E7EB]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Service Chats</h3>
              <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-[#E5E7EB]">
                {chats.length} Active
              </Badge>
           </div>
           
           <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                 <Search size={16} />
              </div>
               <input 
                 placeholder="Search experts..." 
                 className={`w-full h-10 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-${isExpertView ? 'indigo-500' : 'teal-500'} focus:border-${isExpertView ? 'indigo-500' : 'teal-500'} transition-all`}
                 value={''}
                 onChange={e => {}}
               />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
           {chats.map(chat => (
             <ChatListItem 
               key={chat.id} 
               chat={chat} 
               isActive={activeChatId === chat.id}
               onClick={() => setActiveChatId(chat.id)}
             />
           ))}
           {chats.length === 0 && (
             <div className="py-20 text-center px-6">
                <div className="w-12 h-12 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageSquare className="text-slate-300" size={20} />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {loading ? "Loading conversations..." : "No active service conversations"}
                </p>
             </div>
           )}
        </div>
      </div>

      {/* Right Panel: Chat Hub */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <AnimatePresence mode="wait">
        {activeChat ? (
          <motion.div 
            key={activeChatId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* Chat Header */}
            <div className="min-h-[5rem] border-b border-[#E5E7EB] flex items-center justify-between gap-4 px-6 sm:px-10 py-3 bg-white z-10 shrink-0">
               <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full ${isExpertView ? 'bg-indigo-600' : 'bg-[#0d9488]'} flex items-center justify-center text-white font-semibold text-xs`}>
                      {activeChat.name?.[0] || 'E'}
                    </div>
                    {activeChat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-semibold text-slate-900 tracking-tight text-base leading-tight mb-0.5 truncate">{activeChat.name}</h4>
                    <span className="text-[10px] font-medium text-slate-500">{activeChat.specialty || 'Repair Expert'}</span>
                    {jobStatus != null && jobStatus !== '' && (
                      <span className="text-[11px] font-semibold text-slate-600 mt-1">
                        Status: <span className="text-slate-900">{statusMeta.label}</span>
                      </span>
                    )}
                  </div>
               </div>

               <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {isExpertView && showCompletedBadge && (
                  <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle size={14} />
                    Completed
                  </span>
                )}
                {canMarkComplete && (
                  <button
                    type="button"
                    onClick={() => setShowCompleteConfirm(true)}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <CheckCircle size={14} />
                    Mark as Completed
                  </button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewProfile}
                  className={`h-9 px-4 rounded-xl border-[#E5E7EB] text-slate-600 font-medium text-xs transition-all hover:bg-${isExpertView ? 'indigo-50' : 'teal-50'} hover:border-${isExpertView ? 'indigo-200' : 'teal-200'} hover:text-${isExpertView ? 'indigo-600' : 'teal-600'}`}
                >
                  <User size={14} className="mr-2" />
                  View Profile
                </Button>
               </div>
            </div>

            {showCompleteConfirm && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="complete-confirm-title"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowCompleteConfirm(false);
                }}
              >
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl max-w-md w-full p-6 space-y-4">
                  <h3 id="complete-confirm-title" className="text-lg font-semibold text-slate-900">
                    Mark job as completed?
                  </h3>
                  <p className="text-sm text-slate-500">
                    This will close the service request and notify the consumer.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCompleteConfirm(false)}
                      className="h-10 px-4 rounded-xl border border-[#E5E7EB] text-slate-700 text-sm font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCompleteConfirm(false);
                        onMarkComplete?.();
                      }}
                      className="h-10 px-4 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {canStartWork && (
              <div className="px-6 sm:px-10 py-3 border-b border-[#E5E7EB] bg-slate-50/80 flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onStartWork}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Play size={14} className="fill-current" />
                    Start Work
                  </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-[#F9FAFB]/30">
               {(() => {
                 const rawMessages = (activeChat?.messages?.length > 0) ? activeChat.messages : chatHistory;
                 // FIX 2 — Deduplicate invoices — keep only the last one
                 const deduplicatedMessages = rawMessages.reduce((acc, msg) => {
                   if (msg.type === 'invoice' || (msg.text && msg.text.startsWith('[INVOICE]'))) {
                     // Remove any previous invoice message, keep only latest
                     const filtered = acc.filter(m => 
                       !(m.type === 'invoice' || (m.text && m.text.startsWith('[INVOICE]')))
                     );
                     return [...filtered, msg];
                   }
                   return [...acc, msg];
                 }, []);
                 
                 return deduplicatedMessages.map((msg, i) => {
                   if (msg.type === 'rating_prompt') {
                     return (
                       <RatingPromptPlaceholder key={msg.id || `rating-${i}`} />
                     );
                   }
                   const isMine = msg.sender === currentUser?.id || msg.senderId === currentUser?.id;
                   
                   return (
                     <MessageBubble 
                       key={msg.id ?? i} 
                       msg={msg} 
                       isMine={isMine} 
                       onProcessPayment={onProcessPayment}
                       paidInvoices={paidInvoices}
                       currentUser={currentUser}
                       onAppointmentAction={handleAppointmentActionWithPrefill}
                     />
                   );
                 });
               })()}
               <div ref={chatEndRef} />
            </div>

            {/* Invoice Modal */}
            {isExpertView && showInvoiceForm && (
              <div
                className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) { setShowInvoiceForm(false); setInvoiceError(''); } }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <CreditCard size={17} className="text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">Create Invoice</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Send payment request to consumer</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowInvoiceForm(false); setInvoiceError(''); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 space-y-4">
                    {invoiceError && (
                      <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{invoiceError}</p>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 4500"
                          value={invoiceAmount}
                          onChange={e => { setInvoiceAmount(e.target.value); setInvoiceError(''); }}
                          className="w-full h-12 pl-9 pr-4 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Valve Seal Replacement"
                        value={invoiceDesc}
                        onChange={e => { setInvoiceDesc(e.target.value); setInvoiceError(''); }}
                        className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowInvoiceForm(false); setInvoiceError(''); }}
                      className="flex-1 h-11 rounded-xl border border-[#E5E7EB] text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!invoiceAmount) {
                          setInvoiceError("Please enter amount");
                          return;
                        }
                        if (isNaN(invoiceAmount) || Number(invoiceAmount) <= 0) {
                          setInvoiceError("Enter valid amount");
                          return;
                        }
                        if (!invoiceDesc) {
                          setInvoiceError("Please enter description");
                          return;
                        }
                        setInvoiceError('');
                        const payload = JSON.stringify({ amount: invoiceAmount, desc: invoiceDesc });
                        onSendMessage(`[INVOICE]:${payload}`);
                        setInvoiceAmount('');
                        setInvoiceDesc('');
                        setShowInvoiceForm(false);
                      }}
                      className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
                    >
                      Send Invoice
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Appointment Modal */}
            {showAppointmentForm && (
              <div
                className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) { setShowAppointmentForm(false); setAppointmentError(''); } }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-lg">
                        📅
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">Schedule Visit</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Set an appointment with the other party</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowAppointmentForm(false); setAppointmentError(''); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 space-y-4">
                    {appointmentError && (
                      <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{appointmentError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={appointmentDate}
                          onChange={e => { setAppointmentDate(e.target.value); setAppointmentError(''); }}
                          className="w-full h-12 px-3 rounded-xl border border-[#E5E7EB] text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Time</label>
                        <input
                          type="time"
                          value={appointmentTime}
                          onChange={e => { setAppointmentTime(e.target.value); setAppointmentError(''); }}
                          className="w-full h-12 px-3 rounded-xl border border-[#E5E7EB] text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Visit Type</label>
                      <select
                        value={appointmentType}
                        onChange={e => setAppointmentType(e.target.value)}
                        className="w-full h-12 px-3 rounded-xl border border-[#E5E7EB] text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      >
                        <option>On-site Visit</option>
                        <option>Video Call</option>
                        <option>Phone Call</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Note <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Will bring tools"
                        value={appointmentNote}
                        onChange={e => setAppointmentNote(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowAppointmentForm(false); setAppointmentError(''); }}
                      className="flex-1 h-11 rounded-xl border border-[#E5E7EB] text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!appointmentDate) {
                          setAppointmentError("Please select a date");
                          return;
                        }
                        if (!appointmentTime) {
                          setAppointmentError("Please select a time");
                          return;
                        }
                        setAppointmentError('');
                        const payload = JSON.stringify({
                          date: appointmentDate,
                          time: appointmentTime,
                          type: appointmentType,
                          note: appointmentNote
                        });
                        onSendMessage(`[APPOINTMENT]:${payload}`);
                        setAppointmentDate('');
                        setAppointmentTime('');
                        setAppointmentType('On-site Visit');
                        setAppointmentNote('');
                        setShowAppointmentForm(false);
                      }}
                      className="flex-1 h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all"
                    >
                      Schedule Appointment
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-[#F9FAFB] border-t border-[#E5E7EB] shrink-0">
               <form 
                 onSubmit={(e) => {
                   e.preventDefault();
                   if (msgInput.trim()) {
                     onSendMessage(msgInput);
                     setMsgInput('');
                   }
                 }}
                 className="flex items-center gap-3"
               >
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-${isExpertView ? 'indigo-600' : 'teal-600'} hover:bg-${isExpertView ? 'indigo-50' : 'teal-50'} border border-[#E5E7EB] flex items-center justify-center transition-all`}
                  >
                    <Paperclip size={18} />
                  </button>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   onChange={(e) => {/* Handle file upload */}}
                 />

                  <input 
                    placeholder="Type your message..." 
                    className={`flex-1 h-11 bg-white border border-[#E5E7EB] rounded-xl px-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-${isExpertView ? 'indigo-500' : 'teal-500'} focus:border-${isExpertView ? 'indigo-500' : 'teal-500'} transition-all placeholder:text-slate-400 placeholder:font-normal`}
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                  />
                  {isExpertView && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowInvoiceForm(!showInvoiceForm);
                        setShowAppointmentForm(false);
                      }}
                      className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 flex items-center justify-center transition-all shadow-sm shrink-0"
                      title="Send Invoice"
                    >
                      <CreditCard size={18} />
                    </button>
                  )}
                  {/* FIX 4 — Appointment button visible to BOTH consumer and expert */}
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAppointmentForm(!showAppointmentForm);
                      setShowInvoiceForm(false);
                    }}
                    className={`w-11 h-11 rounded-xl ${isExpertView ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100' : 'bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-100'} border flex items-center justify-center transition-all shadow-sm shrink-0`}
                    title="Schedule Appointment"
                  >
                    📅
                  </button>
                  <button 
                    type="submit"
                    disabled={!msgInput.trim()} 
                    className={`h-11 w-11 rounded-xl ${isExpertView ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#0d9488] hover:bg-teal-700'} text-white shadow-sm transition-all disabled:opacity-50 flex items-center justify-center`}
                  >
                    <Send size={18} />
                  </button>
               </form>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="w-20 h-20 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[24px] shadow-sm flex items-center justify-center mb-6">
                <MessageSquare className="text-slate-300" size={32} />
             </div>
             <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
                Select a conversation from the left to start chatting with a consumer.
             </p>
          </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMine, onProcessPayment, paidInvoices = [], currentUser, onAppointmentAction }) {
  const isExpertView = currentUser?.id === 'expert' || currentUser?.role === 'producer';
  const renderMessageContent = () => {
    // Handle message format (string vs object)
    let messageText = typeof msg === 'string' ? msg : (msg.text || msg.message || '');
    
    // PROMPT 3 — Detect appointment messages
    if (typeof messageText === 'string' && messageText.startsWith('[APPOINTMENT]:')) {
      const jsonStr = messageText.replace('[APPOINTMENT]:', '').trim();
      try {
        const data = JSON.parse(jsonStr);
        const sentByMe = isMine;
        
        // Status from data (default: pending)
        const apptStatus = data.status || 'pending';
        
        let cardTitle, cardSubtitle, statusColor, cardBg, cardBorder;
        if (apptStatus === 'accepted') {
          cardTitle = 'Appointment Confirmed';
          cardSubtitle = '✓ Confirmed';
          statusColor = '#16a34a';
          cardBg = '#F0FDF4';
          cardBorder = '#BBF7D0';
        } else if (apptStatus === 'declined') {
          cardTitle = 'Appointment Declined';
          cardSubtitle = '✗ Declined';
          statusColor = '#dc2626';
          cardBg = '#FEF2F2';
          cardBorder = '#FECACA';
        } else if (apptStatus === 'rescheduled') {
          cardTitle = 'Reschedule Requested';
          cardSubtitle = '⟳ Reschedule requested';
          statusColor = '#d97706';
          cardBg = '#FFFBEB';
          cardBorder = '#FED7AA';
        } else {
          cardTitle = sentByMe
            ? (isExpertView ? 'Appointment Scheduled' : 'Visit Requested')
            : (isExpertView ? 'Visit Requested by Consumer' : 'Expert Scheduled a Visit');
          cardSubtitle = sentByMe ? 'Awaiting response' : 'Action required';
          statusColor = '#0d9488';
          cardBg = '#F0FDF4';
          cardBorder = '#BBF7D0';
        }
        
        // Show action buttons only to the RECEIVER (not sender) and only when pending
        const showActions = !sentByMe && apptStatus === 'pending';
        
        return (
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '14px 16px',
            maxWidth: '300px',
            minWidth: '240px'
          }}>
            {/* Header */}
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
              <div style={{
                background: apptStatus === 'declined' ? '#dc2626' : apptStatus === 'accepted' ? '#16a34a' : '#16a34a',
                borderRadius:'8px', padding:'6px', fontSize:'16px'
              }}>📅</div>
              <div>
                <div style={{fontWeight:600, fontSize:'13px', color:'#14532d'}}>{cardTitle}</div>
                <div style={{fontSize:'11px', color: statusColor}}>{data.type}</div>
              </div>
            </div>
            
            {/* Date & Time */}
            <div style={{fontSize:'13px', color:'#374151', marginBottom:'4px'}}>
              📅 {new Date(data.date).toLocaleDateString('en-IN', {
                weekday:'short', day:'numeric', month:'short', year:'numeric'
              })}
            </div>
            <div style={{fontSize:'13px', color:'#374151', marginBottom:'4px'}}>
              🕐 {data.time}
            </div>
            
            {/* Note */}
            {data.note && (
              <div style={{
                fontSize:'12px', color:'#6B7280',
                marginTop:'6px', borderTop:'1px solid #D1FAE5',
                paddingTop:'6px'
              }}>
                {data.note}
              </div>
            )}
            
            {/* Status badge */}
            <div style={{
              fontSize:'11px', color: statusColor,
              marginTop:'6px', fontWeight:500
            }}>
              {cardSubtitle}
            </div>
            
            {/* Action buttons — only for receiver when pending */}
            {showActions && (
              <div style={{
                display:'flex', gap:'6px', marginTop:'10px',
                borderTop:'1px solid #D1FAE5', paddingTop:'10px'
              }}>
                <button
                  onClick={() => onAppointmentAction && onAppointmentAction(msg, 'accepted')}
                  style={{
                    flex:1, padding:'6px 0', borderRadius:'8px',
                    background:'#16a34a', color:'white', border:'none',
                    fontSize:'12px', fontWeight:600, cursor:'pointer'
                  }}
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => onAppointmentAction && onAppointmentAction(msg, 'rescheduled')}
                  style={{
                    flex:1, padding:'6px 0', borderRadius:'8px',
                    background:'#f59e0b', color:'white', border:'none',
                    fontSize:'12px', fontWeight:600, cursor:'pointer'
                  }}
                >
                  ⟳ Reschedule
                </button>
                <button
                  onClick={() => onAppointmentAction && onAppointmentAction(msg, 'declined')}
                  style={{
                    flex:1, padding:'6px 0', borderRadius:'8px',
                    background:'#dc2626', color:'white', border:'none',
                    fontSize:'12px', fontWeight:600, cursor:'pointer'
                  }}
                >
                  ✗ Decline
                </button>
              </div>
            )}
          </div>
        );
      } catch (e) {
        return <span className="text-sm text-slate-700">{messageText}</span>;
      }
    }
    
    // 1. Detect invoice messages
    if (typeof messageText === 'string' && messageText.startsWith('[INVOICE]:')) {
      // 2. Parse invoice data
      const jsonStr = messageText.replace('[INVOICE]:', '').trim();
      try {
        const invoiceData = JSON.parse(jsonStr);
        const { amount, desc, description } = invoiceData;
        const currentInvoiceKey = `${desc || description}_${amount}`;
        const isPaid = paidInvoices.includes(currentInvoiceKey);
        
        // 3 & 4. Render styled invoice card
        return (
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-4 my-2 shadow-sm w-full max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${isExpertView ? 'bg-indigo-600' : 'bg-[#0d9488]'} flex items-center justify-center text-white shadow-sm`}>
                  <CreditCard size={16} />
                </div>
                <span className={`text-[10px] font-semibold ${isExpertView ? 'text-indigo-600' : 'text-[#0d9488]'} uppercase tracking-widest`}>Service Cost</span>
              </div>
              {isPaid && (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold">PAID</Badge>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">₹{amount}</h3>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                {desc || description || "Service cost for node maintenance."}
              </p>
            </div>
            
            {isExpertView ? (
              <div className="w-full h-9 rounded-[8px] font-semibold text-xs shadow-sm bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center gap-2">
                <CheckCheck size={16} />
                {isPaid ? "Payment Completed" : "Invoice Sent"}
              </div>
            ) : (
              <button 
                disabled={isPaid}
                onClick={() => {
                  console.log("Initiating payment for:", { amount, description: desc || description });
                  onProcessPayment?.(amount, desc || description);
                }}
                className={cn(
                  "w-full h-9 rounded-[8px] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2",
                  isPaid 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-[#0d9488] hover:bg-teal-700 text-white"
                )}
              >
                {isPaid ? "Payment Completed" : "Pay Now"}
              </button>
            )}
          </div>
        );
      } catch (error) {
        // PART 4: ERROR HANDLING
        console.error("Failed to parse invoice JSON:", error);
        return <p className="text-sm font-medium text-red-500 italic">Invalid invoice</p>;
      }
    }

    // Normal message rendering
    return (
      <p className="text-sm font-medium leading-relaxed tracking-tight text-inherit">
        {messageText}
      </p>
    );
  };

  return (
    <div className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-[16px] shadow-sm",
        isMine 
          ? `${isExpertView ? 'bg-indigo-600' : 'bg-[#0d9488]'} text-white rounded-tr-none shadow-md shadow-teal-500/10` 
          : "bg-white border border-[#E5E7EB] text-slate-700 rounded-tl-none shadow-sm"
      )}>
        {renderMessageContent()}
        <div className={cn(
          "flex items-center gap-1.5 mt-2 justify-end opacity-60",
          isMine ? "text-white" : "text-slate-400"
        )}>
          <span className="text-[9px] font-medium uppercase">{(typeof msg === 'object' ? msg.time : undefined) || "10:24 AM"}</span>
          {isMine && <CheckCheck size={10} />}
        </div>
      </div>
    </div>
  );
}

function ChatListItem({ chat, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left group relative",
        isActive 
          ? `bg-white shadow-sm ring-1 ring-${chat.role === 'producer' ? 'indigo-600/10' : 'teal-600/10'}` 
          : "hover:bg-white/50"
      )}
    >
      <div className="relative shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all", 
          isActive 
            ? (chat.role === 'producer' ? 'bg-indigo-600 text-white' : 'bg-[#0d9488] text-white')
            : "bg-white border border-[#E5E7EB] text-slate-400 group-hover:border-slate-300"
        )}>
          {chat.name?.[0] || 'E'}
        </div>
        {chat.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h5 className={cn(
            "font-bold truncate text-sm tracking-tight", 
            isActive ? (chat.role === 'producer' ? 'text-indigo-600' : 'text-[#0d9488]') : "text-slate-900"
          )}>
            {chat.name}
          </h5>
          <span className="text-[9px] font-medium text-slate-400 uppercase">{chat.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs truncate font-normal text-slate-500">
            {chat.lastMsg || chat.specialty}
          </p>
          {chat.unread > 0 && (
            <div className="shrink-0 ml-2 w-4 h-4 rounded-full bg-[#0d9488] text-white text-[9px] flex items-center justify-center font-bold">
              {chat.unread}
            </div>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 ${chat.role === 'producer' ? 'bg-indigo-600' : 'bg-[#0d9488]'} rounded-r-full`} />
      )}
    </button>
  );
}
