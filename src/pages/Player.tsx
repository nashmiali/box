import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
import { ArrowRight, Loader2, Info, Settings as SettingsIcon, X } from 'lucide-react';

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Load settings from localStorage or use defaults
  const getSavedSetting = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(`player_setting_${key}`);
    return saved !== null ? saved : defaultValue;
  };

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => parseFloat(getSavedSetting('speed', '1')));
  const [subtitleSize, setSubtitleSize] = useState<string>(() => getSavedSetting('sub_size', '100%'));
  const [subtitleColor, setSubtitleColor] = useState<string>(() => getSavedSetting('sub_color', '#ffffff'));
  const [subtitleBg, setSubtitleBg] = useState<string>(() => getSavedSetting('sub_bg', 'rgba(0,0,0,0.5)'));
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('player_setting_speed', playbackSpeed.toString());
    localStorage.setItem('player_setting_sub_size', subtitleSize);
    localStorage.setItem('player_setting_sub_color', subtitleColor);
    localStorage.setItem('player_setting_sub_bg', subtitleBg);
  }, [playbackSpeed, subtitleSize, subtitleColor, subtitleBg]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-10 flex items-center justify-between transition-opacity duration-500 ${showControls || showSettings ? 'opacity-100' : 'opacity-0'}`}
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
          >
            <SettingsIcon size={24} />
          </button>
          <button className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg">
            <Info size={24} />
          </button>
        </div>
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

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-black/95 backdrop-blur-2xl border-l border-white/10 z-50 p-6 flex flex-col gap-8 overflow-y-auto transform transition-transform shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-white">إعدادات المشغل</h2>
            <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 rounded-full p-2">
              <X size={20} />
            </button>
          </div>
          
          {/* Playback Speed */}
          {type !== 'live' && (
            <div className="space-y-4">
              <label className="text-white/70 text-sm font-bold flex items-center gap-2">
                <SettingsIcon size={16} /> سرعة التشغيل
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button 
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${playbackSpeed === speed ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-white/5 text-white/70 hover:bg-white/15 border border-white/5'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtitle Size */}
          <div className="space-y-4">
            <label className="text-white/70 text-sm font-bold">حجم الترجمة</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'صغير', value: '75%' },
                { label: 'عادي', value: '100%' },
                { label: 'كبير', value: '150%' },
                { label: 'ضخم', value: '200%' }
              ].map(size => (
                <button 
                  key={size.value}
                  onClick={() => setSubtitleSize(size.value)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${subtitleSize === size.value ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-white/5 text-white/70 hover:bg-white/15 border border-white/5'}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Color */}
          <div className="space-y-4">
            <label className="text-white/70 text-sm font-bold">لون الترجمة</label>
            <div className="flex gap-4">
              {['#ffffff', '#ffff00', '#00ffff', '#ff00ff'].map(color => (
                <button 
                  key={color}
                  onClick={() => setSubtitleColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all shadow-lg ${subtitleColor === color ? 'border-primary scale-110' : 'border-white/20 hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Subtitle Background */}
          <div className="space-y-4">
            <label className="text-white/70 text-sm font-bold">خلفية الترجمة</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'بدون خلفية', value: 'transparent' },
                { label: 'أسود شفاف', value: 'rgba(0,0,0,0.5)' },
                { label: 'أسود داكن', value: 'rgba(0,0,0,0.9)' }
              ].map(bg => (
                <button 
                  key={bg.value}
                  onClick={() => setSubtitleBg(bg.value)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${subtitleBg === bg.value ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-white/5 text-white/70 hover:bg-white/15 border border-white/5'}`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Subtitle Styles */}
      <style>{`
        video::cue {
          font-size: ${subtitleSize};
          color: ${subtitleColor};
          background-color: ${subtitleBg};
          font-family: system-ui, -apple-system, sans-serif;
          text-shadow: 0px 2px 4px rgba(0,0,0,0.8);
        }
      `}</style>

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
