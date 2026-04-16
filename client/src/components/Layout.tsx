import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LogOut, Bell, Flame } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Bombeiros', icon: Users, path: '/bombeiros' },
    { name: 'Escalas', icon: Calendar, path: '/escalas' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col">
        <div className="p-6 flex flex-col items-center gap-3 border-b border-slate-800">
          <Flame className="text-red-500" size={32} />
          <span className="text-xl font-black text-white italic">SGB-PAINEL</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path ? 'bg-red-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-bold">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">20º GB / ANDRADINA</div>
          <div className="flex items-center gap-4"><Bell size={20}/><div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center text-white font-black text-xs">AD</div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
};