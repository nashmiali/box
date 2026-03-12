import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Browser } from '@capacitor/browser';
import { ArrowRight, Play, Star, Clock, Calendar, Info, Loader2, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVodInfo, getSeriesInfo, getStreamUrl } from '../services/xtream';

export default function Details() {
  const { id, type } = useParams<{ id: string; type: 'movie' | 'series' }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inMyList, setInMyList] = useState(false);

  useEffect(() => {
    if (!user || !id || !type) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        if (type === 'movie') {
          data = await getVodInfo(user, id);
        } else {
          data = await getSeriesInfo(user, id);
        }
        setInfo(data);
        
        // Check if in My List
        const myListStr = localStorage.getItem('my_list');
        if (myListStr) {
          try {
            const myList = JSON.parse(myListStr);
            setInMyList(myList.some((item: any) => item.id === id && item.type === type));
          } catch (e) {
            console.error("Failed to parse my list", e);
          }
        }
      } catch (err) {
        setError('فشل في جلب التفاصيل');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user, id, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <p className="text-red-500 mb-4">{error || 'لم يتم العثور على معلومات'}</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-white px-6 py-2 rounded-full">
          العودة
        </button>
      </div>
    );
  }

  const details = info.info || {};
  const movieData = info.movie_data || {};
  
  const title = details.name || details.title || movieData.name || 'بدون عنوان';
  const description = details.plot || details.description || 'لا يوجد وصف متاح.';
  const cover = details.movie_image || details.cover || details.backdrop_path?.[0] || 'https://picsum.photos/seed/placeholder/800/400';
  const rating = details.rating || details.rating_5based || 'N/A';
  const duration = details.duration || details.episode_run_time || 'N/A';
  const year = details.releasedate || details.release_date || 'N/A';
  const genre = details.genre || 'غير محدد';
  const director = details.director || 'غير محدد';
  const cast = details.cast || details.actors || 'غير محدد';
  const trailer = details.youtube_trailer || '';

  const handlePlay = async (url: string) => {
    await Browser.open({ url });
  };

  const handleMoviePlay = () => {
    if (!user || !id) return;
    const extension = movieData.container_extension || 'mp4';
    const url = getStreamUrl(user, 'movie', id, extension);
    handlePlay(url);
  };

  const handleSeriesPlay = (ep: any, season: string) => {
    if (!user) return;
    const extension = ep.container_extension || 'mp4';
    const url = getStreamUrl(user, 'series', ep.id, extension);
    handlePlay(url);
  };

  const handleTrailer = () => {
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer}`, '_blank');
    } else {
      alert('لا يوجد تريلر متاح');
    }
  };

  const toggleMyList = () => {
    try {
      const myListStr = localStorage.getItem('my_list');
      let myList = myListStr ? JSON.parse(myListStr) : [];
      
      if (inMyList) {
        myList = myList.filter((item: any) => !(item.id === id && item.type === type));
        setInMyList(false);
      } else {
        myList.unshift({
          id,
          type,
          title,
          cover,
          timestamp: Date.now()
        });
        setInMyList(true);
      }
      
      localStorage.setItem('my_list', JSON.stringify(myList));
    } catch (e) {
      console.error("Failed to update my list", e);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 font-sans">
      {/* Hero Header */}
      <div className="relative h-[65vh] md:h-[75vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/1920/1080'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-6 md:p-12 z-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto w-full"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl leading-tight">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold text-white mb-6">
              <span className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                <Star size={18} className="text-primary" fill="currentColor" />
                {rating}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                <Clock size={18} className="text-zinc-300" />
                {duration}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                <Calendar size={18} className="text-zinc-300" />
                {year}
              </span>
              <span className="bg-primary/20 text-primary border border-primary/30 px-5 py-2 rounded-full">
                {genre}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMoviePlay}
                className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded-full font-black text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
              >
                <Play size={20} fill="currentColor" />
                شاهد الآن
              </button>
              <button
                onClick={handleTrailer}
                className="flex items-center gap-2 bg-white/10 text-white px-6 md:px-8 py-3 rounded-full font-bold text-base hover:bg-white/20 backdrop-blur-md transition-all border border-white/20"
              >
                <Info size={20} />
                التريلر
              </button>
              <button
                onClick={toggleMyList}
                className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-full font-bold text-base backdrop-blur-md transition-all border ${
                  inMyList 
                    ? 'bg-white/20 text-white border-white/40 hover:bg-white/30' 
                    : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
                }`}
              >
                {inMyList ? <Check size={20} /> : <Plus size={20} />}
                {inMyList ? 'في قائمتي' : 'أضف لقائمتي'}
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-8 z-30 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8 relative z-20 -mt-10">
        <section className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5">
          <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full inline-block"></span>
            القصة
          </h2>
          <p className="text-zinc-400 leading-relaxed text-base md:text-lg font-medium max-w-4xl">{description}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5">
            <h3 className="font-black text-white mb-3 text-lg md:text-xl tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-5 md:h-6 bg-primary rounded-full inline-block"></span>
              طاقم العمل
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-medium">{cast}</p>
          </div>
          <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5">
            <h3 className="font-black text-white mb-3 text-lg md:text-xl tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-5 md:h-6 bg-primary rounded-full inline-block"></span>
              المخرج
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-medium">{director}</p>
          </div>
        </section>

        {/* Episodes List for Series */}
        {type === 'series' && info.episodes && (
          <section>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full inline-block"></span>
              الحلقات
            </h2>
            <div className="space-y-6">
              {Object.keys(info.episodes).map((season) => (
                <div key={season} className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
                  <div className="bg-white/5 p-5 border-b border-white/5">
                    <h3 className="font-black text-lg md:text-xl text-white">الموسم {season}</h3>
                  </div>
                  <div className="divide-y divide-white/5 p-2">
                    {info.episodes[season].map((ep: any) => (
                      <div key={ep.id} className="p-3 md:p-4 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors group">
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-lg md:text-xl border border-primary/20">
                            {ep.episode_num}
                          </div>
                          <div>
                            <h4 className="font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors">{ep.title || `الحلقة ${ep.episode_num}`}</h4>
                            <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1">{ep.info?.duration || 'N/A'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSeriesPlay(ep, season)}
                          className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all shadow-sm hover:scale-110 hover:shadow-[0_0_15px_rgba(229,9,20,0.5)]"
                        >
                          <Play size={20} fill="currentColor" className="ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
