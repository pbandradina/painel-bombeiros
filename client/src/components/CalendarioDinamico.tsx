import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, X, Check } from 'lucide-react';
import { getCorOficial, formatarData, getPeriodoFONaData, formatarDataExibicao, calcularFO } from '@/lib/foCalculator';
import { useEscala } from '@/contexts/EscalaContext';
import { useLayout } from '@/contexts/LayoutContext';
import { toast } from 'sonner';

const SIGLAS_DISPONIVEIS = [
  { sigla: 'VD', label: 'Prontidão Verde', cor: 'bg-green-600 text-white' },
  { sigla: 'AM', label: 'Prontidão Amarela', cor: 'bg-yellow-500 text-black' },
  { sigla: 'AZ', label: 'Prontidão Azul', cor: 'bg-blue-600 text-white' },
  { sigla: 'EX', label: 'Expediente', cor: 'bg-cyan-600 text-white' },
  { sigla: 'ME', label: 'Meio Expediente', cor: 'bg-sky-600 text-white' },
  { sigla: 'AG', label: 'Aglutinada', cor: 'bg-teal-600 text-white' },
  { sigla: 'F', label: 'Férias', cor: 'bg-orange-600 text-white' },
  { sigla: 'LP', label: 'Licença Prêmio', cor: 'bg-pink-600 text-white' },
  { sigla: 'LT', label: 'Luto', cor: 'bg-gray-700 text-white' },
  { sigla: 'DS', label: 'Dispensa do Serviço', cor: 'bg-red-600 text-white' },
  { sigla: 'FO', label: 'Folga Obrigatória', cor: 'bg-purple-600 text-white' },
  { sigla: 'PA', label: 'Pausa Autorizada', cor: 'bg-slate-700 text-white' },
  { sigla: 'D', label: 'Doação de Sangue', cor: 'bg-rose-600 text-white' },
  { sigla: 'C', label: 'Convalescença', cor: 'bg-amber-600 text-white' },
  { sigla: 'LTS', label: 'Licença Tratamento Saúde', cor: 'bg-indigo-600 text-white' },
  { sigla: 'CFS', label: 'Curso Form. Sargentos', cor: 'bg-violet-600 text-white' },
  { sigla: 'CAS', label: 'Curso Aperfeiçoamento', cor: 'bg-fuchsia-600 text-white' },
  { sigla: 'EAP', label: 'Estágio Atualização', cor: 'bg-lime-600 text-white' },
  { sigla: 'TAF', label: 'Teste Aptidão Física', cor: 'bg-emerald-600 text-white' },
  { sigla: '', label: 'Limpar', cor: 'bg-slate-800 text-slate-400' },
];

