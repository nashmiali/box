import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_#3a1510_0%,_transparent_60%)] opacity-80 filter blur-[60px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,_#E50914_0%,_transparent_50%)] opacity-40 filter blur-[80px]"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center"
      >
        <motion.div 
          animate={{ 
            boxShadow: ['0 0 20px rgba(229,9,20,0.3)', '0 0 60px rgba(229,9,20,0.6)', '0 0 20px rgba(229,9,20,0.3)']
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8"
        >
          <Play size={48} fill="currentColor" className="text-white ml-2" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
          BOXI<span className="text-primary">TV</span>
        </h1>
        <p className="text-zinc-400 mt-3 text-base md:text-lg font-medium tracking-wide">عالم الترفيه بين يديك</p>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md pb-16 px-6"
      >
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-8 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300"
        >
          <span>ابدأ المشاهدة الآن</span>
          <ArrowLeft size={24} />
        </button>
      </motion.div>
    </div>
  );
}
