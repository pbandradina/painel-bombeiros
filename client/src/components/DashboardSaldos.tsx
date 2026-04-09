import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEscala } from '@/contexts/EscalaContext';
import { useLayout } from '@/contexts/LayoutContext';
import { CalculoFO } from '@/lib/foCalculator';
import { TrendingUp, AlertCircle, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { EditorBombeiro } from './EditorBombeiro';

// Ordem de hierarquia (mesmo do GerenciadorBombeiros)
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

  // Definir grid baseado no tamanho
  const gridConfig = {
    compacto: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    normal: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    grande: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  if (bombeiros.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500 text-sm">Nenhum bombeiro adicionado ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Dashboard de Folgas Obrigatórias</h2>

      <div className={`grid ${gridConfig[tamanhoDashboard]} gap-2`}>
        {ordenarBombeiros(bombeiros).map(bombeiro => {
          const calculo = calculos[bombeiro.id] || {
            foConquistadas: 0,
            foUsadas: 0,
            foDisponiveis: 0,
            saldoCicloAtual: 0,
            periodosConquista: [],
          };

          return (
            <div key={bombeiro.id}>
              <EditorBombeiro
                bombeiro={bombeiro}
                isOpen={bombeiroEmEdicao === bombeiro.id}
                onClose={() => setBombeiroEmEdicao(null)}
              />
              <Card className="hover:shadow-md transition">
                <CardHeader className={`${tamanhoDashboard === 'compacto' ? 'pb-1' : 'pb-2'}`}>
                  <CardTitle className={`${tamanhoDashboard === 'compacto' ? 'text-xs' : 'text-sm'} flex items-center justify-between gap-2`}>
                    <span className="flex items-center gap-2">
                      {bombeiro.nome}
                      <span className="text-xs font-normal bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {bombeiro.equipe}
                      </span>
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setBombeiroEmEdicao(bombeiro.id)}
                        title="Editar bombeiro"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => removerBombeiro(bombeiro.id)}
                        title="Remover bombeiro"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
              <CardContent className={`${tamanhoDashboard === 'compacto' ? 'space-y-1' : 'space-y-2'}`}>
                {/* FOs Conquistadas */}
                <div className={`flex items-center justify-between ${tamanhoDashboard === 'compacto' ? 'p-1' : 'p-2'} bg-green-50 rounded border border-green-200`}>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-${tamanhoDashboard === 'compacto' ? '3' : '4'} h-${tamanhoDashboard === 'compacto' ? '3' : '4'} text-green-600`} />
                    <span className={`${tamanhoDashboard === 'compacto' ? 'text-xs' : 'text-xs'} font-medium text-gray-700`}>Conquistadas</span>
                  </div>
                  <span className={`${tamanhoDashboard === 'compacto' ? 'text-base' : 'text-lg'} font-bold text-green-600`}>
                    {calculo.foConquistadas}
                  </span>
                </div>

                {/* FOs Usadas */}
                <div className={`flex items-center justify-between ${tamanhoDashboard === 'compacto' ? 'p-1' : 'p-2'} bg-orange-50 rounded border border-orange-200`}>
                  <div className="flex items-center gap-1">
                    <AlertCircle className={`w-${tamanhoDashboard === 'compacto' ? '3' : '4'} h-${tamanhoDashboard === 'compacto' ? '3' : '4'} text-orange-600`} />
                    <span className={`${tamanhoDashboard === 'compacto' ? 'text-xs' : 'text-xs'} font-medium text-gray-700`}>Usadas</span>
                  </div>
                  <span className={`${tamanhoDashboard === 'compacto' ? 'text-base' : 'text-lg'} font-bold text-orange-600`}>
                    {calculo.foUsadas}
                  </span>
                </div>

                {/* Saldo de FOs Disponíveis */}
                <div className={`flex items-center justify-between ${tamanhoDashboard === 'compacto' ? 'p-1' : 'p-2'} bg-blue-50 rounded border border-blue-200`}>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-${tamanhoDashboard === 'compacto' ? '3' : '4'} h-${tamanhoDashboard === 'compacto' ? '3' : '4'} text-blue-600`} />
                    <span className={`${tamanhoDashboard === 'compacto' ? 'text-xs' : 'text-xs'} font-medium text-gray-700`}>Disponível</span>
                  </div>
                  <span className={`${tamanhoDashboard === 'compacto' ? 'text-base' : 'text-lg'} font-bold text-blue-600`}>
                    {calculo.foDisponiveis}
                  </span>
                </div>

                {/* Progresso para próxima FO */}
                <div className={`${tamanhoDashboard === 'compacto' ? 'p-1' : 'p-2'} bg-purple-50 rounded border border-purple-200`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${tamanhoDashboard === 'compacto' ? 'text-xs' : 'text-xs'} font-medium text-gray-700`}>Progresso</span>
                    <span className={`${tamanhoDashboard === 'compacto' ? 'text-xs' : 'text-xs'} font-bold text-purple-600`}>
                      {calculo.saldoCicloAtual}/9
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(calculo.saldoCicloAtual / 9) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
