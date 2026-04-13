import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LogOut, Bell } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="p-6 flex flex-col items-center gap-2 border-b border-slate-800">
          {/* BRASÃO RESTAURADO */}
          <img src="/logo-20gb.png" alt="Brasão 20º GB" className="w-20 h-20 object-contain drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
          <span className="text-sm font-black text-white tracking-widest text-center">20º GB - ANDRADINA</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
            { name: 'Bombeiros', icon: Users, path: '/bombeiros' },
            { name: 'Escalas', icon: Calendar, path: '/escalas' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">SISTEMA OPERACIONAL / <span className="text-red-500">EFETIVO</span></div>
          <div className="flex items-center gap-4"><Bell size={20} className="text-slate-400" /><div className="h-8 w-8 bg-red-600 rounded text-white flex items-center justify-center font-black text-xs">AD</div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
};