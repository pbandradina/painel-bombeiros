import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Layout } from '../components/Layout';
import { Users, Plus, Pencil, Trash2, Calendar } from 'lucide-react';

export default function Home() {
  const utils = trpc.useUtils();
  const { data: bombeiros, isLoading } = trpc.bombeiros.list.useQuery();
  
  // Função para deletar bombeiro
  const deleteMutation = trpc.bombeiros.delete.useMutation({
    onSuccess: () => utils.bombeiros.list.invalidate()
  });

  if (isLoading) return <div className="p-8 text-red-500 font-bold animate-pulse">CARREGANDO EFETIVO...</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* CARD PRINCIPAL (ESTILO DA SUA IMAGEM) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 text-slate-800">
            <Users size={20} />
            <h2 className="font-bold">Gerenciar Bombeiros ({bombeiros?.length || 0})</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* BOTÃO ADICIONAR AZUL */}
            <button className="w-full bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200">
              <Plus size={20} />
              Adicionar Bombeiro
            </button>

            {/* LISTA DE BOMBEIROS */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {bombeiros?.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">{b.nome}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <span className="text-blue-600 font-bold">{b.equipe}</span> • Desde {new Date(b.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('Excluir bombeiro?')) deleteMutation.mutate(b.id) }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}