export function CalendarioDinamico() {
  const { bombeiros, atualizarEscala, calculos, carregando } = useEscala();
  const { tamanhoCalendario } = useLayout();
  const [bombeiroSelecionadoId, setBombeiroSelecionadoId] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date(2026, 0, 1));
  const [diaEdicao, setDiaEdicao] = useState<string | null>(null);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [siglaPeriodo, setSiglaPeriodo] = useState('VD');
  const [aplicandoPeriodo, setAplicandoPeriodo] = useState(false);

  const bombeiro = useMemo(() => 
    bombeiros.find(b => b.id === (bombeiroSelecionadoId || bombeiros[0]?.id)),
    [bombeiros, bombeiroSelecionadoId]
  );

  const calculo = useMemo(() => 
    bombeiro ? calculos[bombeiro.id] : null,
    [bombeiro, calculos]
  );

  if (carregando) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>;
  if (bombeiros.length === 0) return <div className="text-center py-20 text-slate-500 uppercase font-black">Nenhum bombeiro cadastrado</div>;

  const ano = mesSelecionado.getFullYear();
  const mes = mesSelecionado.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diasDoMes = ultimoDia.getDate();
  const diaSemanaPrimeiro = primeiroDia.getDay();

  const diasCalendario: (number | null)[] = [];
  for (let i = 0; i < diaSemanaPrimeiro; i++) diasCalendario.push(null);
  for (let dia = 1; dia <= diasDoMes; dia++) diasCalendario.push(dia);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const handleAplicarPeriodo = async () => {
    if (!bombeiro || !dataInicial || !dataFinal) {
      toast.error('Preencha todos os campos');
      return;
    }
    setAplicandoPeriodo(true);
    try {
      const inicio = new Date(dataInicial + 'T00:00:00');
      const fim = new Date(dataFinal + 'T00:00:00');
      const dataAtual = new Date(inicio);
      while (dataAtual <= fim) {
        await atualizarEscala(bombeiro.id, formatarData(dataAtual), siglaPeriodo);
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
      toast.success('Período aplicado com sucesso!');
    } catch (error) {
      toast.error('Erro ao aplicar período');
    } finally {
      setAplicandoPeriodo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-900/20">
            <CalendarIcon className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic">Calendário de Escalas</h2>
            <select 
              value={bombeiro?.id} 
              onChange={(e) => setBombeiroSelecionadoId(e.target.value)}
              className="bg-transparent text-blue-400 font-bold uppercase text-xs outline-none cursor-pointer hover:text-blue-300 transition-colors"
            >
              {bombeiros.map(b => <option key={b.id} value={b.id} className="bg-[#1E293B] text-white">{b.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#0F172A] p-2 rounded-xl border border-slate-700">
          <button onClick={() => setMesSelecionado(new Date(ano, mes - 1, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-xs font-black text-white uppercase min-w-[120px] text-center">{meses[mes]} {ano}</span>
          <button onClick={() => setMesSelecionado(new Date(ano, mes + 1, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-7 bg-slate-900/80 border-b border-slate-800">
              {diasSemana.map(d => <div key={d} className="py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {diasCalendario.map((dia, i) => {
                if (dia === null) return <div key={`empty-${i}`} className="aspect-square border-r border-b border-slate-800/50 bg-slate-900/20" />;
                const data = new Date(ano, mes, dia);
                const chave = formatarData(data);
                const sigla = bombeiro?.escalas[chave] || '';
                const corOficial = getCorOficial(data);
                const isPeriodoFO = calculo ? getPeriodoFONaData(chave, calculo) : false;
                const siglaConfig = SIGLAS_DISPONIVEIS.find(s => s.sigla === sigla);

                return (
                  <div 
                    key={dia} 
                    onClick={() => setDiaEdicao(chave)}
                    className={`aspect-square border-r border-b border-slate-800 relative group cursor-pointer transition-all hover:bg-slate-800/50 ${isPeriodoFO ? 'bg-purple-900/10' : ''}`}
                  >
                    <span className={`absolute top-2 left-2 text-[10px] font-black ${sigla === corOficial ? 'text-blue-400' : 'text-slate-600'}`}>{dia}</span>
                    {sigla && (
                      <div className={`absolute inset-2 flex items-center justify-center rounded-lg text-[10px] font-black shadow-lg ${siglaConfig?.cor || 'bg-slate-700 text-white'}`}>
                        {sigla}
                      </div>
                    )}
                    {diaEdicao === chave && (
                      <div className="absolute inset-0 z-50 bg-[#1E293B] border-2 border-blue-500 rounded-xl shadow-2xl p-2 overflow-y-auto grid grid-cols-4 gap-1">
                        {SIGLAS_DISPONIVEIS.map(s => (
                          <button
                            key={s.sigla}
                            onClick={(e) => { e.stopPropagation(); atualizarEscala(bombeiro!.id, chave, s.sigla); setDiaEdicao(null); }}
                            className={`h-8 flex items-center justify-center rounded text-[8px] font-black transition-all hover:scale-110 ${s.cor}`}
                            title={s.label}
                          >
                            {s.sigla || <X size={10} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Check size={14} className="text-green-500" /> Aplicar Período
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Início</label>
                <input type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-lg p-2 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Fim</label>
                <input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-lg p-2 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Sigla</label>
                <select value={siglaPeriodo} onChange={e => setSiglaPeriodo(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-lg p-2 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600">
                  {SIGLAS_DISPONIVEIS.filter(s => s.sigla).map(s => <option key={s.sigla} value={s.sigla}>{s.sigla} - {s.label}</option>)}
                </select>
              </div>
              <Button onClick={handleAplicarPeriodo} disabled={aplicandoPeriodo} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all">
                {aplicandoPeriodo ? <Loader2 className="animate-spin" /> : 'Aplicar em Lote'}
              </Button>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Legenda</h3>
            <div className="grid grid-cols-2 gap-2">
              {SIGLAS_DISPONIVEIS.filter(s => s.sigla).slice(0, 10).map(s => (
                <div key={s.sigla} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-black ${s.cor}`}>{s.sigla}</div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}