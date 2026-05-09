import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "./services/firebaseConfig";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, User, Shield, CheckCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

function ChatRoom({ 
  roomId, 
  currentUser, 
  peerName, 
  isRequester,
  onBack,
  onEndSession 
}: { 
  roomId: string, 
  currentUser: string, 
  peerName?: string | null, 
  isRequester?: boolean,
  onBack: () => void,
  onEndSession?: () => Promise<void>
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // REALTIME LISTENER
  useEffect(() => {
    if (!db || !roomId) return;
    
    console.log("🔗 Connecting to Chat Room:", roomId);
    
    const q = query(
      collection(db, "chat_rooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
    }, (error) => {
      console.error("❌ Chat Listener Error:", error);
    });

    return () => unsubscribe();
  }, [roomId]);

  // SCROLL TO BOTTOM
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !db || !roomId) return;

    const text = message.trim();
    setMessage(""); // Clear immediately for UX

    try {
      await addDoc(collection(db, "chat_rooms", roomId, "messages"), {
        text,
        senderId: currentUser,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to end this session? All messages will be permanently deleted for privacy.")) {
      if (onEndSession) {
        await onEndSession();
      }
      
      try {
        // Cleanup chat data
        const snapshot = await getDocs(collection(db, "chat_rooms", roomId, "messages"));
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, "chat_rooms", roomId));
        
        onBack();
      } catch (error) {
        console.error("❌ Cleanup error:", error);
        onBack(); // Go back anyway
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 z-[200] bg-sia-cream flex flex-col"
    >
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-sia-pink-light bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-sia-pink-light rounded-full transition-colors group"
        >
          <X className="w-6 h-6 text-sia-text-muted group-hover:text-sia-pink" />
        </button>
        
        <div className="text-center">
          <div className="text-sm font-black text-sia-text tracking-[0.2em] uppercase mb-0.5">
            Secure Session
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Connected Anonymously</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-sia-pink-light flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-sia-pink" />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-white/40 border-b border-sia-pink-light/30 px-6 py-2 flex items-center justify-center gap-2">
        <Shield className="w-3 h-3 text-sia-pink/40" />
        <span className="text-[9px] uppercase tracking-widest font-bold text-sia-text/40">Ephemeral Connection • Verified Support</span>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#ffe4e6_1px,transparent_1px)] [background-size:20px_20px]"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10 opacity-40">
              <div className="w-16 h-16 rounded-full bg-sia-pink-light/30 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-sia-pink" />
              </div>
              <p className="text-sm font-medium text-sia-text max-w-xs">Your secure session has started. All messages will be deleted once the session ends.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.senderId === currentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] group`}>

                  <div className={`
                    p-4 rounded-[2rem] shadow-sm text-sm leading-relaxed
                    ${msg.senderId === currentUser 
                      ? 'bg-sia-pink text-white rounded-br-none' 
                      : 'bg-white text-sia-text border border-sia-pink-light rounded-tl-none'}
                  `}>
                    {msg.text}
                  </div>
                  <div className={`text-[8px] mt-1 uppercase font-bold tracking-widest opacity-30 ${msg.senderId === currentUser ? 'text-right mr-4' : 'ml-4'}`}>
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-sia-pink-light">
        <form onSubmit={sendMessage} className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-16 bg-sia-warm-bg rounded-[2rem] px-8 pr-14 focus:outline-none border-2 border-transparent focus:border-sia-pink/20 transition-all text-sia-text font-medium"
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className="absolute right-2 top-2 w-12 h-12 rounded-full bg-sia-pink text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {isRequester && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-sia-pink/40 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" /> Help Received?
            </p>
            <button 
              onClick={handleEndSession}
              className="text-[9px] uppercase tracking-[0.2em] font-black text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-full border border-red-100"
            >
              End Session & Delete Data
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ChatRoom;