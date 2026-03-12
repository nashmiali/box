import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Play, Loader2, ArrowRight, Tv, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLiveCategories, getLiveStreams, getStreamUrl } from '../services/xtream';

export default function LiveTV() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [myList, setMyList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [cats, allChannels] = await Promise.all([
          getLiveCategories(user),
          getLiveStreams(user)
        ]);
        
        const formattedCats = [
          { category_id: 'all', category_name: 'الكل' },
          ...(Array.isArray(cats) ? cats : [])
        ];
        
        setCategories(formattedCats);
        
        const channelsList = Array.isArray(allChannels) ? allChannels : [];
        setChannels(channelsList);

        const myListStr = localStorage.getItem('my_list');
        if (myListStr) {
          setMyList(JSON.parse(myListStr));
        }
      } catch (error) {
        console.error('Failed to fetch live tv data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const toggleMyList = (e: React.MouseEvent, channel: any) => {
    e.stopPropagation();
    try {
      let newList = [...myList];
      const isInList = newList.some((item) => item.id === channel.stream_id && item.type === 'live');
      
      if (isInList) {
        newList = newList.filter((item) => !(item.id === channel.stream_id && item.type === 'live'));
      } else {
        newList.unshift({
          id: channel.stream_id,
          type: 'live',
          title: channel.name,
          cover: channel.stream_icon,
          timestamp: Date.now()
        });
      }
      
      setMyList(newList);
      localStorage.setItem('my_list', JSON.stringify(newList));
    } catch (err) {
      console.error("Failed to update my list", err);
    }
  };

  const filteredChannels = channels.filter((ch) => {
    const matchesSearch = ch.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeCategoryId === 'all') return true;
    return ch.category_id === activeCategoryId;
  });

  const handlePlay = (channel: any) => {
    if (!user || !channel) return;
    const url = getStreamUrl(user, 'live', channel.stream_id, 'm3u8');
    navigate('/player', { state: { url, title: channel.name, type: 'live' } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black w-full overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:px-8 z-20 bg-gradient-to-b from-black/80 to-transparent shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ArrowRight size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Tv size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">البث المباشر</h1>
          </div>
        </div>
        <div className="relative w-full max-w-xs hidden md:block">
          <input
            type="text"
            placeholder="ابحث عن قناة..."
            className="w-full bg-white/10 border border-white/10 rounded-full py-2.5 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 text-white font-medium transition-all placeholder:text-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-3 text-zinc-400" size={18} />
        </div>
      </header>

      {/* Mobile Search */}
      <div className="px-6 pb-4 md:hidden shrink-0">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="ابحث عن قناة..."
            className="w-full bg-white/10 border border-white/10 rounded-full py-2.5 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary text-white font-medium transition-all placeholder:text-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-3 text-zinc-400" size={18} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden px-4 md:px-6 pb-24 gap-4">
        {/* Sidebar / Categories */}
        <div className="w-full md:w-72 glass-panel rounded-[2rem] flex flex-col z-10 shrink-0 overflow-hidden border border-white/5">
          <div className="p-5 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-lg text-white tracking-tight">التصنيفات</h3>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar p-3">
            <div className="flex md:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => setActiveCategoryId(cat.category_id)}
                  className={`px-4 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 text-right flex items-center justify-between group ${
                    activeCategoryId === cat.category_id
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                      : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat.category_name}</span>
                  {activeCategoryId === cat.category_id && (
                    <motion.div layoutId="active-cat-indicator" className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 flex flex-col overflow-hidden glass-panel rounded-[2rem] border border-white/5">
          <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredChannels.map((channel) => {
                const isInList = myList.some((item) => item.id === channel.stream_id && item.type === 'live');
                return (
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={channel.stream_id}
                    onClick={() => handlePlay(channel)}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-right w-full group cursor-pointer relative"
                  >
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-zinc-900 p-1 shadow-inner border border-white/5 flex items-center justify-center overflow-hidden">
                        <img
                          src={channel.stream_icon || 'https://picsum.photos/seed/placeholder/100/100'}
                          alt={channel.name}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/100/100'; }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Play size={24} className="text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="text-right flex-1 overflow-hidden">
                      <h4 className="font-bold text-white truncate text-sm group-hover:text-primary transition-colors pr-6">{channel.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1 truncate">القناة {channel.num}</p>
                    </div>
                    
                    <button
                      onClick={(e) => toggleMyList(e, channel)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      {isInList ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </motion.div>
                );
              })}
            </div>
            
            {filteredChannels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
                <Search size={64} className="mb-6 opacity-20" />
                <p className="font-medium text-xl text-zinc-400">لا توجد قنوات مطابقة للبحث</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
