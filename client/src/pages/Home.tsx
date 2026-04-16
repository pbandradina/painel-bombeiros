import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Layout } from '../components/Layout';
import { calcularFO } from '../lib/foCalculator';
import { Users, Plus, Trash2, X } from 'lucide-react';

export default function Home() {
  const utils = trpc.useUtils();
  const [modal, setModal] = useState(false);
  const [nome, setNome] = useState('');
  
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();
  const addBombeiro = trpc.bombeiros.create.useMutation({
    onSuccess: () => { utils.bombeiros.list.invalidate(); setModal(false); setNome(''); }
  });
  const delBombeiro = trpc.bombeiros.delete.useMutation({
    onSuccess: () => utils.bombeiros.list.invalidate()
  });

  if (isLoading) return <div className="p-10 text-red-500 font-bold animate-pulse text-center tracking-widest">SISTEMA OPERACIONAL...</div>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-2xl">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Efetivo de Prontidão</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">20º GB - Andradina</p>
          </div>
          <button onClick={() => setModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all uppercase text-xs">
            <Plus size={18} /> Adicionar Bombeiro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bombeiros?.map((b: any) => {
            const stats = calcularFO(b.data_inicio, b.escalas);
            return (
              <div key={b.id} className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:border-slate-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-white ${b.equipe === 'VD' ? 'bg-green-600' : b.equipe === 'AM' ? 'bg-yellow-500 text-black' : 'bg-blue-600'}`}>{b.equipe}</div>
                  <div>
                    <h3 className="font-bold text-slate-100 uppercase">{b.nome}</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded">FO CONQUISTADAS: {stats.conquistadas}</span>
                      <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">DISPONÍVEIS: {stats.disponiveis}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => confirm(`Remover ${b.nome}?`) && delBombeiro.mutate(b.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            );
          })}
        </div>

        {/* MODAL ADICIONAR */}
        {modal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] border border-slate-700 w-full max-w-sm rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center"><h3 className="text-white font-black uppercase text-sm">Novo Cadastro</h3><button onClick={() => setModal(false)}><X className="text-slate-400"/></button></div>
              <input value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl p-4 text-white uppercase font-bold" placeholder="NOME DE GUERRA" />
              <button onClick={() => addBombeiro.mutate({ nome, equipe: 'VD', dataInicio: new Date() })} className="w-full bg-green-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs">Salvar no Sistema</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}