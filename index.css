import { Outlet, NavLink } from 'react-router-dom';
import { Home, Tv, Film, Clapperboard, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function Layout() {
  const navItems = [
    { path: '/home', icon: Home, label: 'الرئيسية' },
    { path: '/live', icon: Tv, label: 'مباشر' },
    { path: '/movies', icon: Film, label: 'أفلام' },
    { path: '/series', icon: Clapperboard, label: 'مسلسلات' },
    { path: '/settings', icon: Settings, label: 'إعدادات' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950">
      {/* Sidebar Navigation (Desktop/Tablet/TV) */}
      <nav className="hidden md:flex flex-col w-20 lg:w-64 bg-zinc-900/50 border-r border-zinc-800 p-4 gap-6">
        <div className="text-2xl font-bold text-emerald-500 mb-8 px-2">NASHMMI</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            data-tv-focusable
            data-tv-id={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-xl transition-all ${
                isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`
            }
          >
            <item.icon size={24} />
            <span className="hidden lg:block font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full ${
                  isActive ? 'text-emerald-400' : 'text-zinc-500'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
