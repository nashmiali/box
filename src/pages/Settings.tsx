import { useNavigate } from 'react-router-dom';
import { UserCircle, Globe, Settings as SettingsIcon, Trash2, LogOut, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  // Format expiry date if it's a timestamp
  let formattedExpDate = user.exp_date;
  if (user.exp_date && !isNaN(Number(user.exp_date))) {
    const date = new Date(Number(user.exp_date) * 1000);
    formattedExpDate = date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="pb-32 min-h-screen bg-black font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-10 py-5">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ArrowRight size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <SettingsIcon size={24} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">الإعدادات والحساب</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-10 pt-8 space-y-8">
        {/* Account Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[2rem] p-8 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_30px_rgba(229,9,20,0.2)]">
              <UserCircle size={56} strokeWidth={1.5} />
            </div>
            <div className="overflow-hidden flex-1">
              <h2 className="text-3xl font-black text-white truncate tracking-tight mb-2">{user.username}</h2>
              <p className="text-zinc-400 text-sm truncate dir-ltr text-left font-medium bg-white/5 px-3 py-1.5 rounded-lg inline-block border border-white/5" style={{ direction: 'ltr' }}>{user.serverUrl}</p>
            </div>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 space-y-5 border border-white/5 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm font-medium">حالة الاشتراك</span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${user.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {user.status === 'Active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <div className="h-px bg-white/5 w-full"></div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm font-medium">تاريخ الانتهاء</span>
              <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                {formattedExpDate || 'غير محدد'}
              </span>
            </div>
            <div className="h-px bg-white/5 w-full"></div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm font-medium">الاتصالات النشطة</span>
              <span className="text-white font-bold text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                {user.active_cons} / {user.max_connections}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Settings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden"
        >
          <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors border-b border-white/5 group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                <Globe size={28} strokeWidth={1.5} />
              </div>
              <span className="font-bold text-lg text-white">تغيير اللغة</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="text-sm font-medium bg-white/5 px-3 py-1 rounded-lg">العربية</span>
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors border-b border-white/5 group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
                <SettingsIcon size={28} strokeWidth={1.5} />
              </div>
              <span className="font-bold text-lg text-white">إعدادات المشغل</span>
            </div>
            <ChevronLeft size={20} className="text-zinc-400 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-orange-500/20">
                <Trash2 size={28} strokeWidth={1.5} />
              </div>
              <span className="font-bold text-lg text-white">
                مسح الذاكرة المؤقتة
              </span>
            </div>
            <span className="text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">124 MB</span>
          </button>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-5 rounded-[2rem] font-black text-xl hover:bg-red-500/20 transition-all mt-10 border border-red-500/20 hover:scale-[1.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            <LogOut size={28} strokeWidth={2} />
            تسجيل الخروج
          </button>
        </motion.div>
      </div>
    </div>
  );
}
