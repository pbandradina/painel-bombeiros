import React from 'react';
import { trpc } from '../lib/trpc';
import { Users, Clock, CalendarCheck, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();

  if (isLoading) return <div className="flex items-center justify-center h-full text-slate-400">Carregando sistema...</div>;

  const stats = [
    { label: 'Efetivo Total', value: bombeiros?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Em Serviço', value: '08', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Escalas do Mês', value: '24', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Disponibilidade', value: '94%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* TABELA DE BOMBEIROS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Efetivo de Bombeiros</h2>
          <button className="text-blue-600 text-sm font-semibold hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Bombeiro</th>
                <th className="px-6 py-4">Equipe / Turno</th>
                <th className="px-6 py-4">Data de Início</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bombeiros?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold uppercase">
                        {b.nome.substring(0, 2)}
                      </div>
                      <span className="font-bold text-slate-700 uppercase">{b.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                      b.equipe === 'VD' ? 'bg-emerald-100 text-emerald-700' : 
                      b.equipe === 'AM' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {b.equipe === 'VD' ? 'EQUIPE VERDE' : b.equipe === 'AM' ? 'EQUIPE AMARELA' : 'EQUIPE AZUL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(b.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 font-medium text-sm">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}