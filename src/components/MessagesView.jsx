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
  loading = false
}) {
  const navigate = useNavigate();
  const [msgInput, setMsgInput] = useState('');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  const jobSt = (jobStatus || '').toLowerCase();
  const statusMeta = getServiceStageMeta(jobStatus, null);
  const canStartWork =
    currentUser?.id === 'expert' &&
    typeof onStartWork === 'function' &&
    (jobSt === 'accepted' || jobSt === 'payment_pending');
  const canMarkComplete =
    currentUser?.id === 'expert' &&
    typeof onMarkComplete === 'function' &&
    jobSt === 'in_progress';
  const showCompletedBadge =
    currentUser?.id === 'expert' && jobSt === 'completed';

  const handleViewProfile = () => {
    // Call the modal handler passed via props
    if (onViewProfile) {
      onViewProfile(activeChat);
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
                 className={`w-full h-10 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-${currentUser?.id === 'expert' ? 'indigo-500' : 'blue-500'} focus:border-${currentUser?.id === 'expert' ? 'indigo-500' : 'blue-500'} transition-all`}
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
                    <div className={`w-10 h-10 rounded-full ${currentUser?.id === 'expert' ? 'bg-indigo-600' : 'bg-[#2563EB]'} flex items-center justify-center text-white font-semibold text-xs`}>
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
                {currentUser?.id === 'expert' && showCompletedBadge && (
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
                  className={`h-9 px-4 rounded-xl border-[#E5E7EB] text-slate-600 font-medium text-xs transition-all hover:bg-${currentUser?.id === 'expert' ? 'indigo-50' : 'blue-50'} hover:border-${currentUser?.id === 'expert' ? 'indigo-200' : 'blue-200'} hover:text-${currentUser?.id === 'expert' ? 'indigo-600' : 'blue-600'}`}
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
                      className="h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
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
               {chatHistory.map((msg, i) => {
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
                   />
                 );
               })}
               <div ref={chatEndRef} />
            </div>

            {/* Invoice Form Popover */}
            {currentUser?.id === 'expert' && showInvoiceForm && (
              <div className="p-4 bg-white border-t border-[#E5E7EB] shrink-0 space-y-3">
                 <div className="flex items-center justify-between">
                   <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><CreditCard size={16} className="text-indigo-600"/> Create Invoice</h4>
                   <button onClick={() => setShowInvoiceForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                 </div>
                 {invoiceError && <p className="text-red-500 text-xs font-medium">{invoiceError}</p>}
                 <div className="flex items-center gap-3">
                   <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">₹</span>
                     <input 
                       type="number" 
                       placeholder="Amount" 
                       value={invoiceAmount}
                       onChange={e => { setInvoiceAmount(e.target.value); setInvoiceError(''); }}
                       className="w-full h-10 pl-8 pr-3 rounded-lg border border-[#E5E7EB] text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                     />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Description (e.g. Valve Replacement)" 
                     value={invoiceDesc}
                     onChange={e => { setInvoiceDesc(e.target.value); setInvoiceError(''); }}
                     className="flex-[2] h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                   />
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
                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 h-10 rounded-lg shadow-sm transition-all"
                   >
                     Send
                   </button>
                 </div>
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
                    className={`w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:text-${currentUser?.id === 'expert' ? 'indigo-600' : 'blue-600'} hover:bg-${currentUser?.id === 'expert' ? 'indigo-50' : 'blue-50'} border border-[#E5E7EB] flex items-center justify-center transition-all`}
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
                    className={`flex-1 h-11 bg-white border border-[#E5E7EB] rounded-xl px-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-${currentUser?.id === 'expert' ? 'indigo-500' : 'blue-500'} focus:border-${currentUser?.id === 'expert' ? 'indigo-500' : 'blue-500'} transition-all placeholder:text-slate-400 placeholder:font-normal`}
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                  />
                  {currentUser?.id === 'expert' && (
                    <button 
                      type="button" 
                      onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                      className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 flex items-center justify-center transition-all shadow-sm shrink-0"
                      title="Send Invoice"
                    >
                      <CreditCard size={18} />
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={!msgInput.trim()} 
                    className={`h-11 w-11 rounded-xl ${currentUser?.id === 'expert' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#2563EB] hover:bg-blue-700'} text-white shadow-sm transition-all disabled:opacity-50 flex items-center justify-center`}
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

function MessageBubble({ msg, isMine, onProcessPayment, paidInvoices = [], currentUser }) {
  const renderMessageContent = () => {
    // Handle message format (string vs object)
    let messageText = typeof msg === 'string' ? msg : (msg.text || msg.message || '');
    
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
                <div className={`w-8 h-8 rounded-lg ${currentUser?.id === 'expert' ? 'bg-indigo-600' : 'bg-[#2563EB]'} flex items-center justify-center text-white shadow-sm`}>
                  <CreditCard size={16} />
                </div>
                <span className={`text-[10px] font-semibold ${currentUser?.id === 'expert' ? 'text-indigo-600' : 'text-[#2563EB]'} uppercase tracking-widest`}>Service Cost</span>
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
            
            {currentUser?.id === 'expert' ? (
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
                    : "bg-[#2563EB] hover:bg-blue-700 text-white"
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
          ? `${currentUser?.id === 'expert' ? 'bg-indigo-600' : 'bg-[#2563EB]'} text-white rounded-tr-none shadow-md shadow-blue-500/10` 
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
          ? `bg-white shadow-sm ring-1 ring-${chat.role === 'producer' ? 'indigo-600/10' : 'blue-600/10'}` 
          : "hover:bg-white/50"
      )}
    >
      <div className="relative shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all", 
          isActive 
            ? (chat.role === 'producer' ? 'bg-indigo-600 text-white' : 'bg-[#2563EB] text-white')
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
            isActive ? (chat.role === 'producer' ? 'text-indigo-600' : 'text-[#2563EB]') : "text-slate-900"
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
            <div className="shrink-0 ml-2 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] flex items-center justify-center font-bold">
              {chat.unread}
            </div>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 ${chat.role === 'producer' ? 'bg-indigo-600' : 'bg-[#2563EB]'} rounded-r-full`} />
      )}
    </button>
  );
}
