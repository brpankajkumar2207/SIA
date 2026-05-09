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
  Loader2,
  Clock,
  AlertTriangle,
  MessageCircle,
  Coffee,
  HeartHandshake,
  Stethoscope,
  Brain,
  Settings,
  LogOut,
  Bell,
  Moon,
  Sun,
  CheckCircle,
  Award,
  Bookmark,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { askSakhiKnows } from './services/sakhiAI';



// --- Types ---
type AppState = 'idle' | 'finding' | 'peer-chat';
type AppView = 'main' | 'profile' | 'settings';
type Tab = 'home' | 'arin' | 'sakhi' | 'capsule';
type ChatMessage = { role: 'user' | 'ai' | 'peer'; content: string; sender?: string };
type Question = { id: string; user: string; text: string; time: string; replies: number };

// --- Components ---
// ... (rest of the components stay same, except specific chat logic)

const Navbar = ({ onProfile, onBack, showBack = false, activeView }: { onProfile?: () => void; onBack?: () => void; showBack?: boolean; activeView: AppView }) => (
  <nav className="fixed top-0 left-0 w-full h-20 px-10 flex items-center justify-between z-[100] bg-white/40 backdrop-blur-md border-b border-sia-pink-light">
    <div className="flex items-center gap-4">
      {showBack && (
        <button onClick={onBack} className="p-2 hover:bg-sia-pink-light rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 text-sia-pink rotate-180" />
        </button>
      )}
      <div className="text-2xl font-bold tracking-tighter text-sia-pink font-serif italic">SIA</div>
    </div>
    <div className="flex items-center gap-6">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-11 h-11 rounded-full border-2 border-white glass shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 group relative
          ${activeView !== 'main' ? 'bg-sia-pink/10 ring-4 ring-sia-pink/5' : 'bg-sia-pink-light hover:bg-white'}`}
        onClick={onProfile}
      >
        <div className="absolute inset-0 rounded-full bg-sia-pink/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        <User className={`w-5 h-5 transition-colors ${activeView !== 'main' ? 'text-sia-pink' : 'text-sia-pink/60'}`} />
      </motion.div>
    </div>
  </nav>
);


const ProfileMenu = ({ onClose, onNavigate }: { onClose: () => void, onNavigate: (view: AppView | 'logout') => void }) => {
  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile', desc: 'Personal details, trust level, and activity' },
    { id: 'settings', icon: Settings, label: 'Settings', desc: 'Privacy, notifications, and preferences' },
    { id: 'logout', icon: LogOut, label: 'Logout', desc: 'Securely sign out from SIA', isDestructive: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-24 right-10 z-[110] w-80 glass rounded-[2.5rem] shadow-2xl border border-white/60 p-4 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sia-pink/5 to-transparent pointer-events-none" />
      <div className="relative space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'logout') {
                onNavigate('logout'); // Signal logout trigger
              } else {
                onNavigate(item.id as AppView);
              }
              onClose();
            }}
            className="w-full p-4 rounded-[1.8rem] flex items-center gap-4 text-left transition-all hover:bg-white/60 group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 
              ${item.isDestructive ? 'bg-red-50 text-red-500' : 'bg-sia-warm-bg text-sia-pink'}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold uppercase tracking-widest ${item.isDestructive ? 'text-red-500' : 'text-sia-text'}`}>{item.label}</h4>
              <p className="text-[10px] text-sia-text-muted font-light leading-tight mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-sia-text opacity-20" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const ProfilePage = () => {
  const stats = [
    { label: 'Saved Remedies', value: '12', icon: Bookmark, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Time Capsules', value: '4', icon: Heart, color: 'text-sia-pink', bg: 'bg-sia-pink-light/30' },
    { label: 'Contributions', value: '28', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Wellness Streak', value: '7 Days', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto pb-40">
      <div className="flex flex-col md:flex-row items-center gap-10 mb-20 bg-white/40 p-10 rounded-[3.5rem] border border-white/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12">
          <Award className="w-64 h-64 text-sia-pink" />
        </div>
        
        <div className="w-32 h-32 rounded-full border-4 border-white glass shadow-xl flex items-center justify-center relative group">
          <div className="absolute inset-0 rounded-full bg-sia-pink/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <User className="w-12 h-12 text-sia-pink/40" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-sia-pink text-white flex items-center justify-center shadow-lg border-2 border-white">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 z-10">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h2 className="font-serif italic font-bold text-4xl text-sia-text">Anonymous Sister #4231</h2>
            <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">Verified</div>
          </div>
          <p className="text-sia-text-muted font-light text-lg">"Helping others find comfort and safety."</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
            <span className="px-4 py-2 rounded-full bg-sia-pink text-white text-[10px] font-bold uppercase tracking-widest shadow-md">Guardian Level 3</span>
            <span className="px-4 py-2 rounded-full bg-white/60 text-sia-text-muted text-[10px] font-bold uppercase tracking-widest border border-sia-pink-light">Central Region</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2.5rem] bg-white border border-sia-pink-light/30 shadow-sm flex flex-col items-center text-center group transition-all hover:shadow-lg"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sia-text-muted mb-1 opacity-60">{stat.label}</span>
            <span className="text-2xl font-bold text-sia-text">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-[3rem] bg-white/60 border border-sia-pink-light shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-sia-pink mb-8">Recently Saved</h3>
          <div className="space-y-4">
            {[
              { title: "Ajwain Water for Cramps", type: "Remedy" },
              { title: "Safe Escort: Hostel Block B", type: "Tip" },
              { title: "Emergency Supplies: Library", type: "Zone" }
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-[1.8rem] bg-white border border-sia-pink-light/30 flex items-center justify-between group cursor-pointer hover:bg-sia-pink-light/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sia-warm-bg flex items-center justify-center text-sia-pink">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-sia-text">{item.title}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-sia-text opacity-30">{item.type}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sia-pink opacity-0 group-hover:opacity-40 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-white/60 border border-sia-pink-light shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-sia-pink mb-8">Support Activity</h3>
          <div className="space-y-6">
            {[
              { text: "Helped a sister with pain relief", time: "2 days ago", icon: HeartHandshake },
              { text: "Shared a new comfort tip", time: "1 week ago", icon: Sparkles },
              { text: "Verified a safe zone update", time: "2 weeks ago", icon: Shield }
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-10 h-10 rounded-full bg-sia-pink-light flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-sia-pink" />
                </div>
                <div>
                  <p className="text-sm text-sia-text leading-tight">{item.text}</p>
                  <p className="text-[10px] text-sia-text-muted mt-1 opacity-50 uppercase font-bold tracking-widest">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    anonymousMode: true,
    location: true,
    capsuleVisibility: 'nearby',
    theme: 'light',
    safety: 'high'
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: "Privacy & Identity",
      items: [
        { id: 'anonymousMode', icon: EyeOff, label: 'Anonymous Mode', desc: 'Hide your identity from other users', type: 'toggle' },
        { id: 'location', icon: MapPin, label: 'Location Permissions', desc: 'Allow SIA to find nearby support', type: 'toggle' },
      ]
    },
    {
      title: "App Preferences",
      items: [
        { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Get alerts for help requests and replies', type: 'toggle' },
        { id: 'theme', icon: Moon, label: 'Theme Settings', desc: 'Switch between light and dark mode', type: 'select', options: ['Light', 'Dark', 'System'] },
      ]
    },
    {
      title: "Safety & Community",
      items: [
        { id: 'safety', icon: Shield, label: 'Safety Preferences', desc: 'Configure emergency response intensity', type: 'select', options: ['Low', 'Medium', 'High'] },
        { id: 'capsuleVisibility', icon: Heart, label: 'Capsule Visibility', desc: 'Who can see your left notes', type: 'select', options: ['Nearby Only', 'All Regions', 'Private'] },
      ]
    }
  ];

  return (
    <div className="pt-32 px-6 max-w-3xl mx-auto pb-40">
      <SectionHeading 
        title="Settings ⚙️" 
        subtitle="Customize your SIA experience to feel safe and supported."
      />

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-sia-pink opacity-40 ml-4">{section.title}</h3>
            <div className="bg-white/60 rounded-[3rem] border border-sia-pink-light shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={item.id} 
                  className={`p-8 flex items-center justify-between hover:bg-white/40 transition-colors ${i !== section.items.length - 1 ? 'border-b border-sia-pink-light/30' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-sia-warm-bg flex items-center justify-center text-sia-pink">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-sia-text uppercase tracking-widest">{item.label}</h4>
                      <p className="text-[10px] text-sia-text-muted font-light mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  
                  {item.type === 'toggle' ? (
                    <button 
                      onClick={() => toggle(item.id as keyof typeof settings)}
                      className={`w-14 h-8 rounded-full transition-all duration-300 relative p-1 ${settings[item.id as keyof typeof settings] ? 'bg-sia-pink' : 'bg-sia-pink-light'}`}
                    >
                      <motion.div 
                        animate={{ x: settings[item.id as keyof typeof settings] ? 24 : 0 }}
                        className="w-6 h-6 rounded-full bg-white shadow-md" 
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-sia-pink opacity-40">{item.options?.[0]}</span>
                      <ChevronRight className="w-4 h-4 text-sia-pink opacity-30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LogoutModal = ({ onClose, onLogout }: { onClose: () => void, onLogout: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] bg-black/10 backdrop-blur-md flex items-center justify-center p-6"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="w-full max-w-md glass p-10 rounded-[3rem] border border-white shadow-2xl text-center relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8">
        <LogOut className="w-8 h-8" />
      </div>
      
      <h3 className="font-serif italic font-bold text-3xl mb-4 text-sia-text">Are you sure?</h3>
      <p className="text-sia-text-muted text-sm font-light mb-10">
        You are about to sign out from SIA. Your anonymous session data will be preserved for your next visit.
      </p>

      <div className="flex flex-col gap-4">
        <button
          onClick={onLogout}
          className="w-full h-16 rounded-full bg-sia-pink text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-sia-pink-dark transition-all"
        >
          Logout
        </button>
        <button
          onClick={onClose}
          className="w-full h-16 rounded-full bg-white border border-sia-pink-light text-sia-text opacity-60 font-bold uppercase tracking-[0.2em] text-[10px] hover:opacity-100 transition-all"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: Shield, label: 'Home' },
    { id: 'arin', icon: MessageSquare, label: 'Arin' },
    { id: 'sakhi', icon: Sparkles, label: 'Sakhi' },
    { id: 'capsule', icon: Heart, label: 'Capsule' },

  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-20 bg-white/40 backdrop-blur-md border-t border-sia-pink-light z-50 px-6">
      <div className="max-w-5xl mx-auto h-full flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative px-4 py-2 ${
              activeTab === tab.id ? 'text-sia-pink' : 'text-sia-text-muted opacity-40 hover:opacity-60'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-sia-pink/10' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-pill" 
                className="absolute inset-0 bg-sia-pink/5 rounded-2xl -z-10" 
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
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

const ChatBubble = ({ message, isSakhi = false }: { message: string, isSakhi?: boolean }) => (
  <div className={`flex ${isSakhi ? 'justify-start' : 'justify-end'} mb-4 px-4`}>
    <div className={`max-w-[85%] px-5 py-3 rounded-[1.2rem] shadow-sm flex flex-col ${
      isSakhi 
        ? 'bg-white rounded-tl-none text-sia-text border border-sia-pink-light/40 shadow-sm' 
        : 'bg-sia-pink rounded-br-none text-white shadow-[0_4px_15px_rgba(216,27,96,0.15)]'
    }`}>
      <p className="text-sm leading-relaxed">{message}</p>
      <div className={`text-[8px] font-bold uppercase tracking-tighter mt-1 opacity-40 self-end ${isSakhi ? 'text-sia-text' : 'text-white'}`}>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
);


const CapsuleCard = ({ icon: Icon, text, zone, time, category, clusterCount }: any) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[2.8rem] bg-white/60 backdrop-blur-xl border border-sia-pink-light shadow-sm hover:shadow-[0_20px_50px_rgba(216,27,96,0.1)] transition-all relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-sia-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.8rem]" />
    <div className="flex items-start gap-5 relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-sia-pink-light flex items-center justify-center shrink-0 shadow-inner group-hover:bg-sia-pink group-hover:text-white transition-colors duration-500">
        <Icon className="w-6 h-6 text-sia-pink group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-sia-pink opacity-50">Anonymous Sister</span>
          <span className="w-1 h-1 bg-sia-pink/20 rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-sia-text/30">{time}</span>
        </div>
        <p className="text-base text-sia-text leading-relaxed mb-4 font-serif italic">“{text}”</p>
      </div>
    </div>
    {clusterCount > 0 && (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -top-3 -right-3 px-4 py-2 bg-white border border-sia-pink-light text-sia-pink text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2"
      >
        <div className="w-2 h-2 bg-sia-pink rounded-full animate-ping" />
        {clusterCount} women shared similar
      </motion.div>
    )}
  </motion.div>
);

const TimeCapsulePage = () => {
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [note, setNote] = useState('');

  const capsules = [
    { icon: Sparkles, text: "The library washroom usually has emergency pads in the third stall.", zone: "Library", time: "2h ago", category: "Pads Availability", clusterCount: 12 },
    { icon: AlertTriangle, text: "Bins near the mess are broken today, please use the ones near the entrance.", zone: "Hostel Block A", time: "1h ago", category: "Washroom Update", clusterCount: 0 },
    { icon: Coffee, text: "The canteen aunty gives hot ginger water if you mention you're unwell.", zone: "Cafeteria", time: "3h ago", category: "Hostel Hack", clusterCount: 5 },
    { icon: Clock, text: "The pharmacy near Gate 2 stays open till 11pm even on Sundays.", zone: "Campus Area", time: "5h ago", category: "Nearby Help", clusterCount: 0 },
    { icon: HeartHandshake, text: "Try the bean bags in the library reading room if your back hurts.", zone: "Library", time: "30m ago", category: "Comfort", clusterCount: 8 },
  ];

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto pb-40 relative">
      {/* Background Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-sia-pink/5 blur-3xl"
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

    <div className="relative z-10">
        <SectionHeading
          title="Time Capsule 💗"
          subtitle="Anonymous wisdom, comfort, and survival notes left by women nearby."
        />

        {/* Static Write Button */}
        <div className="flex justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWriteModal(true)}
            className="w-full max-w-xl px-6 md:px-10 py-4 md:py-6 rounded-full bg-sia-pink text-white font-bold shadow-[0_20px_50px_rgba(216,27,96,0.3)] flex items-center justify-center gap-4 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sia-peach/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="uppercase tracking-[0.2em] text-[10px] relative z-10">Leave A Note For Future Women</span>
            <Heart className="w-5 h-5 fill-white group-hover:animate-bounce relative z-10" />
          </motion.button>
        </div>

        {/* AI Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-20 p-6 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_30px_100px_rgba(216,27,96,0.08)] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 group-hover:rotate-12 transition-transform duration-1000">
            <Brain className="w-64 h-64 text-sia-pink" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-tr from-sia-pink to-sia-peach flex items-center justify-center shadow-[0_10px_30px_rgba(216,27,96,0.3)]">
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif italic font-bold text-2xl md:text-3xl text-sia-text">Nearby Wisdom Summary ✨</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sia-pink opacity-40">AI-Powered Anonymous Insight</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Sparkles, text: "Most women nearby mention that the library washroom usually has emergency pads.", color: "text-sia-pink" },
                { icon: AlertTriangle, text: "Several women reported that the mess-side washroom bins are currently broken.", color: "text-amber-500" },
                { icon: Droplets, text: "Many women nearby recommend warm jeera water and rest during cramps.", color: "text-blue-500" },
                { icon: Shield, text: "Hostel Block A is considered one of the safest support zones nearby.", color: "text-green-600" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-5 p-6 rounded-[2rem] bg-white/40 border border-white/60 shadow-sm"
                >
                  <item.icon className={`w-6 h-6 ${item.color} shrink-0 mt-1 opacity-60`} />
                  <p className="text-base leading-relaxed text-sia-text font-light">“{item.text}”</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Community Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {capsules.map((cap, i) => (
            <CapsuleCard key={i} {...cap} />
          ))}
        </div>

        {/* Most Shared Insights */}
        <div className="mb-24">
          <div className="flex flex-col items-center mb-12">
            <div className="h-px w-20 bg-sia-pink-light mb-6" />
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-sia-pink opacity-40 text-center">Most Shared Nearby Insights ✨</h3>
          </div>
          
          <div className="space-y-6">
            {[
              { text: "Emergency pads are most commonly found near library washrooms.", icon: Sparkles, count: "85% verification" },
              { text: "Washroom maintenance issues are currently trending near the cafeteria zone.", icon: AlertTriangle, count: "Trending" },
              { text: "Heat therapy and hydration are the most suggested cramps remedies nearby.", icon: Droplets, count: "Community Choice" }
            ].map((insight, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.01 }}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-sia-warm-bg border border-sia-pink-light/50 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <insight.icon className="w-5 h-5 text-sia-pink" />
                </div>
                <p className="text-lg font-serif italic text-sia-text flex-1">“{insight.text}”</p>
                <div className="px-5 py-2 rounded-full bg-white text-[9px] font-black text-sia-pink uppercase tracking-widest border border-sia-pink-light shadow-sm">
                  {insight.count}
                </div>
              </motion.div>
            ))}
          </div>
        </div>



        {/* Write Modal */}
        <AnimatePresence>
          {showWriteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-xl flex items-center justify-center p-6"
              onClick={() => setShowWriteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sia-peach via-sia-pink to-sia-peach" />
                
                <button onClick={() => setShowWriteModal(false)} className="absolute top-6 right-6 md:top-10 md:right-10 p-2 md:p-3 rounded-full hover:bg-sia-pink-light/30 text-sia-text/40 hover:text-sia-pink transition-all z-[110]">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="mb-10">
                  <h3 className="font-serif italic font-bold text-3xl md:text-4xl mb-3 text-sia-text pr-12">Leave a Kindness 💗</h3>
                  <p className="text-sia-text-muted text-sm md:text-base font-light italic">“Women quietly leaving care, comfort, and wisdom for those who follow.”</p>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-sia-pink opacity-50 ml-6 mb-3 block">Your Wisdom</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What helped you during a difficult moment? Share something comforting or useful..."
                      className="w-full h-32 md:h-48 p-6 md:p-10 bg-white/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-sia-pink-light/30 focus:ring-4 focus:ring-sia-pink/5 focus:border-sia-pink/30 focus:outline-none transition-all text-lg md:text-xl font-serif italic text-sia-text resize-none placeholder:text-sia-text/20"
                    />
                  </div>



                  <button
                    onClick={() => {
                      setShowWriteModal(false);
                      setNote('');
                    }}
                    className="w-full h-20 rounded-full bg-sia-pink text-white font-bold uppercase tracking-[0.3em] text-xs shadow-[0_15px_40px_rgba(216,27,96,0.3)] hover:bg-sia-pink-dark transition-all mt-6 active:scale-95"
                  >
                    Seal in Capsule 💗
                  </button>
                  
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Arin Page - Community Forum
const ArinCommunityPage = ({ 
  questions, 
  newQuestion, 
  setNewQuestion, 
  handlePostQuestion 
}: { 
  questions: Question[], 
  newQuestion: string, 
  setNewQuestion: (v: string) => void, 
  handlePostQuestion: (e: React.FormEvent) => void 
}) => (
  <div className="pt-32 px-6 max-w-5xl mx-auto pb-40">
    <div className="text-center mb-12 md:mb-16">
      <h2 className="font-serif italic font-bold text-5xl md:text-7xl text-sia-text mb-4 tracking-tight">ARIN Community</h2>
      <p className="text-sia-text-muted max-w-2xl mx-auto font-light leading-relaxed text-base md:text-lg">
        Ask your region anonymously. Verified sisters nearby are ready to share their wisdom.
      </p>
    </div>

    {/* Ask Question Box */}
    <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-sia-pink-light/30 mb-16 md:20">
      <form onSubmit={handlePostQuestion} className="space-y-6">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="What's on your mind? Ask anonymously in your region..."
          className="w-full h-32 md:h-48 p-6 md:p-8 bg-sia-cream/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-sia-pink-light/20 focus:outline-none focus:ring-2 focus:ring-sia-pink/20 transition-all text-base md:text-lg font-light resize-none placeholder:text-sia-text-muted/40"
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sia-text opacity-40">
            <MapPin className="w-4 h-4 text-sia-pink" /> Broadcasting to Central Region
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-10 py-4 bg-sia-pink text-white rounded-full font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-sia-pink-dark transition-all hover:scale-105"
          >
            Post Question
          </button>
        </div>
      </form>
    </div>

    {/* Questions List */}
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8 px-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-sia-text opacity-30">Questions Nearby</h3>
        <div className="flex items-center gap-2 text-[10px] text-sia-pink font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-sia-pink rounded-full animate-pulse" />
          Live Updates
        </div>
      </div>
      {questions.map((q) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-white border border-sia-pink-light/30 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-sia-pink" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sia-pink opacity-40">Anonymous</span>
            <span className="text-[10px] text-gray-300 font-bold uppercase ml-auto tracking-widest">{q.time}</span>
          </div>
          <h4 className="font-serif italic font-bold text-sia-text text-xl md:text-3xl leading-snug mb-10 group-hover:text-sia-pink transition-colors">“{q.text}”</h4>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-dashed border-sia-pink-light/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sia-pink-light/30">
                <MessageSquare className="w-4 h-4 text-sia-pink" />
              </div>
              <span className="text-xs font-bold text-sia-text-muted uppercase tracking-widest">{q.replies} Replies</span>
            </div>
            <button className="w-full md:w-auto text-[10px] font-bold uppercase tracking-[0.2em] text-sia-pink hover:bg-sia-pink hover:text-white px-6 py-2 rounded-full border border-sia-pink/20 transition-all">
              Respond Anonymously
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeView, setActiveView] = useState<AppView>('main');
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Hello! I'm SIA Wellness AI. How can I help you feel better today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [provider, setProvider] = useState('Groq');

  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', user: 'Anonymous', text: 'What helps with painful cramps in hostel?', time: '2m ago', replies: 3 },
    { id: '2', user: 'Anonymous', text: 'Safe workout suggestions while on period?', time: '15m ago', replies: 1 },
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async (msg?: string) => {
    const textToSend = msg || userInput;
    if (!textToSend.trim()) return;

    setIsTyping(true);

    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: textToSend }
    ]);

    if (!msg) setUserInput('');

    try {
      const { reply, provider: activeProvider } = await askSakhiKnows(textToSend, history);

      setHistory(prev => [
        ...prev,
        { role: 'user', content: textToSend },
        { role: 'assistant', content: reply },
      ]);

      setChatMessages(prev => [
        ...prev,
        { role: 'ai', content: reply }
      ]);

      setProvider(activeProvider || 'Unavailable');
    } catch (error) {
      console.error('Sakhi chat error:', error);
      const fallbackReply = 'Sakhi Knows is taking a short break. Please try again in a moment. 💙';

      setChatMessages(prev => [
        ...prev,
        { role: 'ai', content: fallbackReply }
      ]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: textToSend },
        { role: 'assistant', content: fallbackReply },
      ]);
      setProvider('Unavailable');
    } finally {
      setIsTyping(false);
    }
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

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuNavigate = (view: AppView | 'logout') => {
    if (view === 'logout') {
      setShowLogoutModal(true);
    } else {
      setActiveView(view);
    }
  };

  const handleBackToMain = () => {
    setActiveView('main');
    setActiveTab('home');
  };
  if (appState === 'peer-chat') {
    return <PeerChat onBack={() => { setAppState('idle'); setActiveTab('home'); }} />;
  }

  if (appState === 'finding') {
    return (
      <div className="min-h-screen font-sans bg-sia-cream">
        <Navbar activeView={activeView} />
        <WaitingScreen
          onCancel={() => setAppState('idle')}
          onMatchFound={() => setAppState('peer-chat')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-sia-cream selection:bg-sia-pink-light overflow-x-hidden pb-32">
      <Navbar 
        showBack={activeView !== 'main' || activeTab !== 'home'} 
        onBack={activeView !== 'main' ? handleBackToMain : () => setActiveTab('home')} 
        onProfile={handleProfileClick}
        activeView={activeView}
      />

      <AnimatePresence>
        {showProfileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[105] bg-transparent" 
              onClick={() => setShowProfileMenu(false)} 
            />
            <ProfileMenu 
              onClose={() => setShowProfileMenu(false)} 
              onNavigate={handleMenuNavigate}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeView === 'profile' && (
          <motion.div
            key="profile-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfilePage />
          </motion.div>
        )}

        {activeView === 'settings' && (
          <motion.div
            key="settings-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SettingsPage />
          </motion.div>
        )}

        {activeView === 'main' && (
          <>
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
                      You’re not<br /> <span className="text-sia-pink">alone</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-sia-text-muted max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                      Private support during period emergencies — without the discomfort of asking.
                    </p>
                  </motion.div>

                  {/* SOS Button Area */}
                  <div className="flex-1 flex flex-col items-center justify-center relative">

                    <div className="absolute w-[30rem] h-[30rem] border border-sia-pink/5 rounded-full animate-pulse" />
                    <div className="absolute w-[24rem] h-[24rem] border border-sia-pink/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

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

            {/* Mission & Impact moved here */}
            <section id="mission" className="py-32 px-6">
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                <div className="flex-[1.5] p-12 md:p-20 bg-white border border-sia-pink-light rounded-[3rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0">
                    <Heart className="w-64 h-64 text-sia-pink fill-sia-pink" />
                  </div>
                  <h2 className="font-serif italic font-bold text-5xl md:text-6xl mb-12 text-sia-text leading-tight">The Power of<br />Solidarity</h2>

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
                        {[1, 2, 3, 4].map(i => (
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
                    <h3 className="font-bold text-xl mb-4 uppercase tracking-widest">Flash Wisdom</h3>
                    <p className="text-white/80 font-light text-sm leading-relaxed mb-4">
                      "Self-care is how you take your power back." - Quick wellness insights powered by Sakhi.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 bg-white/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="h-full w-full bg-white"
                        />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Daily Insight</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'arin' && (
          <motion.div
            key="arin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ArinCommunityPage 
              questions={questions}
              newQuestion={newQuestion}
              setNewQuestion={setNewQuestion}
              handlePostQuestion={handlePostQuestion}
            />
          </motion.div>
        )}

        {activeTab === 'capsule' && (
          <motion.div
            key="capsule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TimeCapsulePage />
          </motion.div>
        )}

        {activeTab === 'sakhi' && (
          <motion.div
            key="sakhi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 md:pt-32 px-0 md:px-6 max-w-4xl mx-auto flex flex-col items-center pb-0 md:pb-40 h-[calc(100vh-80px)] md:h-auto"
          >
            <SectionHeading 
              title="Sakhi Wellness"
              subtitle="Indian home remedies, comfort tips, and period wellness guidance inspired by real experiences."
              className="hidden md:block"
            />
            
            <div className="w-full max-w-2xl bg-sia-cream/30 md:bg-white rounded-none md:rounded-[3rem] p-0 md:p-8 shadow-none md:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-x-0 md:border border-sia-pink-light flex flex-col h-[500px] md:h-[650px] overflow-hidden relative">
              {/* WhatsApp-style Background Pattern (Subtle) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none md:hidden" style={{ backgroundImage: 'radial-gradient(#d81b60 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
              
              <div className="flex items-center gap-4 mb-2 md:mb-10 p-4 md:p-5 bg-white md:bg-sia-cream border-b md:border border-sia-pink-light/30 z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-sia-peach to-sia-pink flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sia-text italic font-serif text-sm md:text-base">Sakhi Companion</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-500">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Ready to support
                  </div>
                </div>
              </div>

              <div 
                ref={chatContainerRef}
                className="flex-1 space-y-6 mb-8 overflow-y-auto scrollbar-hide px-2"
              >
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={i} isSakhi={msg.role === 'ai'} message={msg.content} />
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-sia-cream px-5 py-3 rounded-[1.5rem] rounded-tl-none border border-sia-pink-light/30 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-sia-pink animate-spin" />
                      <span className="text-[10px] text-sia-text-muted font-bold uppercase tracking-widest">Sakhi is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="mt-auto p-4 bg-white md:bg-transparent border-t md:border-none border-sia-pink-light/30">
                <form 
                  className="relative"
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                >
                  <input 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask Sakhi anything about period wellness..." 
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
          </>
        )}
      </AnimatePresence>

      {activeView === 'main' && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

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
        {showLogoutModal && (
          <LogoutModal 
            onClose={() => setShowLogoutModal(false)}
            onLogout={() => {
              setShowLogoutModal(false);
              window.location.reload(); // Simple mock logout
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
