/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Shield, 
  User, 
  MessageSquare, 
  Search, 
  X, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Droplets,
  Zap,
  Navigation,
  Loader2
} from 'lucide-react';
import { getWellnessAdvice } from './services/geminiService';

// --- Types ---
type AppState = 'idle' | 'finding' | 'peer-chat';
type Tab = 'home' | 'community' | 'ai';
type ChatMessage = { role: 'user' | 'ai' | 'peer'; content: string; sender?: string };
type Question = { id: string; user: string; text: string; time: string; replies: number };

// --- Components ---
// ... (rest of the components stay same, except specific chat logic)

const Navbar = ({ onProfile }: { onProfile?: () => void }) => (
  <nav className="fixed top-0 left-0 w-full h-16 px-10 flex items-center justify-between z-50 bg-white/40 backdrop-blur-md border-b border-sia-pink-light">
    <div className="text-2xl font-bold tracking-tighter text-sia-pink font-serif italic">SIA</div>
    <div className="flex items-center gap-6">
      <div className="w-10 h-10 rounded-full border-2 border-white bg-sia-pink-light shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={onProfile}>
        <User className="w-5 h-5 text-sia-pink opacity-60" />
      </div>
    </div>
  </nav>
);

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: Shield, label: 'Home' },
    { id: 'community', icon: MessageSquare, label: 'Arin' },
    { id: 'ai', icon: Sparkles, label: 'AI' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full px-6 pb-6 z-50 pointer-events-none">
      <div className="max-w-md mx-auto h-16 glass rounded-full shadow-lg border border-white/40 flex items-center justify-around pointer-events-auto px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === tab.id ? 'text-sia-pink scale-110' : 'text-sia-text-muted opacity-40'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-sia-pink/10' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="nav-dot" className="w-1 h-1 bg-sia-pink rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const PeerChat = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'peer', content: 'Hi, I saw your request for pads. I am nearby in Block C. Where should I meet you?', sender: 'Anonymous sister' }
  ]);
  const [input, setInput] = useState('');

  const sendMsg = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed inset-0 z-[100] bg-sia-cream flex flex-col"
    >
      <div className="h-20 px-6 flex items-center justify-between border-b border-sia-pink-light bg-white">
        <button onClick={onBack} className="p-2"><X className="w-6 h-6 text-sia-text-muted" /></button>
        <div className="text-center">
          <div className="text-sm font-bold text-sia-text uppercase tracking-widest">SIA SECURE CHAT</div>
          <div className="text-[10px] text-green-500 font-bold uppercase">Connected Anonymously</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-sia-pink-light flex items-center justify-center">
          <User className="w-5 h-5 text-sia-pink" />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-[1.5rem] shadow-sm ${
              m.role === 'user' ? 'bg-sia-pink text-white rounded-br-none' : 'bg-white text-sia-text rounded-tl-none border border-sia-pink-light'
            }`}>
              {m.sender && <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{m.sender}</div>}
              <p className="text-sm">{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMsg} className="p-6 bg-white border-t border-sia-pink-light">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full h-14 bg-sia-warm-bg rounded-full px-6 pr-14 focus:outline-none border border-sia-pink-light"
          />
          <button className="absolute right-2 top-2 w-10 h-10 rounded-full bg-sia-pink flex items-center justify-center text-white">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-sia-text-muted uppercase tracking-widest opacity-40">This chat self-destructs after completion</p>
        </div>
      </form>
    </motion.div>
  );
};

const SOSModal = ({ onClose, onSelect }: { onClose: () => void, onSelect: (opt: string) => void }) => {
  const options = [
    { id: 'pads', icon: Droplets, title: 'Menstrual Supplies', desc: 'Need sanitary support nearby', accent: 'bg-sia-pink-light', iconColor: 'text-sia-pink' },
    { id: 'pain', icon: Zap, title: 'Pain Relief', desc: 'Looking for quick cramp relief', accent: 'bg-[#F3E5F5]', iconColor: 'text-[#9C27B0]' },
    { id: 'escort', icon: Navigation, title: 'Safe Escort', desc: 'Need someone to walk with you safely', accent: 'bg-[#E8F5E9]', iconColor: 'text-[#2E7D32]' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white rounded-t-[3rem] p-8 pb-12 shadow-[0_-10px_50px_rgba(0,0,0,0.1)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-[#FCE4EC] rounded-full mx-auto mb-10" />
        <h3 className="font-serif italic font-bold text-3xl text-center mb-2 text-sia-text">How can we help?</h3>
        <p className="text-sia-text-muted text-center mb-8 px-4 font-light">Your request will be broadcasted anonymously to nearby verified women.</p>
        
        <div className="grid grid-cols-1 gap-4">
          {options.map((opt) => (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(opt.title)}
              className="w-full p-4 rounded-[2.5rem] flex items-center gap-5 text-left border border-sia-pink-light hover:shadow-lg hover:border-sia-pink transition-all bg-white group"
            >
              <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${opt.accent} transition-transform group-hover:scale-110`}>
                <opt.icon className={`w-6 h-6 ${opt.iconColor}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{opt.title}</h4>
                <p className="text-sia-text-muted text-sm font-light">{opt.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-sia-pink opacity-30" />
            </motion.button>
          ))}
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 p-3 rounded-full bg-sia-cream text-sia-pink-light hover:text-sia-pink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  );
};

const WaitingScreen = ({ onCancel, onMatchFound }: { onCancel: () => void, onMatchFound: () => void }) => {
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatchFound(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center bg-sia-cream">
      <div className="relative mb-12">
        <div className="absolute inset-0 w-80 h-80 -left-8 -top-8 border border-sia-pink/10 rounded-full opacity-50" />
        <div className="absolute inset-0 w-64 h-64 border border-sia-pink/20 rounded-full opacity-40" />
        
        <div className={`w-48 h-48 rounded-full bg-gradient-to-br transition-all duration-700 ${matchFound ? 'from-green-400 to-green-600 scale-110 shadow-[0_20px_60px_rgba(34,197,94,0.3)]' : 'from-sia-peach to-sia-pink shadow-[0_20px_50px_rgba(216,27,96,0.3)] pulsate'} flex flex-col items-center justify-center text-white border-4 border-white/20 z-10 relative`}>
          {matchFound ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Shield className="w-12 h-12 text-white mb-2" />
              <span className="font-bold tracking-widest text-xl">FOUND</span>
            </motion.div>
          ) : (
            <>
              <Sparkles className="w-12 h-12 text-white mb-2" />
              <span className="font-bold tracking-widest text-xl">SIA</span>
            </>
          )}
        </div>

        {!matchFound && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
// ... (rest of matching dots)
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 1.2],
              x: Math.random() * 260 - 130,
              y: Math.random() * 260 - 130
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "easeOut"
            }}
            className="absolute top-1/2 left-1/2"
          >
            <Heart className="w-4 h-4 text-sia-pink fill-sia-pink/20" />
          </motion.div>
        ))}
      </div>
      
      <h2 className="font-serif italic text-4xl text-center mb-3 text-sia-text">
        {matchFound ? 'Sister found!' : 'Finding support...'}
      </h2>
      <p className="text-sia-text-muted text-center mb-8 max-w-sm font-light">
        {matchFound ? 'A nearby sister has confirmed she can help.' : 'Connecting you with verified sisters nearby. Your identity remains private throughout.'}
      </p>
      
      {!matchFound && (
        <div className="bg-white/40 backdrop-blur-md px-6 py-4 rounded-full flex items-center gap-3 mb-12 border border-sia-pink-light shadow-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-bold opacity-60">Searching within ~300m</span>
        </div>
      )}
      
      {matchFound ? (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={onMatchFound}
          className="w-full max-w-xs h-16 rounded-full bg-green-500 text-white font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-4 hover:bg-green-600 transition-colors"
        >
          Receive Help <ArrowRight className="w-5 h-5" />
        </motion.button>
      ) : (
        <div className="w-full max-w-xs p-8 rounded-[3rem] border border-dashed border-sia-pink-light bg-white/20 text-center mb-12">
          <Shield className="w-6 h-6 text-sia-pink mx-auto mb-3 opacity-40" />
          <p className="text-[10px] text-sia-text-muted leading-relaxed uppercase tracking-[0.2em] font-bold">Privacy Locked: Location masked</p>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
        {!matchFound && (
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#fff' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-full bg-white/60 border border-sia-pink-light shadow-sm font-bold text-sia-pink h-14 uppercase tracking-widest text-xs"
          >
            Stay Safe
          </motion.button>
        )}
        <button 
          onClick={onCancel}
          className="w-full py-2 text-[10px] text-sia-pink opacity-40 uppercase tracking-widest font-bold hover:opacity-100 transition-opacity"
        >
          {matchFound ? 'Cancel Match' : 'Cancel Request'}
        </button>
      </div>
    </div>
  );
};

const SectionHeading = ({ title, subtitle, className = "" }: { title: string, subtitle: string, className?: string }) => (
  <div className={`text-center mb-12 ${className}`}>
    <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-sia-text mb-4 tracking-tight">{title}</h2>
    <p className="text-sia-text-muted max-w-xl mx-auto font-light leading-relaxed">{subtitle}</p>
  </div>
);

const ChatBubble = ({ message, isAI = false }: { message: string, isAI?: boolean }) => (
  <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
    <div className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] shadow-sm flex items-start gap-3 ${
      isAI ? 'bg-sia-cream rounded-tl-none text-sia-text border border-sia-pink-light/30' : 'bg-sia-pink-light rounded-br-none text-sia-text'
    }`}>
      {isAI && <div className="w-2 h-2 rounded-full bg-sia-pink mt-1.5 shrink-0" />}
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  </div>
);

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Hello! I'm SIA Wellness AI. How can I help you feel better today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', user: 'Anonymous', text: 'What helps with painful cramps in hostel?', time: '2m ago', replies: 3 },
    { id: '2', user: 'Anonymous', text: 'Safe workout suggestions while on period?', time: '15m ago', replies: 1 },
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async (msg?: string) => {
    const textToSend = msg || userInput;
    if (!textToSend.trim()) return;

    const newUserMsg: ChatMessage = { role: 'user', content: textToSend };
    setChatMessages(prev => [...prev, newUserMsg]);
    if (!msg) setUserInput('');
    setIsTyping(true);

    const aiResponse = await getWellnessAdvice(textToSend);
    setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setIsTyping(false);
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const q: Question = {
      id: Date.now().toString(),
      user: 'Anonymous',
      text: newQuestion,
      time: 'Just now',
      replies: 0
    };
    setQuestions([q, ...questions]);
    setNewQuestion('');
  };

  const handleSOSClick = () => {
    setShowSOSModal(true);
  };

  const handleSelectOption = (option: string) => {
    setShowSOSModal(false);
    setAppState('finding');
  };

  if (appState === 'peer-chat') {
    return <PeerChat onBack={() => { setAppState('idle'); setActiveTab('home'); }} />;
  }

  if (appState === 'finding') {
    return (
      <div className="min-h-screen font-sans bg-sia-cream">
        <Navbar />
        <WaitingScreen 
          onCancel={() => setAppState('idle')} 
          onMatchFound={() => setAppState('peer-chat')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-sia-cream selection:bg-sia-pink-light overflow-x-hidden pb-32">
      <Navbar />
      
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Hero Section */}
            <section id="hero" className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-sia-pink-light/30 rounded-full blur-[120px] -mr-60 -mt-60" />
              <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-sia-pink-light/20 rounded-full blur-[100px] -ml-60 -mb-60" />
              
              <div className="max-w-6xl mx-auto w-full relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center lg:text-left space-y-8"
                  >
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-sia-pink-light text-sia-pink text-[10px] uppercase font-bold tracking-[0.2em] shadow-sm">
                       <Shield className="w-3 h-3" /> Anonymous Peer Network
                    </div>
                    <h1 className="font-serif italic font-bold text-7xl md:text-9xl text-sia-text !leading-[0.85] tracking-tight">
                      You’re not<br/> <span className="text-sia-pink">alone</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-sia-text-muted max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                      Private support during period emergencies — without the discomfort of asking.
                    </p>
                  </motion.div>

                  {/* SOS Button Area */}
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                     <div className="absolute w-[30rem] h-[30rem] border border-sia-pink/5 rounded-full animate-pulse" />
                     <div className="absolute w-[24rem] h-[24rem] border border-sia-pink/10 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
                     
                     <div className="relative">
                        <motion.button
                          id="sos-button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSOSClick}
                          className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-sia-peach to-sia-pink shadow-[0_20px_60px_rgba(216,27,96,0.4)] flex flex-col items-center justify-center text-white border-[10px] border-white group z-10"
                        >
                          <Heart className="w-12 h-12 text-white mb-4 fill-white animate-bounce" />
                          <span className="font-bold text-5xl md:text-6xl tracking-[0.2em] drop-shadow-md">HELP</span>
                          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                        
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full text-center">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sia-pink opacity-40">Tap to request support anonymously</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 px-6 max-w-4xl mx-auto"
          >
            <SectionHeading 
              title="ARIN Community"
              subtitle="Ask your region anonymously. Verified sisters nearby are ready to share their wisdom."
            />

            {/* Ask Question Box */}
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-sia-pink-light mb-12">
              <form onSubmit={handlePostQuestion} className="space-y-4">
                <textarea 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="What's on your mind? Ask anonymously in your region..."
                  className="w-full h-32 p-6 bg-sia-cream rounded-[2rem] border border-sia-pink-light/30 focus:outline-none focus:ring-2 focus:ring-sia-pink transition-all text-sm font-light resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sia-text opacity-40">
                    <MapPin className="w-3 h-3 text-sia-pink" /> Broadcasting to Central Region
                  </div>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-sia-pink text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-sia-pink-dark transition-colors"
                  >
                    Post Question
                  </button>
                </div>
              </form>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-sia-text opacity-40">Questions Nearby</h3>
                <div className="text-[10px] text-sia-pink font-bold uppercase">Live Updates</div>
              </div>
              {questions.map((q) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-[2.5rem] bg-white border border-sia-pink-light shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-sia-pink" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sia-pink opacity-40">{q.user}</span>
                    <span className="text-[10px] text-gray-300 font-bold uppercase ml-auto">{q.time}</span>
                  </div>
                  <h4 className="font-serif italic font-bold text-gray-800 text-lg leading-tight mb-8">“{q.text}”</h4>
                  <div className="flex items-center justify-between pt-6 border-t border-dashed border-sia-pink-light">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-sia-pink opacity-40" />
                      <span className="text-[10px] font-bold text-sia-text-muted">{q.replies} Replies</span>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-sia-pink hover:underline">Respond Anonymously</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 px-6 max-w-4xl mx-auto flex flex-col items-center"
          >
            <SectionHeading 
              title="SIA Wellness AI"
              subtitle="Indian home remedies, comfort tips, and period wellness guidance inspired by real experiences."
            />

            <div className="w-full max-w-2xl bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-sia-pink-light flex flex-col min-h-[600px] mb-20">
              <div className="flex items-center gap-4 mb-10 p-5 rounded-[2rem] bg-sia-cream border border-sia-pink-light/30">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sia-peach to-sia-pink flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sia-text italic font-serif">SIA Companion</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-500">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     Ready to support
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6 mb-8 overflow-y-auto scrollbar-hide">
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={i} isAI={msg.role === 'ai'} message={msg.content} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-sia-cream px-5 py-3 rounded-[1.5rem] rounded-tl-none border border-sia-pink-light/30 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-sia-pink animate-spin" />
                      <span className="text-[10px] text-sia-text-muted font-bold uppercase tracking-widest">Sia is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex flex-wrap gap-2">
                  {['Ajwain water relief', 'Ginger tea for cramps', 'Comfort yoga poses'].map((item) => (
                    <button 
                      key={item} 
                      onClick={() => handleSendMessage(item)}
                      className="px-4 py-2 rounded-full bg-sia-pink-light/30 border border-sia-pink-light hover:bg-sia-pink-light transition-colors text-[10px] font-bold uppercase tracking-widest text-sia-pink shadow-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <form 
                  className="relative"
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                >
                  <input 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask Sia anything about period wellness..." 
                    disabled={isTyping}
                    className="w-full bg-sia-warm-bg border border-sia-pink-light h-16 rounded-full px-8 pr-16 focus:outline-none focus:ring-2 focus:ring-sia-pink shadow-inner transition-all disabled:opacity-50 text-sm font-light"
                  />
                  <button 
                    type="submit"
                    disabled={isTyping}
                    className="absolute right-3 top-3 w-10 h-10 rounded-full bg-sia-pink flex items-center justify-center text-white shadow-lg hover:bg-sia-pink-light hover:text-sia-pink transition-all disabled:bg-gray-200"
                  >
                    <ArrowRight className="w-5 h-5 ghost-pulse" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />


      {/* Impact & About Split Footer Look */}
      <section id="mission" className="py-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
           <div className="flex-[1.5] p-12 md:p-20 bg-white border border-sia-pink-light rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0">
                 <Heart className="w-64 h-64 text-sia-pink fill-sia-pink" />
              </div>
              <h2 className="font-serif italic font-bold text-5xl md:text-6xl mb-12 text-sia-text leading-tight">The Power of<br/>Solidarity</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                 <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="text-7xl font-display font-semibold text-sia-pink mb-4 tracking-tighter">175M+</div>
                    <p className="text-sia-text-muted font-bold leading-relaxed uppercase tracking-[0.2em] text-[10px] opacity-60">Women face monthly emergencies in India</p>
                 </motion.div>
                 <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="text-7xl font-display font-semibold text-sia-pink mb-4 tracking-tighter">Instant</div>
                    <p className="text-sia-text-muted font-bold leading-relaxed uppercase tracking-[0.2em] text-[10px] opacity-60">Anonymous help available with just one tap</p>
                 </motion.div>
              </div>
              
              <div className="mt-16 pt-16 border-t border-dashed border-sia-pink-light">
                 <p className="text-2xl font-serif italic text-sia-text-muted mb-8 italic">"Because asking shouldn't be the hardest part."</p>
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-sia-warm-bg overflow-hidden shadow-sm">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=sister${i}`} alt="user" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sia-text opacity-40">Verified Support Network</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 flex flex-col gap-8">
              <div className="flex-1 p-10 bg-sia-warm-bg border border-sia-pink-light rounded-[3rem] flex flex-col justify-center">
                 <Shield className="w-10 h-10 text-sia-pink mb-6 opacity-30" />
                 <h3 className="font-bold text-xl mb-4 text-sia-text uppercase tracking-widest">Our Mission</h3>
                 <p className="text-sia-text-muted font-light text-sm leading-relaxed">
                    SIA creates a dignified path to support. By anonymizing the request and masking the location, we dissolve the social friction that prevents women from getting help when they need it most.
                 </p>
              </div>
              <div className="flex-1 p-10 bg-sia-pink text-white rounded-[3rem] flex flex-col justify-center relative overflow-hidden group">
                 <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                 <h3 className="font-bold text-xl mb-4 uppercase tracking-widest">Join the Network</h3>
                 <p className="text-white/80 font-light text-sm leading-relaxed mb-8">
                    Become part of a movement that prioritizes safety and human connection. Register as a verified sister today.
                 </p>
                 <button className="w-fit px-8 py-3 bg-white text-sia-pink rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform">
                    Register Now
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* Footer Look-alike from design */}
      <footer className="h-16 bg-white border-t border-sia-pink-light px-10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sia-text opacity-40">
           <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
           Searching for support within ~300m
        </div>
        <div className="text-[10px] font-bold text-sia-pink opacity-40 italic font-serif">Created with care for her dignity and safety</div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showSOSModal && (
          <SOSModal 
            onClose={() => setShowSOSModal(false)} 
            onSelect={handleSelectOption}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
