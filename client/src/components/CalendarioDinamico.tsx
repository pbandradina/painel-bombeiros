import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCorOficial, formatarData, getPeriodoFONaData, formatarDataExibicao, calcularFO } from '@/lib/foCalculator';
import { useEscala } from '@/contexts/EscalaContext';
import { useLayout } from '@/contexts/LayoutContext';

interface CalendarioDinamicoProps {
  bomberoId: string;
  bomberoNome: string;
}

const SIGLAS_DISPONIVEIS = [
  { sigla: 'VD', label: 'Prontidão Verde', cor: 'bg-green-100 text-green-800' },
  { sigla: 'AM', label: 'Prontidão Amarela', cor: 'bg-yellow-100 text-yellow-800' },
  { sigla: 'AZ', label: 'Prontidão Azul', cor: 'bg-blue-100 text-blue-800' },
  { sigla: 'EX', label: 'Expediente', cor: 'bg-cyan-100 text-cyan-800' },
  { sigla: 'ME', label: 'Meio Expediente', cor: 'bg-sky-100 text-sky-800' },
  { sigla: 'AG', label: 'Aglutinada', cor: 'bg-teal-100 text-teal-800' },
  { sigla: 'F', label: 'Férias', cor: 'bg-orange-100 text-orange-800' },
  { sigla: 'LP', label: 'Licença Prêmio', cor: 'bg-pink-100 text-pink-800' },
  { sigla: 'LT', label: 'Luto', cor: 'bg-gray-300 text-gray-800' },
  { sigla: 'DS', label: 'Dispensa do Serviço', cor: 'bg-red-100 text-red-800' },
  { sigla: 'FO', label: 'Folga Obrigatória', cor: 'bg-purple-100 text-purple-800' },
  { sigla: 'PA', label: 'Pausa Autorizada', cor: 'bg-slate-100 text-slate-800' },
  { sigla: 'D', label: 'Doação de Sangue', cor: 'bg-rose-100 text-rose-800' },
  { sigla: 'C', label: 'Convalescença', cor: 'bg-amber-100 text-amber-800' },
  { sigla: 'LTS', label: 'Licença Tratamento Saúde', cor: 'bg-indigo-100 text-indigo-800' },
  { sigla: 'CFS', label: 'Curso Form. Sargentos', cor: 'bg-violet-100 text-violet-800' },
  { sigla: 'CAS', label: 'Curso Aperfeiçoamento', cor: 'bg-fuchsia-100 text-fuchsia-800' },
  { sigla: 'EAP', label: 'Estágio Atualização', cor: 'bg-lime-100 text-lime-800' },
  { sigla: 'TAF', label: 'Teste Aptidão Física', cor: 'bg-emerald-100 text-emerald-800' },
  { sigla: '', label: 'Limpar', cor: 'bg-gray-100 text-gray-800' },
];

const getCorFundo = (corOficial: string): string => {
  const cores: Record<string, string> = {
    'VD': 'bg-green-50',
    'AM': 'bg-yellow-50',
    'AZ': 'bg-blue-50',
  };
  return cores[corOficial] || 'bg-white';
};

