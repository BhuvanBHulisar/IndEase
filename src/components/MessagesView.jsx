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
  CheckCheck,
  MessageSquare,
  Paperclip,
  Activity,
  Zap,
  ShieldCheck
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
    <div className="h-[calc(100vh-16rem)] flex bg-white border border-slate-200/60 rounded-[1.5rem] overflow-hidden shadow-sm relative animate-fade-in no-scrollbar">
      {/* Sidebar - Contacts Ecosystem */}
      <div className="w-80 lg:w-96 flex flex-col border-r border-slate-100 bg-slate-50/50">
        <div className="p-8 border-b border-slate-100">
           <div className="flex items-center justify-between mb-8">
             <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Directives</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Comms Terminal</p>
             </div>
             <button className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">
               <Plus size={20} strokeWidth={2.5} />
             </button>
           </div>
           
           <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                 <Search size={16} strokeWidth={2.5} />
              </div>
              <input 
                placeholder="Query personnel..." 
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition-all" 
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
           {chats.map(chat => (
             <ChatListItem 
               key={chat.id} 
               chat={chat} 
               isActive={activeChatId === chat.id}
               onClick={() => setActiveChatId(chat.id)}
             />
           ))}
           {chats.length === 0 && (
             <div className="py-24 text-center px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <MessageSquare className="text-slate-300" size={24} />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No Authorized Channels Established</h4>
             </div>
           )}
        </div>
        
        {/* Status Hub Mini */}
        <div className="p-6 border-t border-slate-100 bg-white">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Gateway Verified</span>
              </div>
              <Zap size={14} className="text-yellow-500" />
           </div>
        </div>
      </div>

      {/* Primary Message Hub */}
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
            {/* Direct Channel Header */}
            <div className="h-24 border-b border-slate-100 flex items-center justify-between px-10 bg-white z-10 shrink-0">
               <div className="flex items-center gap-4">
                   <div className="relative group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        {activeChat.name?.[0] || 'U'}
                      </div>
                      {activeChat.online && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />}
                   </div>
                  <div className="flex flex-col">
                    <h4 className="font-black text-slate-900 tracking-tight text-[16px] leading-none mb-1">{activeChat.name}</h4>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50/50 rounded-lg w-fit">
                       <ShieldCheck size={10} className="text-blue-600" />
                       <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Secure Link Established</span>
                    </div>
                  </div>
               </div>
               
                <div className="flex items-center gap-2">
                   <button className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all border border-transparent hover:border-slate-100"><Phone size={18} strokeWidth={2.5} /></button>
                   <button className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all border border-transparent hover:border-slate-100"><Video size={18} strokeWidth={2.5} /></button>
                   <button className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all border border-transparent hover:border-slate-100"><Info size={18} strokeWidth={2.5} /></button>
                </div>
            </div>

            {/* Conversation Core */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-50/20">
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

            {/* Terminal Input Segment */}
            <div className="p-8 bg-white border-t border-slate-100 shrink-0">
               <form 
                 onSubmit={(e) => {
                   e.preventDefault();
                   if (msgInput.trim()) {
                     onSendMessage(msgInput);
                     setMsgInput('');
                   }
                 }}
                 className="flex items-center gap-4"
               >
                 <div className="relative" ref={plusMenuRef}>
                    <button 
                      type="button" 
                      onClick={() => setShowPlusMenu(!showPlusMenu)}
                      className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 flex items-center justify-center transition-all group"
                    >
                      <Paperclip size={20} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    <AnimatePresence>
                      {showPlusMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          className="absolute left-0 bottom-full mb-4 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 ring-1 ring-black/5"
                        >
                          <button type="button" className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest transition-all">
                            <ImageIcon size={14} className="text-blue-500" strokeWidth={2.5} /> Image Bundle
                          </button>
                          <button type="button" className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest transition-all">
                            <Send size={14} className="text-emerald-500" strokeWidth={2.5} /> Send Dispatch
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 <input 
                   placeholder="Enter encrypted dispatch..." 
                   className="flex-1 h-12 bg-slate-50 border border-slate-100 rounded-xl px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none placeholder:text-slate-400 placeholder:font-medium"
                   value={msgInput}
                   onChange={e => setMsgInput(e.target.value)}
                 />
                 
                 <button 
                   type="submit"
                   disabled={!msgInput.trim()} 
                   className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all disabled:opacity-50 flex items-center gap-3"
                 >
                   <span>Dispatch</span>
                   <Send size={14} strokeWidth={3} />
                 </button>
               </form>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="relative mb-10">
                <div className="absolute inset-0 bg-blue-600/5 rounded-full animate-ping scale-150" />
                <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2rem] shadow-xl flex items-center justify-center relative z-10">
                   <MessageSquare className="text-blue-600" size={40} strokeWidth={2.5} />
                </div>
             </div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Select Communication Line</h3>
             <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                Authorized channels for expert troubleshooting and fleet coordination are waiting for your initiation.
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
        "flex items-center gap-4 w-full p-4 rounded-2xl transition-all text-left group relative",
        isActive 
          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/10" 
          : "hover:bg-white hover:shadow-sm"
      )}
    >
      <div className="relative shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs border transition-all", 
          isActive 
            ? "bg-white/20 text-white border-white/20" 
            : "bg-white border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600 shadow-sm"
        )}>
          {chat.name?.[0] || 'U'}
        </div>
        {chat.online && (
          <span className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
            isActive ? "bg-white" : "bg-emerald-500"
          )} />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h5 className={cn(
            "font-black truncate text-[14px] tracking-tight transition-colors", 
            isActive ? "text-white" : "text-slate-900 group-hover:text-blue-600"
          )}>
            {chat.name}
          </h5>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            isActive ? "text-white/60" : "text-slate-400"
          )}>{chat.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-xs truncate font-bold tracking-tight", 
            isActive ? "text-white/80" : "text-slate-500"
          )}>
            {chat.lastMsg || chat.specialty}
          </p>
          {chat.unread > 0 && (
            <div className={cn(
              "shrink-0 ml-2 text-[9px] font-black px-2 py-0.5 rounded-lg min-w-[20px] text-center shadow-sm",
              isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
            )}>
              {chat.unread}
            </div>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
      )}
    </button>
  );
}

