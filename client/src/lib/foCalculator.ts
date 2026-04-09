/**
 * Lógica de Cálculo de Folgas Obrigatórias (FO)
 * Regras:
 * - A cada 9 serviços ininterruptos, o bombeiro ganha 1 FO
 * - Afastamentos (F, LP, DS, LT, D, LTS, C, CFS, CAS, EAP, TAF) zeram o ciclo atual de serviços
 * - FOs conquistadas nunca são perdidas, apenas o progresso do novo ciclo é zerado
 * - Escala 24x48: 01/Jan=VD, 02/Jan=AM, 03/Jan=AZ, repetindo ciclicamente
 * - FO marcada na planilha apenas pausa a contagem (não zera, não conta serviço)
 */

export interface Bombeiro {
  id: string;
  nome: string;
  equipe: string; // VD, AM, AZ
  dataInicio: Date;
  escala: Record<string, string>; // YYYY-MM-DD -> sigla (VD, AM, AZ, FO, DS, etc.)
}

export interface CalculoFO {
  foConquistadas: number;
  foUsadas: number;
  foDisponiveis: number;
  saldoCicloAtual: number;
  periodosConquista: PeriodoConquista[]; // Períodos de cada FO conquistada
}

export interface PeriodoConquista {
  numero: number; // Qual FO (1ª, 2ª, 3ª...)
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  dataUso?: string; // YYYY-MM-DD (quando foi usada, se foi)
}

const INTERRUPT_CODES = new Set(['F', 'LP', 'DS', 'LT', 'D', 'LTS', 'C', 'CFS', 'CAS', 'EAP', 'TAF']);
const PAUSE_CODES = new Set(['PA', 'FO']); // PA = Pausa Autorizada, FO = Folga Obrigatoria
const COLORS_CYCLE = ['VD', 'AM', 'AZ'];

/**
 * Calcula o saldo de FOs para um bombeiro até uma data específica
 */
