import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Flame, Bell } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Bombeiros', icon: Users, path: '/bombeiros' },
    { name: 'Escalas', icon: Calendar, path: '/escalas' },
    { name: 'Configurações', icon: Settings, path: '/config' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* SIDEBAR DARK */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/40">
            <Flame className="text-white fill-white" size={20} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">SGB-PAINEL</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-bold">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Quartel de Andradina / <span className="text-red-500">Operacional</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors"><Bell size={20}/></button>
            <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs">AD</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};