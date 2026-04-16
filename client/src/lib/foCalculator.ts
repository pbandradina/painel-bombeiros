// client/src/lib/foCalculator.ts
export interface PeriodoConquista {
  numero: number;
  dataInicio: string;
  dataFim: string;
  dataUso?: string;
}

export interface CalculoFO {
  foConquistadas: number;
  foUsadas: number;
  foDisponiveis: number;
  saldoCicloAtual: number;
  // Aliases para compatibilidade com componentes antigos:
  conquistadas?: number;
  disponiveis?: number;
  progresso?: number;
  periodosConquista: PeriodoConquista[];
}

export const INTERRUPT_CODES = new Set(['F', 'LP', 'DS', 'LT', 'D', 'LTS', 'C', 'CFS', 'CAS', 'EAP', 'TAF']);
export const COLORS_CYCLE = ['VD', 'AM', 'AZ'];

export function calcularFO(bombeiro: any, ateDia: Date = new Date()): CalculoFO {
  let foConquistadas = 0;
  let foUsadas = 0;
  let cicloAtualServicos = 0;
  const periodosConquista: PeriodoConquista[] = [];
  let dataInicioConquista: string | null = null;

  const dataReferencia = new Date(2026, 0, 1);
  const dataInicioBombeiro = new Date(bombeiro.data_inicio || bombeiro.dataInicio);
  
  const escalasRaw = bombeiro.escalas || bombeiro.escala || [];
  const escala = Array.isArray(escalasRaw) 
    ? escalasRaw.reduce((acc: any, curr: any) => ({ ...acc, [curr.data]: curr.sigla }), {})
    : escalasRaw;

  let dataAtual = new Date(2026, 0, 1);
  while (dataAtual <= ateDia) {
    const chave = dataAtual.toISOString().split('T')[0];
    if (dataAtual >= dataInicioBombeiro) {
      const corOficial = getCorOficial(dataAtual);
      const valor = (escala[chave] || '').toUpperCase().trim();

      if (valor === corOficial) {
        if (cicloAtualServicos === 0) dataInicioConquista = chave;
        cicloAtualServicos++;
        if (cicloAtualServicos >= 9) {
          foConquistadas++;
          periodosConquista.push({ numero: foConquistadas, dataInicio: dataInicioConquista!, dataFim: chave });
          cicloAtualServicos = 0;
          dataInicioConquista = null;
        }
      } else if (INTERRUPT_CODES.has(valor)) {
        cicloAtualServicos = 0;
        dataInicioConquista = null;
      } else if (valor === 'FO') {
        foUsadas++;
        const conquistaLivre = periodosConquista.find(p => !p.dataUso);
        if (conquistaLivre) conquistaLivre.dataUso = chave;
      }
    }
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return {
    foConquistadas,
    foUsadas,
    foDisponiveis: Math.max(0, foConquistadas - foUsadas),
    saldoCicloAtual: cicloAtualServicos,
    // Atribuindo os nomes antigos para os componentes não quebrarem:
    conquistadas: foConquistadas,
    disponiveis: Math.max(0, foConquistadas - foUsadas),
    progresso: cicloAtualServicos,
    periodosConquista,
  };
}

export function getCorOficial(data: Date): string {
  const dataRef = new Date(2026, 0, 1);
  const diff = Math.floor((data.getTime() - dataRef.getTime()) / 86400000);
  return COLORS_CYCLE[((diff % 3) + 3) % 3];
}

export function formatarData(data: Date): string {
  return data.toISOString().split('T')[0];
}

export function formatarDataExibicao(dataStr: string): string {
  if (!dataStr) return "";
  const [ano, mes, dia] = dataStr.split('-');
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return `${dia}${meses[parseInt(mes) - 1]}`;
}

export function getPeriodoFONaData(periodos: PeriodoConquista[], dataStr: string): PeriodoConquista | null {
  if (!periodos || !dataStr) return null;
  return periodos.find(p => p.dataUso === dataStr) || null;
}