const getEstiloDia = (sigla: string): { borda: string; textColor: string; bgColor: string } => {
  const estilos: Record<string, { borda: string; textColor: string; bgColor: string }> = {
    'VD': { borda: 'border-2 border-green-600', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    'AM': { borda: 'border-2 border-yellow-600', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    'AZ': { borda: 'border-2 border-blue-600', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    'FO': { borda: 'border-3 border-purple-900', textColor: 'text-white', bgColor: 'bg-purple-600' },
    'DS': { borda: 'border-3 border-red-900', textColor: 'text-white', bgColor: 'bg-red-600' },
    'F': { borda: 'border-3 border-orange-900', textColor: 'text-white', bgColor: 'bg-orange-600' },
    'LP': { borda: 'border-3 border-pink-900', textColor: 'text-white', bgColor: 'bg-pink-600' },
    'LT': { borda: 'border-3 border-gray-900', textColor: 'text-white', bgColor: 'bg-gray-700' },
    'EX': { borda: 'border-3 border-cyan-900', textColor: 'text-white', bgColor: 'bg-cyan-600' },
    'ME': { borda: 'border-3 border-sky-900', textColor: 'text-white', bgColor: 'bg-sky-600' },
    'AG': { borda: 'border-3 border-teal-900', textColor: 'text-white', bgColor: 'bg-teal-600' },
    'D': { borda: 'border-3 border-rose-900', textColor: 'text-white', bgColor: 'bg-rose-600' },
    'C': { borda: 'border-3 border-amber-900', textColor: 'text-white', bgColor: 'bg-amber-600' },
    'LTS': { borda: 'border-3 border-indigo-900', textColor: 'text-white', bgColor: 'bg-indigo-600' },
    'CFS': { borda: 'border-3 border-violet-900', textColor: 'text-white', bgColor: 'bg-violet-600' },
    'CAS': { borda: 'border-3 border-fuchsia-900', textColor: 'text-white', bgColor: 'bg-fuchsia-600' },
    'EAP': { borda: 'border-3 border-lime-900', textColor: 'text-white', bgColor: 'bg-lime-600' },
    'TAF': { borda: 'border-3 border-emerald-900', textColor: 'text-white', bgColor: 'bg-emerald-600' },
    'PA': { borda: 'border-3 border-slate-900', textColor: 'text-white', bgColor: 'bg-slate-700' },
  };
  return estilos[sigla] || { borda: 'border-2 border-gray-400', textColor: 'text-gray-700', bgColor: 'bg-gray-100' };
};

// Funcao para calcular cor fixa da prontidao baseada no dia do ano
const getCorProntidaoFixa = (data: Date): string => {
  const diaDoAno = Math.floor((data.getTime() - new Date(data.getFullYear(), 0, 0).getTime()) / 86400000);
  const ciclo = (diaDoAno - 1) % 3; // -1 para começar com VD em 01jan (0=VD, 1=AM, 2=AZ)
  const cores = ['VD', 'AM', 'AZ'];
  return cores[ciclo];
};

// Funcao para obter cor da fonte baseada na sigla
const getCorSigla = (sigla: string): string => {
  const cores: Record<string, string> = {
    'VD': 'text-green-700',      // Verde
    'AM': 'text-yellow-700',     // Amarelo
    'AZ': 'text-blue-700',       // Azul
    'FO': 'text-purple-700',     // Roxo (diferente de preto/azul/verde/amarelo)
    'DS': 'text-red-700',        // Vermelho
    'F': 'text-orange-700',      // Laranja
    'LP': 'text-pink-700',       // Rosa
    'LT': 'text-gray-600',       // Cinza escuro
    'EX': 'text-cyan-700',       // Ciano
    'ME': 'text-sky-700',        // Azul claro
    'AG': 'text-teal-700',       // Teal
    'D': 'text-rose-700',        // Rose
    'C': 'text-amber-700',       // Âmbar
    'LTS': 'text-indigo-700',    // Indigo
    'CFS': 'text-violet-700',    // Violeta
    'CAS': 'text-fuchsia-700',   // Fúcsia
    'EAP': 'text-lime-700',      // Lima
    'TAF': 'text-emerald-700',   // Esmeralda
    'PA': 'text-slate-700',      // Slate
  };
  return cores[sigla] || 'text-red-700'; // Vermelho como padrão para siglas desconhecidas
};

const getEstiloProntidaoFixa = (data: Date): { borda: string; textColor: string; bgColor: string } => {
  const prontidao = getCorProntidaoFixa(data);
  return getEstiloDia(prontidao);
};

export function CalendarioDinamico({ bomberoId, bomberoNome }: CalendarioDinamicoProps) {
  const { bombeiros, atualizarEscala, calculos } = useEscala();
  const { tamanhoCalendario } = useLayout();
  const [mesSelecionado, setMesSelecionado] = useState(new Date(2026, 0, 1));
  const [diaEdicao, setDiaEdicao] = useState<string | null>(null);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [siglaPeríodo, setSiglaPeríodo] = useState('VD');
  const [aplicandoPeriodo, setAplicandoPeriodo] = useState(false);

  // Definir tamanhos baseado no contexto
  const tamanhos = {
    pequeno: { gap: 'gap-0.25', textDia: 'text-xs', textSigla: 'text-xs', padding: 'p-0.5', gridCols: 'grid-cols-7', headerHeight: 'h-6', cellHeight: 'h-20' },
    medio: { gap: 'gap-0.5', textDia: 'text-xs', textSigla: 'text-xs', padding: 'p-1', gridCols: 'grid-cols-7', headerHeight: 'h-7', cellHeight: 'h-24' },
    grande: { gap: 'gap-1', textDia: 'text-sm', textSigla: 'text-sm', padding: 'p-1.5', gridCols: 'grid-cols-7', headerHeight: 'h-8', cellHeight: 'h-28' },
  };
  const t = tamanhos[tamanhoCalendario];

  const bombeiro = bombeiros.find(b => b.id === bomberoId);
  
  // CORREÇÃO: Recalcular calculo sempre que bombeiro.escala muda
  const calculo = useMemo(() => {
    if (!bombeiro) return null;
    return calcularFO(bombeiro, new Date(2026, 11, 31));
  }, [bombeiro?.escala]);
  
  if (!bombeiro || !calculo) return null;

  const ano = mesSelecionado.getFullYear();
  const mes = mesSelecionado.getMonth();

  // Obter primeiro e último dia do mês
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diasDoMes = ultimoDia.getDate();
  const diaSemanaPrimeiro = primeiroDia.getDay();

  // Criar array de dias para o calendário
  const diasCalendario: (number | null)[] = [];
  for (let i = 0; i < diaSemanaPrimeiro; i++) {
    diasCalendario.push(null);
  }
  for (let dia = 1; dia <= diasDoMes; dia++) {
    diasCalendario.push(dia);
  }

  const handleMesAnterior = () => {
    setMesSelecionado(new Date(ano, mes - 1, 1));
  };

  const handleProximoMes = () => {
    setMesSelecionado(new Date(ano, mes + 1, 1));
  };

  const handleAtualizarDia = async (dia: number, sigla: string) => {
    const data = new Date(ano, mes, dia);
    const chave = formatarData(data);
    try {
      console.log(`\ud83d\udccb Salvando: ${chave} = ${sigla}`);
      await atualizarEscala(bomberoId, chave, sigla);
      
      // Aguardar um pouco para garantir que os dados foram salvos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`\u2713 Salvo com sucesso: ${chave} = ${sigla}`);
      setDiaEdicao(null);
    } catch (error) {
      console.error('\u274c Erro ao atualizar escala:', error);
      alert('Erro ao salvar a escala. Tente novamente.');
    }
  };

  const handleAplicarPeríodo = async () => {
    if (!dataInicial || !dataFinal) {
      alert('Preencha as datas inicial e final');
      return;
    }

    const inicio = new Date(dataInicial);
    const fim = new Date(dataFinal);

    if (inicio > fim) {
      alert('A data inicial deve ser menor que a data final');
      return;
    }

    setAplicandoPeriodo(true);
    try {
      const dataAtual = new Date(inicio);
      while (dataAtual <= fim) {
        const chave = formatarData(dataAtual);
        await atualizarEscala(bomberoId, chave, siglaPeríodo);
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
      alert(`Período aplicado com sucesso! ${siglaPeríodo} de ${dataInicial} a ${dataFinal}`);
      setDataInicial('');
      setDataFinal('');
    } catch (error) {
      console.error('Erro ao aplicar período:', error);
      alert('Erro ao aplicar período. Tente novamente.');
    } finally {
      setAplicandoPeriodo(false);
    }
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{bomberoNome}</span>
          <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {meses[mes]} {ano}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de Período */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Aplicar Sigla em Período</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label htmlFor="data-inicial" className="text-xs font-medium text-gray-700">Data Inicial</label>
              <input
                id="data-inicial"
                name="data-inicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="data-final" className="text-xs font-medium text-gray-700">Data Final</label>
              <input
                id="data-final"
                name="data-final"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="sigla-periodo" className="text-xs font-medium text-gray-700">Sigla</label>
              <select
                id="sigla-periodo"
                name="sigla-periodo"
                value={siglaPeríodo}
                onChange={(e) => setSiglaPeríodo(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {SIGLAS_DISPONIVEIS.map(({ sigla, label }) => (
                  <option key={sigla} value={sigla}>
                    {sigla || 'Limpar'} - {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAplicarPeríodo}
                disabled={aplicandoPeriodo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {aplicandoPeriodo ? 'Aplicando...' : 'Aplicar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Navegação de mês */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMesAnterior}
            disabled={mes === 0}
            className="h-8"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="font-semibold text-sm">{meses[mes]} {ano}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProximoMes}
            disabled={mes === 11}
            className="h-8"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Calendário */}
        <div className={`grid ${t.gridCols} ${t.gap}`}>
          {/* Cabeçalho com dias da semana */}
          {diasSemana.map(dia => (
            <div key={dia} className={`text-center font-semibold ${t.textDia} text-gray-600 ${t.headerHeight} flex items-center justify-center`}>
              {dia}
            </div>
          ))}

          {/* Dias do mês */}
          {diasCalendario.map((dia, idx) => {
            if (dia === null) {
              return <div key={`empty-${idx}`} className={t.cellHeight} />;
            }

            const data = new Date(ano, mes, dia);
            const chave = formatarData(data);
            const valor = bombeiro.escala[chave] || '';
            const corOficial = getCorOficial(data);
            const isEdicao = diaEdicao === chave;
            
            // Verificar se há período de FO nesta data (apenas quando FO é gozada)
            const periodoFO = getPeriodoFONaData(calculo.periodosConquista, chave);
            const textoFO = periodoFO 
              ? `${formatarDataExibicao(periodoFO.dataInicio)} a ${formatarDataExibicao(periodoFO.dataFim)}`
              : '';

            return (
              <div key={dia} className={t.cellHeight}>
                {isEdicao ? (
                  // Modo edição: mostrar opções de sigla em grid maior
                  <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setDiaEdicao(null);
                      }
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm">Selecione a sigla para {formatarDataExibicao(chave)}:</h3>
                        <button
                          onClick={() => setDiaEdicao(null)}
                          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SIGLAS_DISPONIVEIS.map(({ sigla, label, cor }) => (
                          <Button
                            key={sigla}
                            variant="outline"
                            className={`text-sm h-10 p-2 justify-start ${cor} hover:opacity-80 transition`}
                            onClick={() => {
                              handleAtualizarDia(dia, sigla);
                            }}
                          >
                            <span className="font-bold mr-2">{sigla || '-'}</span>
                            <span>{label}</span>
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full mt-3 text-xs"
                        onClick={() => setDiaEdicao(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo visualização: card maior com moldura interna para o número
                  <button
                    onClick={() => setDiaEdicao(chave)}
                    className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition rounded border-2 p-1 ${
                      valor
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    title={textoFO}
                  >
                    {/* Moldura interna ao redor do número com cor fixa da prontidao */}
                    <span className={`${t.textDia} leading-none font-bold px-2 py-1 rounded ${
                      getEstiloProntidaoFixa(data).borda + ' ' + getEstiloProntidaoFixa(data).bgColor
                    }`}>{dia}</span>
                    
                    {/* Sigla abaixo */}
                    {valor ? (
                      <div className="flex flex-col items-center gap-0.5 leading-none mt-1">
                        <span className={`font-bold ${t.textSigla} ${getCorSigla(valor)}`}>{valor}</span>
                        {textoFO && (
                          <span className="text-[10px] font-bold text-purple-700 block leading-tight mt-1">
                            {textoFO}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={`${t.textDia} leading-none text-gray-500 font-normal mt-1`}>{corOficial}</span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda compacta */}
        <div className={`grid grid-cols-5 ${t.gap} ${t.textDia} pt-1 border-t`}>
          {SIGLAS_DISPONIVEIS.slice(0, -1).map(({ sigla, label, cor }) => (
            <div key={sigla || 'empty'} className={`px-0.5 py-0.5 rounded text-center text-xs ${cor}`}>
              <span className="font-semibold">{sigla || '-'}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
