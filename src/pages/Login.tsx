import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Lock, Link as LinkIcon, Loader2, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    serverUrl: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let url = formData.serverUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }
      
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      
      // Fix for MAG portal URLs (e.g., http://example.com:8080/c)
      if (url.endsWith('/c')) {
        url = url.slice(0, -2);
      }

      try {
        new URL(url);
      } catch (e) {
        setError('رابط السيرفر غير صالح');
        setLoading(false);
        return;
      }

      const apiUrl = `${url}/player_api.php?username=${formData.username}&password=${formData.password}`;
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        if (response.status === 512) {
          throw new Error('السيرفر لا يستجيب بشكل صحيح (الخطأ 512). يرجى التأكد من الرابط أو المحاولة لاحقاً.');
        }
        throw new Error(`خطأ في الاتصال بالسيرفر (الرمز: ${response.status})`);
      }
      
      const data = await response.json();

      if (data && data.user_info && data.user_info.auth === 1) {
        login({
          username: data.user_info.username,
          password: data.user_info.password,
          serverUrl: url,
          status: data.user_info.status,
          exp_date: data.user_info.exp_date,
          is_trial: data.user_info.is_trial,
          active_cons: data.user_info.active_cons,
          max_connections: data.user_info.max_connections,
          message: data.user_info.message,
        });
        navigate('/home');
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر. تأكد من الرابط والاتصال بالانترنت.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 scale-105 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/90"></div>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md glass-panel rounded-[2rem] p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(229,9,20,0.5)]"
          >
            <Play size={32} fill="currentColor" className="text-white ml-1.5 md:ml-2" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">BOXITV</h1>
          <p className="text-zinc-400 text-sm md:text-base font-medium">سجل دخولك للبدء بالمشاهدة</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-6 text-sm text-center font-medium backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="اسم المستخدم"
              className="w-full bg-black/40 border border-zinc-800 text-white rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-zinc-600"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary transition-colors">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full bg-black/40 border border-zinc-800 text-white rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-zinc-600"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary transition-colors">
              <LinkIcon size={20} />
            </div>
            <input
              type="url"
              placeholder="رابط السيرفر (URL)"
              className="w-full bg-black/40 border border-zinc-800 text-white rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-left dir-ltr placeholder:text-zinc-600"
              style={{ direction: 'ltr' }}
              value={formData.serverUrl}
              onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  disabled={loading}
                />
                <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-zinc-400 text-sm font-medium group-hover:text-zinc-300 transition-colors">تذكرني</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-2xl text-base md:text-lg font-bold shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] hover:bg-primary-hover transition-all duration-300 mt-6 md:mt-8 flex justify-center items-center transform hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'دخول'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
