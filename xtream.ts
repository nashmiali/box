import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Info, ChevronLeft, Loader2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVodStreams, getSeries } from '../services/xtream';
import { useTVNavigation } from '../hooks/useTVNavigation';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentMovies, setRecentMovies] = useState<any[]>([]);
  const [recentSeries, setRecentSeries] = useState<any[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [myList, setMyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useTVNavigation((id) => navigate(id));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [movies, series] = await Promise.all([
          getVodStreams(user),
          getSeries(user)
        ]);

        const sortedMovies = Array.isArray(movies) ? movies.slice(0, 15) : [];
        const sortedSeries = Array.isArray(series) ? series.slice(0, 15) : [];

        setRecentMovies(sortedMovies);
        setRecentSeries(sortedSeries);
        
        const cwStr = localStorage.getItem('continue_watching');
        if (cwStr) {
          try {
            const cwList = JSON.parse(cwStr);
            // Sort by timestamp descending (most recent first)
            cwList.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
            setContinueWatching(cwList);
          } catch (e) {
            console.error("Failed to parse continue watching list", e);
          }
        }

        const myListStr = localStorage.getItem('my_list');
        if (myListStr) {
          try {
            const parsedMyList = JSON.parse(myListStr);
            parsedMyList.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
            setMyList(parsedMyList);
          } catch (e) {
            console.error("Failed to parse my list", e);
          }
        }
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const heroMovie = recentMovies.length > 0 ? recentMovies[0] : null;

  return (
    <div className="pb-32 bg-black min-h-screen">
      {/* Hero Banner - Full Bleed */}
      {heroMovie && (
        <div className="relative w-full h-[70vh] md:h-[85vh] mb-12">
          <div className="absolute inset-0">
            <img
              src={heroMovie.stream_icon || 'https://picsum.photos/seed/hero/1920/1080'}
              alt="Hero"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/1920/1080'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
          </div>
          
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
            <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tighter drop-shadow-lg">BOXITV</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/movies')} className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white">
                <Search size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white font-bold shadow-lg border border-white/20">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0 p-6 md:p-16 flex flex-col justify-end z-10"
          >
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-3 border border-white/10">
              أحدث الإضافات
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-5 drop-shadow-2xl max-w-3xl leading-tight">
              {heroMovie.name}
            </h2>
            <div className="flex gap-3">
              <button 
                data-tv-focusable
                data-tv-id={`/details/movie/${heroMovie.stream_id}`}
                onClick={() => navigate(`/details/movie/${heroMovie.stream_id}`)}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full w-max hover:bg-zinc-200 transition-all font-bold text-sm md:text-base shadow-xl hover:scale-105"
              >
                <Play size={18} fill="currentColor" />
                شاهد الآن
              </button>
              <button 
                data-tv-focusable
                data-tv-id={`/details/movie/${heroMovie.stream_id}`}
                onClick={() => navigate(`/details/movie/${heroMovie.stream_id}`)}
                className="flex items-center gap-2 glass-button text-white px-6 py-3 rounded-full w-max font-bold text-sm md:text-base hover:scale-105"
              >
                <Info size={18} />
                مزيد من المعلومات
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="px-4 md:px-8 space-y-8 relative z-20">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xl md:text-2xl font-bold text-white">متابعة المشاهدة</h3>
            </div>
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-6 snap-x px-2">
              {continueWatching.map((item) => {
                const progress = item.duration ? (item.currentTime / item.duration) * 100 : 0;
                return (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    key={`${item.type}_${item.id}`}
                    onClick={() => navigate(`/details/${item.type}/${item.id}`)}
                    className="min-w-[16.25rem] md:min-w-[20rem] snap-start cursor-pointer group"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl mb-3 bg-zinc-900 border border-white/5">
                      <img
                        src={item.cover || 'https://picsum.photos/seed/placeholder/400/225'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/225'; }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                          <Play size={28} className="text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/80">
                        <div 
                          className="h-full bg-primary shadow-[0_0_10px_rgba(229,9,20,0.8)]" 
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-base truncate px-1">{item.title}</h4>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* My List */}
        {myList.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xl md:text-2xl font-bold text-white">قائمتي</h3>
            </div>
            <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-8 snap-x px-2">
              {myList.map((item) => (
                <motion.div
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  key={`${item.type}_${item.id}`}
                  onClick={() => navigate(item.type === 'live' ? '/live' : `/details/${item.type}/${item.id}`)}
                  className="min-w-[8.75rem] md:min-w-[11.25rem] snap-start cursor-pointer group relative"
                >
                  <div className={`relative ${item.type === 'live' ? 'aspect-video' : 'aspect-[2/3]'} rounded-2xl overflow-hidden shadow-lg mb-3 bg-zinc-900 border border-white/5`}>
                    <img
                      src={item.cover || 'https://picsum.photos/seed/placeholder/300/450'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/450'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_15px_rgba(229,9,20,0.6)]">
                        <Play size={18} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-300 group-hover:text-white transition-colors text-sm truncate px-1">{item.title}</h4>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Movies */}
        <PosterCarousel 
          title="أحدث الأفلام" 
          items={recentMovies.slice(1)} 
          type="movie" 
          onViewAll={() => navigate('/movies', { state: { category: 'recent' } })} 
        />

        {/* Recently Added Series */}
        <PosterCarousel 
          title="أحدث المسلسلات" 
          items={recentSeries} 
          type="series" 
          onViewAll={() => navigate('/series', { state: { category: 'recent' } })} 
        />
      </div>
    </div>
  );
}

function PosterCarousel({ title, items, type, onViewAll }: { title: string; items: any[]; type: 'movie' | 'series'; onViewAll: () => void }) {
  const navigate = useNavigate();
  
  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
        <button onClick={onViewAll} className="text-zinc-400 text-sm font-bold flex items-center hover:text-white transition-colors">
          عرض الكل <ChevronLeft size={18} className="mr-1" />
        </button>
      </div>
      <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-8 snap-x px-2">
        {items.map((item) => (
          <motion.div
            whileHover={{ scale: 1.05, zIndex: 10 }}
            key={item.stream_id || item.series_id}
            onClick={() => navigate(`/details/${type}/${item.stream_id || item.series_id}`)}
            className="min-w-[8.75rem] md:min-w-[11.25rem] snap-start cursor-pointer group relative"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg mb-3 bg-zinc-900 border border-white/5">
              <img
                src={item.stream_icon || item.cover || 'https://picsum.photos/seed/placeholder/300/450'}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/450'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_15px_rgba(229,9,20,0.6)]">
                  <Play size={18} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>
            <h4 className="font-bold text-zinc-300 group-hover:text-white transition-colors text-sm truncate px-1">{item.name}</h4>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
