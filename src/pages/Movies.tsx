import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, Play, Loader2, ArrowRight, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVodCategories, getVodStreams } from '../services/xtream';

export default function Movies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategoryId(location.state.category);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [cats, allMovies] = await Promise.all([
          getVodCategories(user),
          getVodStreams(user)
        ]);
        
        const formattedCats = [
          { category_id: 'all', category_name: 'الكل' },
          { category_id: 'recent', category_name: 'أحدث الإضافات' },
          ...(Array.isArray(cats) ? cats : [])
        ];
        
        setCategories(formattedCats);
        setMovies(Array.isArray(allMovies) ? allMovies : []);
      } catch (error) {
        console.error('Failed to fetch movies data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const filteredMovies = movies.filter((m) => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeCategoryId === 'all') return true;
    if (activeCategoryId === 'recent') return true; 
    return m.category_id === activeCategoryId;
  });

  const displayMovies = activeCategoryId === 'recent' ? filteredMovies.slice(0, 50) : filteredMovies;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen bg-black">
      {/* Header & Search */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-10 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Film size={24} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">الأفلام</h1>
            </div>
          </div>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="ابحث عن فيلم..."
              className="w-full bg-white/10 border border-white/10 rounded-full py-2.5 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 text-white font-medium transition-all placeholder:text-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-3 text-zinc-400" size={18} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
          <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-zinc-400 shrink-0">
            <Filter size={20} />
          </div>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setActiveCategoryId(cat.category_id)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 shrink-0 ${
                activeCategoryId === cat.category_id
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                  : 'glass-button text-zinc-300 hover:text-white'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8">
          {displayMovies.map((movie) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={movie.stream_id}
              onClick={() => navigate(`/details/movie/${movie.stream_id}`)}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg mb-3 bg-zinc-900 border border-white/5">
                <img
                  src={movie.stream_icon || 'https://picsum.photos/seed/placeholder/300/450'}
                  alt={movie.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/450'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_15px_rgba(229,9,20,0.6)] mx-auto mb-2">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                </div>
                {movie.rating && movie.rating !== "0" && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/10">
                    {movie.rating}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-zinc-300 group-hover:text-white transition-colors text-sm md:text-base truncate px-1 mt-auto">{movie.name}</h3>
            </motion.div>
          ))}
        </div>
        
        {displayMovies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
            <Search size={64} className="mb-6 opacity-20" />
            <p className="font-medium text-xl text-zinc-400">لا توجد أفلام مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
