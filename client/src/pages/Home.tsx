import React from 'react';
import { trpc } from '../lib/trpc';
import { Layout } from '../components/Layout';
import { Users, Clock, Activity } from 'lucide-react';

export default function Home() {
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();

  if (isLoading) return <div className="p-8 text-red-500 font-bold">CARREGANDO...</div>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <Users className="text-red-500 mb-2" />
            <p className="text-slate-500 text-xs font-black">EFETIVO TOTAL</p>
            <h3 className="text-2xl font-bold text-white">{bombeiros?.length || 0}</h3>
          </div>
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <Activity className="text-green-500 mb-2" />
            <p className="text-slate-500 text-xs font-black">STATUS</p>
            <h3 className="text-2xl font-bold text-white">OPERACIONAL</h3>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-[#1E293B] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Equipe</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bombeiros?.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-200 uppercase text-sm">{b.nome}</td>
                  <td className="px-6 py-4">
                    <span className="text-blue-500 font-black text-xs">EQUIPE {b.equipe}</span>
                  </td>
                  <td className="px-6 py-4 text-red-500 text-xs font-bold cursor-pointer">DETALHES</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}