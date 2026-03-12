import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
import { ArrowRight, Loader2, Info } from 'lucide-react';

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { url, title, id, type, cover, seriesId } = location.state || { url: '', title: '' };

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!url) {
      navigate(-1);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // Load saved progress
    const saveKey = `progress_${type}_${seriesId || id}`;
    const savedProgress = localStorage.getItem(saveKey);
    let initialTime = 0;
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        initialTime = data.currentTime || 0;
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }

    const startPlay = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      video.play().catch(e => {
        console.error("Auto-play prevented", e);
      });
    };

    if (Hls.isSupported() && url.includes('.m3u8')) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        startPlay();
      });
      let networkErrorCount = 0;

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('fatal network error encountered, try to recover');
              networkErrorCount++;
              if (networkErrorCount <= 3) {
                hls?.startLoad();
              } else {
                hls?.destroy();
                setError('فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.');
                setLoading(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('fatal media error encountered, try to recover');
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              setError('حدث خطأ أثناء تشغيل الفيديو');
              setLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || url.includes('.mp4') || url.includes('.mkv')) {
      // Native HLS support (Safari) or direct MP4 playback
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        startPlay();
      });
      video.addEventListener('error', () => {
        setError('حدث خطأ أثناء تشغيل الفيديو');
        setLoading(false);
      });
    } else {
      setError('صيغة الفيديو غير مدعومة');
      setLoading(false);
    }

    // Save progress periodically
    const saveProgress = () => {
      if (!video || video.currentTime < 5) return; // Don't save if just started
      
      const progressData = {
        id: seriesId || id,
        type,
        title,
        cover,
        currentTime: video.currentTime,
        duration: video.duration,
        timestamp: Date.now()
      };
      
      // Save specific item progress
      localStorage.setItem(saveKey, JSON.stringify(progressData));
      
      // Update continue watching list
      try {
        const listStr = localStorage.getItem('continue_watching');
        let list = listStr ? JSON.parse(listStr) : [];
        
        // Remove existing entry for this item
        list = list.filter((item: any) => item.id !== progressData.id);
        
        // Add to beginning of list
        list.unshift(progressData);
        
        // Keep only last 20 items
        if (list.length > 20) list = list.slice(0, 20);
        
        localStorage.setItem('continue_watching', JSON.stringify(list));
      } catch (e) {
        console.error("Failed to update continue watching list", e);
      }
    };

    const interval = setInterval(saveProgress, 5000);

    return () => {
      saveProgress(); // Save on unmount
      clearInterval(interval);
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, navigate, id, type, title, cover, seriesId]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-10 flex items-center justify-between transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-white text-2xl font-black truncate drop-shadow-lg tracking-tight">{title}</h1>
        </div>
        <button className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <Info size={24} />
        </button>
      </div>

      {/* Loading / Error States */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-0 bg-black">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="text-white/70 font-medium">جاري التحميل...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-0 bg-black/90 backdrop-blur-sm">
          <div className="glass-panel p-10 rounded-[2rem] text-center max-w-md border border-white/10">
            <p className="text-white text-xl font-bold mb-8">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(229,9,20,0.4)] w-full"
            >
              العودة
            </button>
          </div>
        </div>
      )}

      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        controls
        autoPlay
        playsInline
      />
    </div>
  );
}
