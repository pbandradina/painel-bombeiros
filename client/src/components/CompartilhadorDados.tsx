import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEscala } from '@/contexts/EscalaContext';
import { useLayout } from '@/contexts/LayoutContext';
import { Edit2, Trash2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { EditorBombeiro } from './EditorBombeiro';

const HIERARQUIA_ORDEM = [
  '1º Sgt PM Coltri',
  '1º Sgt PM Berto',
  '2º Sgt PM Bruce',
  '2º Sgt PM Mathias',
  '3º Sgt PM Caio César',
  'Cb PM Alain',
  'Cb PM Alessandro',
  'Cb PM Silva Jr',
  'Cb PM Silveira',
  'Cb PM Bravo',
  'Cb PM Rossete',
  'Cb PM Caroline',
  'Cb PM Bortoleto',
  'Cb PM Vieira',
  'Cb PM Saulo',
  'Cb PM Corrêa',
  'Cb PM Luiz Gustavo',
  'Cb PM Hugo',
  'Sd PM Fausto',
  'Sd PM Lucian',
  'Sd PM Anderson Ferreira',
];

const ordenarBombeiros = (bombeiros: any[]) => {
  return [...bombeiros].sort((a, b) => {
    const indexA = HIERARQUIA_ORDEM.indexOf(a.nome);
    const indexB = HIERARQUIA_ORDEM.indexOf(b.nome);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

export function DashboardSaldos() {
  const { bombeiros, calculos, removerBombeiro } = useEscala();
  const { tamanhoDashboard } = useLayout();
  const [bombeiroEmEdicao, setBombeiroEmEdicao] = useState<string | null>(null);

  const gridConfig = {
    compacto: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    normal: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    grande: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  if (bombeiros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-lg font-bold uppercase tracking-widest">Nenhum bombeiro encontrado</p>
        <p className="text-xs">Adicione bombeiros na aba "Bombeiros" ou importe uma planilha.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Dashboard de Folgas Obrigatórias</h2>
      </div>

      <div className={`grid ${gridConfig[tamanhoDashboard]} gap-4`}>
        {ordenarBombeiros(bombeiros).map(bombeiro => {
          const calculo = calculos[bombeiro.id] || {
            foConquistadas: 0,
            foUsadas: 0,
            foDisponiveis: 0,
            saldoCicloAtual: 0,
          };

          return (
            <div key={bombeiro.id} className="group">
              <EditorBombeiro
                bombeiro={bombeiro}
                isOpen={bombeiroEmEdicao === bombeiro.id}
                onClose={() => setBombeiroEmEdicao(null)}
              />
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-[10px] text-white ${
                      bombeiro.equipe === 'VD' ? 'bg-green-600' : 
                      bombeiro.equipe === 'AM' ? 'bg-yellow-500 text-black' : 
                      'bg-blue-600'
                    }`}>
                      {bombeiro.equipe}
                    </div>
                    <span className="font-bold text-slate-100 text-sm uppercase truncate max-w-[120px]">
                      {bombeiro.nome}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setBombeiroEmEdicao(bombeiro.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => confirm(`Remover ${bombeiro.nome}?`) && removerBombeiro(bombeiro.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Conquistadas</p>
                      <p className="text-lg font-black text-green-500">{calculo.foConquistadas}</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Usadas</p>
                      <p className="text-lg font-black text-orange-500">{calculo.foUsadas}</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Disponível</p>
                      <p className="text-lg font-black text-blue-500">{calculo.foDisponiveis}</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progresso do Ciclo</span>
                      <span className="text-[10px] font-black text-white bg-slate-700 px-2 py-0.5 rounded">{calculo.saldoCicloAtual}/9</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all duration-500"
                        style={{ width: `${(calculo.saldoCicloAtual / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}