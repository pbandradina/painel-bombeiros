export const INTERRUPT_CODES = ['F', 'LP', 'DS', 'LT', 'D', 'LTS', 'C', 'CFS', 'CAS', 'EAP', 'TAF'];
export const COLORS_CYCLE = ['VD', 'AM', 'AZ'];

export function calcularFO(dataInicioBombeiro: string | Date, escalasArray: any[]) {
  let foConquistadas = 0;
  let foUsadas = 0;
  let cicloAtualServicos = 0;
  const hoje = new Date();
  const dataRef = new Date('2026-01-01T00:00:00');
  const dataInicio = new Date(dataInicioBombeiro);

  // Transformar array de escalas em um objeto fácil de ler: { "2026-04-08": "VD" }
  const escalaMap = (escalasArray || []).reduce((acc: any, curr: any) => {
    acc[curr.data] = curr.sigla;
    return acc;
  }, {});

  // Ordenar as datas para processar
  const todasAsDatas = Object.keys(escalaMap).sort();

  todasAsDatas.forEach(dataStr => {
    const dataAtual = new Date(dataStr + 'T00:00:00');
    if (dataAtual < dataInicio) return;

    const sigla = escalaMap[dataStr].toUpperCase();
    const diffDias = Math.floor((dataAtual.getTime() - dataRef.getTime()) / (86400000));
    const corOficial = COLORS_CYCLE[((diffDias % 3) + 3) % 3];

    if (sigla === corOficial) {
      cicloAtualServicos++;
      if (cicloAtualServicos === 9) {
        foConquistadas++;
        cicloAtualServicos = 0;
      }
    } else if (INTERRUPT_CODES.includes(sigla)) {
      cicloAtualServicos = 0;
    }

    if (sigla === 'FO' && dataAtual <= hoje) {
      foUsadas++;
    }
  });

  return {
    conquistadas: foConquistadas,
    usadas: foUsadas,
    disponiveis: Math.max(0, foConquistadas - foUsadas),
    progresso: cicloAtualServicos
  };
}