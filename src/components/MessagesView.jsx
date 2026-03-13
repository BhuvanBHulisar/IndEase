import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Plus, 
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  cn 
} from '../components/ui/base';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesView({ 
  chats, 
  activeChatId, 
  setActiveChatId, 
  chatHistory, 
  onSendMessage,
  currentUser
}) {
  const [msgInput, setMsgInput] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeChatId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-100 relative">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-slate-100 bg-slate-50/50 backdrop-blur-sm z-10">
        <div className="p-6 border-b border-slate-100">
           <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
             Conversations
             <Badge variant="secondary" className="rounded-lg ml-2">{chats?.length || 0}</Badge>
           </h3>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <Input placeholder="Search messages..." className="pl-9 bg-white border-slate-200 h-10 rounded-xl text-sm" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {chats.map(chat => (
             <ChatListItem 
               key={chat.id} 
               chat={chat} 
               isActive={activeChatId === chat.id}
               onClick={() => setActiveChatId(chat.id)}
             />
           ))}
           {chats.length === 0 && (
             <div className="py-20 text-center text-slate-400">
                <p className="text-xs font-bold uppercase tracking-widest italic font-sans opacity-50">Transmitting Silence...</p>
             </div>
           )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <AnimatePresence mode="wait">
        {activeChat ? (
          <motion.div 
            key={activeChatId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* Chat Header */}
            <div className="h-24 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md z-10">
               <div className="flex items-center gap-4">
                   <div className="relative">
                     <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-slate-200">
                       {activeChat.name?.[0] || activeChat.avatar}
                     </div>
                     {activeChat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />}
                   </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{activeChat.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                       {activeChat.role || 'Industrial Node'} • {activeChat.online ? 'Online' : 'Encrypted Line'}
                    </p>
                  </div>
               </div>
               
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100"><Info size={20} className="text-slate-500" /></Button>
                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 ml-2"><MoreVertical size={20} className="text-slate-500" /></Button>
                </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth scrollbar-hide">
               {chatHistory.map((msg, i) => (
                 <MessageBubble 
                   key={i} 
                   msg={msg} 
                   isMine={msg.sender === currentUser?.id || msg.senderId === currentUser?.id} 
                   prevMsg={chatHistory[i-1]}
                 />
               ))}
               <div ref={chatEndRef} />
            </div>

            {/* Message Input Container */}
            <div className="p-8 pt-0 bg-white/50 backdrop-blur-md z-10">
               <form 
                 onSubmit={(e) => {
                   e.preventDefault();
                   if (msgInput.trim()) {
                     onSendMessage(msgInput);
                     setMsgInput('');
                   }
                 }}
                 className="flex flex-col gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-3 shadow-sm focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-slate-200/50 transition-all group"
               >
                 <Input 
                   placeholder="Type an encrypted message..." 
                   className="border-none bg-transparent h-12 text-[15px] font-medium focus-visible:ring-0 placeholder:text-slate-400"
                   value={msgInput}
                   onChange={e => setMsgInput(e.target.value)}
                 />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 relative" ref={plusMenuRef}>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className={cn("w-9 h-9 transition-colors", showPlusMenu ? "text-primary bg-blue-50" : "text-slate-400")}
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                      >
                        <Plus size={20} />
                      </Button>

                      <AnimatePresence>
                        {showPlusMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute left-0 bottom-full mb-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-2 z-50"
                          >
                            <div className="px-3 py-1.5 mb-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add context</span>
                            </div>
                            <button 
                              type="button"
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-700 font-semibold text-sm group"
                              onClick={() => { 
                                setShowPlusMenu(false); 
                                onSendMessage("[PHOTO_UPLOAD_REQUEST]"); 
                              }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                <ImageIcon size={16} />
                              </div>
                              Media
                            </button>
                            <button 
                              type="button"
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-700 font-semibold text-sm group"
                              onClick={() => { 
                                setShowPlusMenu(false); 
                                onSendMessage("[TRANSACTION_SIGNAL_INIT]"); 
                              }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                <Send size={16} />
                              </div>
                              Transaction
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <Button 
                      disabled={!msgInput.trim()} 
                      className="rounded-xl px-6 h-11 font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                      <span className="text-white">Send Message</span>
                      <Send className="w-4 h-4 ml-2 text-white" />
                    </Button>
                  </div>
               </form>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
             {/* Decorative background elements */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[60px] pointer-events-none" />

             <div className="w-28 h-28 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200/40 relative z-10">
                <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center">
                   <MessageSquare className="w-8 h-8 text-primary" />
                </div>
             </div>
             
             <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3 relative z-10">Initialize Contact</h3>
             <p className="text-slate-500 font-medium max-w-sm leading-relaxed text-[15px] relative z-10">
                Select a conversation from the sidebar to establish a secure, encrypted industrial link.
             </p>
          </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatListItem({ chat, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 w-full p-4 rounded-2xl transition-all duration-200 relative group text-left",
        isActive 
          ? "bg-white border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-100 z-10" 
          : "hover:bg-slate-100 border-transparent border"
      )}
    >
      <div className="relative shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 text-[15px] border border-slate-100", 
          isActive 
            ? "bg-primary text-white" 
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        )}>
          {chat.name?.[0] || chat.avatar}
        </div>
        {chat.online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h5 className={cn(
            "font-bold truncate pr-3 text-[15px] tracking-tight", 
            isActive ? "text-slate-900" : "text-slate-700"
          )}>
            {chat.name}
          </h5>
          <span className={cn(
            "text-[10px] whitespace-nowrap uppercase tracking-wider font-semibold",
            isActive ? "text-primary/80" : "text-slate-400"
          )}>
            {chat.time}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-[13px] truncate pr-2 tracking-wide", 
            isActive ? "text-slate-500 font-medium" : "text-slate-400"
          )}>
            {chat.lastMsg || chat.specialty}
          </p>
          {chat.unread > 0 && (
            <div className="shrink-0 ml-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center shadow-sm">
              {chat.unread}
            </div>
          )}
        </div>
      </div>
      {isActive && (
        <motion.div 
          layoutId="chat-pointer"
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full"
        />
      )}
    </button>
  );
}

function MessageBubble({ msg, isMine, prevMsg }) {
  const currentSender = msg.sender || msg.senderId;
  const prevSender = prevMsg?.sender || prevMsg?.senderId;
  const showAvatar = currentSender !== prevSender;
  
  return (
    <div className={cn("flex w-full group", isMine ? "justify-end" : "justify-start")}>
       <div className={cn("flex gap-3 max-w-[70%]", isMine && "flex-row-reverse")}>
          {!isMine && (
             <div className={cn(
               "w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-[11px] font-bold mt-auto transition-opacity duration-300", 
               showAvatar ? "bg-slate-200 text-slate-600 opacity-100" : "opacity-0"
             )}>
                {msg.senderName?.[0] || "?"}
             </div>
          )}
          
          <div className={cn("relative flex flex-col", isMine ? "items-end" : "items-start")}>
             <div className={cn(
               "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm relative transition-all duration-200",
               isMine 
                 ? "bg-primary text-white rounded-[24px] rounded-br-[8px]" 
                 : "bg-[#f1f5f9] text-[#1e293b] rounded-[24px] rounded-bl-[8px]"
             )}>
                <span className="block mb-4">{msg.text || msg.message}</span>
                
                {/* Time & Status overlay inside bubble */}
                <div className={cn(
                  "absolute bottom-1.5 flex items-center gap-1",
                  isMine ? "right-3 text-white/90" : "right-3 text-slate-500"
                )}>
                   <span className="text-[10px] font-bold uppercase tracking-wider">
                     {msg.time || "10:24 AM"}
                   </span>
                   {isMine && <CheckCheck size={11} className="ml-0.5" />}
                </div>
             </div>
             
             {showAvatar && !isMine && msg.senderName && (
               <span className="text-[11px] font-semibold text-slate-400 mt-2 ml-2 tracking-wide">
                 {msg.senderName}
               </span>
             )}
          </div>
       </div>
    </div>
  );
}

function MessageSquare(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
