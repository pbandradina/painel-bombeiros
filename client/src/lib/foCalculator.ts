export interface CalculoFO {
  conquistadas: number;
  usadas: number;
  disponiveis: number;
  progresso: number;
}

export function calcularFO(dataInicioBombeiro: any, escalasArray: any[]): CalculoFO {
  let foConquistadas = 0;
  let foUsadas = 0;
  let cicloAtualServicos = 0;
  const hoje = new Date();
  const dataRef = new Date('2026-01-01T00:00:00');
  const dataInicio = new Date(dataInicioBombeiro);

  const escalaMap = (escalasArray || []).reduce((acc: any, curr: any) => {
    acc[curr.data] = curr.sigla;
    return acc;
  }, {});

  const todasAsDatas = Object.keys(escalaMap).sort();

  todasAsDatas.forEach(dataStr => {
    const dataAtual = new Date(dataStr + 'T00:00:00');
    if (dataAtual < dataInicio) return;

    const sigla = escalaMap[dataStr].toUpperCase();
    const diffDias = Math.floor((dataAtual.getTime() - dataRef.getTime()) / 86400000);
    const cores = ['VD', 'AM', 'AZ'];
    const corOficial = cores[((diffDias % 3) + 3) % 3];

    if (sigla === corOficial) {
      cicloAtualServicos++;
      if (cicloAtualServicos === 9) {
        foConquistadas++;
        cicloAtualServicos = 0;
      }
    } else if (['F', 'LP', 'DS', 'LT', 'D', 'LTS', 'C', 'CFS', 'CAS', 'EAP', 'TAF'].includes(sigla)) {
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