function MessageBubble({ msg, isMine, prevMsg }) {
  const currentSender = msg.sender || msg.senderId;
  const prevSender = prevMsg?.sender || prevMsg?.senderId;
  const showAvatar = currentSender !== prevSender;
  
  return (
    <div className={cn("flex w-full group/msg", isMine ? "justify-end" : "justify-start")}>
       <div className={cn("flex gap-4 max-w-[80%]", isMine ? "flex-row-reverse" : "flex-row")}>
          {!isMine && (
             <div className={cn(
               "w-10 h-10 rounded-xl flex shrink-0 items-center justify-center text-[10px] font-black mt-auto border border-slate-200 bg-white shadow-sm text-slate-400 group-hover/msg:border-blue-200 group-hover/msg:text-blue-600 transition-colors", 
               showAvatar ? "opacity-100 scale-100" : "opacity-0 scale-95"
             )}>
                {msg.senderName?.[0] || "?"}
             </div>
          )}
          
          <div className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
             <div className={cn(
               "px-6 py-4 relative shadow-sm transition-all group-hover/msg:shadow-md",
               isMine 
                 ? "bg-slate-900 text-white rounded-[1.5rem] rounded-tr-sm" 
                 : "bg-white text-slate-700 rounded-[1.5rem] rounded-tl-sm border border-slate-100"
             )}>
                <span className="text-[14px] font-bold leading-relaxed tracking-tight block">
                   {msg.text || msg.message}
                </span>
                <div className={cn(
                  "flex items-center gap-2 mt-4 justify-end opacity-40 group-hover/msg:opacity-80 transition-opacity",
                  isMine ? "text-white" : "text-slate-400"
                )}>
                   <span className="text-[9px] font-black uppercase tracking-widest">{msg.time || "10:24 AM"}</span>
                   {isMine && <CheckCheck size={10} strokeWidth={3} />}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