export function calcularFO(bombeiro: Bombeiro, ateDia: Date): CalculoFO {
  let foConquistadas = 0;
  let foUsadas = 0;
  let cicloAtualServicos = 0;
  const periodosConquista: PeriodoConquista[] = [];
  let dataInicioConquista: string | null = null;

  // Pegar a data de hoje para separar "Usada" de "Agendada"
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // FIX CRÍTICO: Ignorar escalas fantasmas e usar APENAS a data de início oficial
  const dataInicioOficial = new Date(bombeiro.dataInicio);
  dataInicioOficial.setHours(0, 0, 0, 0);

  // O loop começa em 01/Jan apenas para manter a sincronia das cores (VD, AM, AZ)
  let dataAtual = new Date(2026, 0, 1);

  while (dataAtual <= ateDia) {
    const chave = dataAtual.toISOString().split('T')[0];
    const dataComparacao = new Date(dataAtual);
    dataComparacao.setHours(0, 0, 0, 0);

    // Lógica da cor oficial (não muda)
    const diasDesdeJan1 = Math.floor(
      (dataAtual.getTime() - new Date(2026, 0, 1).getTime()) / (1000 * 60 * 60 * 24)
    );
    const corOficial = COLORS_CYCLE[diasDesdeJan1 % 3];

    // SÓ CONTA SE A DATA ATUAL FOR IGUAL OU MAIOR QUE A DATA DE INÍCIO DO BOMBEIRO
    if (dataComparacao >= dataInicioOficial) {
      const valor = (bombeiro.escala[chave] || '').toUpperCase().trim();

      // 1. SERVIÇO REALIZADO
      if (valor === corOficial) {
        if (cicloAtualServicos === 0) dataInicioConquista = chave;
        cicloAtualServicos += 1;
        
        if (cicloAtualServicos >= 9) {
          foConquistadas += 1;
          periodosConquista.push({
            numero: foConquistadas,
            dataInicio: dataInicioConquista!,
            dataFim: chave,
          });
          cicloAtualServicos = 0;
          dataInicioConquista = null;
        }
      }
      
      // 2. AFASTAMENTO (Zera o ciclo)
      else if (INTERRUPT_CODES.has(valor)) {
        cicloAtualServicos = 0;
        dataInicioConquista = null;
      }
      
      // 3. FOLGA OBRIGATÓRIA (Uso)
      else if (valor === 'FO') {
        // SÓ CONTA COMO "USADA" SE A DATA JÁ PASSOU OU É HOJE
        if (dataComparacao <= hoje) {
          foUsadas += 1;
        }
        
        // Associa à conquista para aparecer a legenda roxa no calendário
        const conquistaLivre = periodosConquista.find(p => !p.dataUso);
        if (conquistaLivre) conquistaLivre.dataUso = chave;
      }
      
      // 4. PAUSA (PA) ou Vazio
      // Se for PA, o código não entra no 'valor === corOficial' nem no 'INTERRUPT',
      // portanto o cicloAtualServicos NÃO aumenta e NÃO zera. (Isso é a PAUSA).
    }

    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return {
    foConquistadas,
    foUsadas,
    foDisponiveis: foConquistadas - foUsadas,
    saldoCicloAtual: cicloAtualServicos,
    periodosConquista,
  };
}

/**
 * Calcula o saldo de FOs para todos os bombeiros
 */
export function calcularTodosBombeiros(
  bombeiros: Bombeiro[],
  ateDia: Date = new Date()
): Record<string, CalculoFO> {
  const resultados: Record<string, CalculoFO> = {};

  for (const bombeiro of bombeiros) {
    resultados[bombeiro.id] = calcularFO(bombeiro, ateDia);
  }

  return resultados;
}

/**
 * Obtém a cor oficial do dia baseado na escala 24x48
 */
export function getCorOficial(data: Date): string {
  const diasDesdeJan1 = Math.floor(
    (data.getTime() - new Date(2026, 0, 1).getTime()) / (1000 * 60 * 60 * 24)
  );
  return COLORS_CYCLE[diasDesdeJan1 % 3];
}

/**
 * Formata a data para o padrão YYYY-MM-DD
 */
export function formatarData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Converte string YYYY-MM-DD para Date
 */
export function parseData(dataStr: string): Date {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/**
 * Formata data para exibição (DD/MMM)
 */
export function formatarDataExibicao(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return `${String(dia).padStart(2, '0')}${meses[mes - 1]}`;
}

/**
 * Obtém o período de conquista de uma FO em uma data específica
 * Retorna o período APENAS se a data é a data de uso (quando FO foi gozada)
 * Normaliza as datas para evitar problemas com espaços em branco ou diferenças de fuso
 */
export function getPeriodoFONaData(
  periodosConquista: PeriodoConquista[],
  dataStr: string
): PeriodoConquista | null {
  if (!periodosConquista || !dataStr) return null;
  
  const chaveNormalizada = dataStr.trim().substring(0, 10);
  
  console.log(`[DEBUG getPeriodoFONaData] Buscando FO para data: ${chaveNormalizada}`);
  console.log(`[DEBUG getPeriodoFONaData] Total de periodos: ${periodosConquista.length}`);
  
  for (const periodo of periodosConquista) {
    console.log(`[DEBUG] Periodo #${periodo.numero}: ${periodo.dataInicio} a ${periodo.dataFim}, dataUso: ${periodo.dataUso || 'vazio'}`);
    
    if (periodo.dataUso) {
      const dataUsoNormalizada = periodo.dataUso.trim().substring(0, 10);
      
      if (dataUsoNormalizada === chaveNormalizada) {
        console.log(`[DEBUG] Sucesso: Periodo #${periodo.numero} encontrado`);
        return periodo;
      }
    }
  }
  console.log(`[DEBUG] Nenhuma FO encontrada para ${chaveNormalizada}`);
  return null;
}

/**
 * Obtém a primeira data de serviço marcada no calendário de um bombeiro
 */
export function getPrimeiraDataServico(bombeiro: Bombeiro): Date | null {
  const datas = Object.entries(bombeiro.escala)
    .filter(([_, valor]) => {
      const v = valor.toUpperCase().trim();
      return v === 'VD' || v === 'AM' || v === 'AZ';
    })
    .map(([data]) => new Date(data))
    .sort((a, b) => a.getTime() - b.getTime());
  
  return datas.length > 0 ? datas[0] : null;
}
