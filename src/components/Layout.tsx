import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Tv, Film, Clapperboard, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/home', icon: Home, label: 'الرئيسية' },
    { path: '/live', icon: Tv, label: 'مباشر' },
    { path: '/movies', icon: Film, label: 'أفلام' },
    { path: '/series', icon: Clapperboard, label: 'مسلسلات' },
    { path: '/settings', icon: Settings, label: 'إعدادات' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-color-bg-light pb-24">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] glass-panel shadow-2xl rounded-[2rem] z-50">
        <div className="flex justify-around items-center h-20 px-4 w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-16 h-full transition-all duration-500 ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/10 rounded-2xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <item.icon
                      size={24}
                      className={`mb-1.5 transition-all duration-500 ${
                        isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'scale-100'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[11px] font-bold transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-0'}`}>
                      {item.label}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
