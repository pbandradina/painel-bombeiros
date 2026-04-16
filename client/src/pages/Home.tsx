import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Layout } from '../components/Layout';
import { calcularFO } from '../lib/foCalculator';
import { Users, Plus, Trash2, X, Activity, Shield } from 'lucide-react';

export default function Home() {
  const [modal, setModal] = useState(false);
  const [nome, setNome] = useState('');
  const [equipe, setEquipe] = useState<'VD' | 'AM' | 'AZ'>('VD');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  
  const utils = trpc.useUtils(); 

  // Buscar lista de bombeiros
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();
  
  // Função para ADICIONAR
  const addBombeiro = trpc.bombeiros.create.useMutation({
    onSuccess: () => {
      utils.bombeiros.list.invalidate(); 
      setModal(false);
      setNome('');
    },
    onError: (err) => alert("Erro ao salvar: " + err.message)
  });

  // Função para EXCLUIR
  const delBombeiro = trpc.bombeiros.delete.useMutation({
    onSuccess: () => {
      utils.bombeiros.list.invalidate();
      alert("Bombeiro removido com sucesso!");
    }
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#020617]">
      <div className="text-red-500 font-black animate-pulse tracking-[0.2em] uppercase">Sincronizando Base de Dados...</div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1E293B] p-8 rounded-3xl border border-slate-800 shadow-2xl gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-900/40">
              <Shield className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Quartel de Andradina</h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">Controle de Efetivo Operacional</p>
            </div>
          </div>
          <button 
            onClick={() => setModal(true)} 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20 uppercase text-xs tracking-widest"
          >
            <Plus size={20} /> Adicionar Bombeiro
          </button>
        </div>

        {/* GRID DE CARDS DOS BOMBEIROS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bombeiros?.map((b: any) => {
            // Executa a lógica oficial do Manus para cada um
            const stats = calcularFO(b, new Date());
            
            return (
              <div key={b.id} className="bg-[#0F172A] border border-slate-800 p-6 rounded-3xl flex flex-col gap-6 hover:border-red-600/50 transition-all shadow-xl relative group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white shadow-2xl ${
                      b.equipe === 'VD' ? 'bg-green-600' : b.equipe === 'AM' ? 'bg-yellow-500 text-black' : 'bg-blue-600'
                    }`}>
                      {b.equipe}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-100 uppercase text-xl tracking-tight">{b.nome}</h3>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest">ADMISSÃO: {new Date(b.data_inicio || b.dataInicio).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => confirm(`Deseja remover ${b.nome} do sistema?`) && delBombeiro.mutate(b.id)} 
                    className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                  >
                    <Trash2 size={20}/>
                  </button>
                </div>

                {/* ESTATÍSTICAS DE FO */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1">FO Conquistadas</p>
                    <p className="text-2xl font-bold text-green-500">{stats.foConquistadas}</p>
                  </div>
                  <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-amber-500">{stats.foDisponiveis}</p>
                  </div>
                </div>

                {/* BARRA DE PROGRESSO DO CICLO */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">Progresso do Ciclo</p>
                    <p className="text-xs font-bold text-red-500">{stats.saldoCicloAtual}/9</p>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                      style={{ width: `${(stats.saldoCicloAtual / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL DE CADASTRO */}
        {modal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-black uppercase text-lg tracking-tighter">Novo Bombeiro</h3>
                  <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Preencha os dados operacionais</p>
                </div>
                <button onClick={() => setModal(false)} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">Nome de Guerra</label>
                  <input 
                    autoFocus
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    className="w-full bg-[#020617] border border-slate-700 rounded-2xl p-5 text-white uppercase font-black outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-800" 
                    placeholder="EX: SGT PM CLOVIS" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">Equipe/Turno</label>
                    <select 
                      value={equipe}
                      onChange={(e: any) => setEquipe(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-700 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="VD">VERDE</option>
                      <option value="AM">AMARELA</option>
                      <option value="AZ">AZUL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">Data Início</label>
                    <input 
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-700 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => addBombeiro.mutate({ nome, equipe, dataInicio: new Date(dataInicio) })} 
                  disabled={addBombeiro.isPending}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-red-900/20 transition-all uppercase tracking-[0.2em] text-xs mt-4 disabled:opacity-50"
                >
                  {addBombeiro.isPending ? 'PROCESSANDO...' : 'REGISTRAR NO SISTEMA'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}