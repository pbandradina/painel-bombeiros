import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { calcularFO } from '../lib/foCalculator';
import { Users, Plus, Trash2, X, Shield } from 'lucide-react';

export default function Home() {
  const [modal, setModal] = useState(false);
  const [nome, setNome] = useState('');
  const [equipe, setEquipe] = useState('VD');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  
  const utils = trpc.useUtils(); 
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();
  
  const addBombeiro = trpc.bombeiros.create.useMutation({
    onSuccess: () => {
      utils.bombeiros.list.invalidate(); 
      setModal(false);
      setNome('');
    }
  });

  const delBombeiro = trpc.bombeiros.delete.useMutation({
    onSuccess: () => utils.bombeiros.list.invalidate()
  });

  if (isLoading) return <div className="flex items-center justify-center h-full text-red-500 font-black animate-pulse uppercase tracking-widest text-xs">Sincronizando Banco de Dados...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER DA PÁGINA */}
      <div className="flex justify-between items-center bg-[#1E293B] p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quartel de Andradina</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Controle de Efetivo</p>
        </div>
        <button onClick={() => setModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all text-xs uppercase shadow-xl shadow-blue-900/40">
          <Plus size={18} /> Adicionar Bombeiro
        </button>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bombeiros?.map((b: any) => {
          const stats = calcularFO(b, new Date());
          return (
            <div key={b.id} className="bg-[#0F172A] border border-slate-800 p-6 rounded-[2rem] flex justify-between items-center hover:border-slate-600 transition-all shadow-xl">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white ${b.equipe === 'VD' ? 'bg-green-600' : b.equipe === 'AM' ? 'bg-yellow-500 text-black' : 'bg-blue-600'}`}>{b.equipe}</div>
                <div>
                  <h3 className="font-bold text-slate-100 uppercase text-lg">{b.nome}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded">FO: {stats.foConquistadas}</span>
                    <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded">DISP: {stats.foDisponiveis}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => confirm(`Remover ${b.nome}?`) && delBombeiro.mutate(b.id)} className="p-3 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
            </div>
          );
        })}
      </div>

      {/* MODAL ADICIONAR */}
      {modal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <h3 className="text-white font-black uppercase text-sm tracking-widest text-center">Novo Cadastro</h3>
            <div className="space-y-4">
              <input value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-2xl p-5 text-white uppercase font-bold outline-none focus:ring-2 focus:ring-blue-600" placeholder="NOME DE GUERRA" />
              <select value={equipe} onChange={e => setEquipe(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-600">
                 <option value="VD">EQUIPE VERDE</option>
                 <option value="AM">EQUIPE AMARELA</option>
                 <option value="AZ">EQUIPE AZUL</option>
              </select>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-blue-600" />
              <button onClick={() => addBombeiro.mutate({ nome, equipe, dataInicio: new Date(dataInicio) })} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">Finalizar Registro</button>
              <button onClick={() => setModal(false)} className="w-full text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}