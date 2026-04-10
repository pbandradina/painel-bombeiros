import React from 'react';
import { trpc } from '../lib/trpc';
import { Users, Clock, ShieldAlert, Activity } from 'lucide-react';

export default function Dashboard() {
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();

  if (isLoading) return <div className="flex items-center justify-center h-full text-red-500 animate-pulse font-bold">CARREGANDO SISTEMA OPERACIONAL...</div>;

  const stats = [
    { label: 'EFETIVO TOTAL', value: bombeiros?.length || 0, icon: Users, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'PRONTIDÃO HOJE', value: '12', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'OCORRÊNCIAS', value: '03', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'TEMPO RESPOSTA', value: '8min', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className={`${stat.bg} ${stat.color} w-fit p-3 rounded-xl mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* TABELA DARK */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-sm font-black text-white uppercase tracking-tighter">Lista de Prontidão Nacional</h2>
          <span className="bg-red-600/20 text-red-500 text-[10px] px-3 py-1 rounded-full font-bold">SISTEMA ATIVO</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-500 text-[10px] uppercase font-black border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nome do Bombeiro</th>
                <th className="px-6 py-4">Equipe Operacional</th>
                <th className="px-6 py-4">Admissão</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bombeiros?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-200 uppercase text-sm">{b.nome}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`font-black tracking-widest ${
                      b.equipe === 'VD' ? 'text-green-500' : 
                      b.equipe === 'AM' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                      • EQUIPE {b.equipe === 'VD' ? 'VERDE' : b.equipe === 'AM' ? 'AMARELA' : 'AZUL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(b.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-[10px] font-bold text-red-500 underline cursor-pointer">
                    DETALHES
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