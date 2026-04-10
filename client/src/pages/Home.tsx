import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportadorExcel } from '@/components/ImportadorExcel';
import { DashboardSaldos } from '@/components/DashboardSaldos';
import { CalendarioDinamico } from '@/components/CalendarioDinamico';
import { GerenciadorBombeiros } from '@/components/GerenciadorBombeiros';
import { Layout } from "../components/Layout";
import { ExportadorExcel } from '@/components/ExportadorExcel';
import { RelatorioPeriodo } from '@/components/RelatorioPeriodo';
import { trpc } from '@/lib/trpc';
import { Calendar, BarChart3, Upload, Loader2 } from 'lucide-react';

const BRASAO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663140978275/UMQjPhNB7E8HCqCKmXz2QJ/20ºGB_b1525e8e.png';

export default function Home() {
  const { data: bombeiros = [], isLoading } = trpc.bombeiros.list.useQuery();
  const [bomberroSelecionado, setBomberroSelecionado] = useState<string | null>(null);
  const updateBombeiro = trpc.bombeiros.update.useMutation();

  const bomberroAtual = bombeiros.find((b: any) => b.id === bomberroSelecionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-4 justify-between">
            {/* Brasão e Títulos */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0">
                <img 
                  src={BRASAO_URL} 
                  alt="Brasão 20º GB" 
                  className="h-24 w-auto"
                />
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Controle de Frequência e Afastamentos
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Dashboard de Folgas Obrigatórias e Escalas 24x48
                </p>
                <div className="mt-2 flex gap-4 text-xl font-semibold text-red-600">
                  <span>2º SGB</span>
                  <span>PB Andradina</span>
                </div>
              </div>
            </div>
            
            {/* Controles Layout no lado direito */}
            <div className="flex-shrink-0">
              <ControlesLayout />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Gerenciar Bombeiros em 4 colunas */}
          <GerenciadorBombeiros />
          
          {/* Ferramentas de Exportação e Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ExportadorExcel />
            <RelatorioPeriodo />
          </div>

          {/* Abas principais */}
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="calendario" className="flex items-center gap-2 text-xs sm:text-sm">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Calendário</span>
                <span className="sm:hidden">Cal</span>
              </TabsTrigger>
              <TabsTrigger value="importar" className="flex items-center gap-2 text-xs sm:text-sm">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
                <span className="sm:hidden">Imp</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Carregando dados...</p>
                </div>
              ) : bombeiros.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-4">Nenhum bombeiro adicionado ainda.</p>
                  <p className="text-sm text-gray-500">Use o botão "Adicionar Bombeiro" acima ou importe uma planilha Excel.</p>
                </div>
              ) : (
                <DashboardSaldos />
              )}
            </TabsContent>

            {/* Calendário Tab */}
            <TabsContent value="calendario" className="space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Carregando dados...</p>
                </div>
              ) : bombeiros.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-4">Nenhum bombeiro adicionado ainda.</p>
                  <p className="text-sm text-gray-500">Adicione um bombeiro para visualizar o calendário de escalas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Selecione um Bombeiro:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {bombeiros.map((bombeiro: any) => {
                        const dataInicio = bombeiro.dataInicio ? new Date(bombeiro.dataInicio).toLocaleDateString('pt-BR') : 'N/A';
                        return (
                          <button
                            key={bombeiro.id}
                            onClick={() => setBomberroSelecionado(bombeiro.id)}
                            className={`p-2 rounded-lg font-medium text-sm transition text-left ${
                              bomberroSelecionado === bombeiro.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                            }`}
                            title={`${bombeiro.nome} - Início: ${dataInicio}`}
                          >
                            <span className="truncate block font-semibold">{bombeiro.nome}</span>
                            <span className={`text-xs ${
                              bomberroSelecionado === bombeiro.id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              Início: {dataInicio}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {bomberroAtual && (
                    <div className="mt-4">
                      <CalendarioDinamico
                        .map((bombeiro: any) =>
                        bomberoNome={bomberroAtual.nome}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Importar Tab */}
            <TabsContent value="importar" className="space-y-4">
              <div className="max-w-2xl space-y-4">
                <ImportadorExcel />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Você também pode usar os botões acima para exportar dados em Excel, fazer backup em JSON ou gerar relatórios de período.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12 py-4 text-center text-xs">
        <p>
          © 2026 Controle de Frequência e Afastamentos • 2º SGB • PB Andradina • by Sgt Clovis
        </p>
      </footer>
    </div>
  );
}
