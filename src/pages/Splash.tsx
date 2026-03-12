import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-light p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center"
      >
        <h1 className="text-6xl font-bold text-primary tracking-wider">BOXITV</h1>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-md pb-12"
      >
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 px-8 rounded-full text-xl font-bold shadow-lg hover:bg-white hover:text-primary border-2 border-transparent hover:border-primary transition-all duration-300"
        >
          <span>ابدأ الآـــن</span>
          <ArrowLeft size={24} />
        </button>
      </motion.div>
    </div>
  );
}
