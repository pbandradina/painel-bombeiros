import { Button } from '@/components/ui/button';
import { useEscala } from '@/contexts/EscalaContext';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function ExportadorExcel() {
  const { bombeiros, calculos } = useEscala();

  const handleExportarExcel = async () => {
    try {
      const XLSX = (window as any).XLSX;
      if (!XLSX) {
        toast.error('Biblioteca XLSX não carregada');
        return;
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Aba 1: Resumo de Saldos
      const resumoData = bombeiros.map(bombeiro => {
        const calculo = calculos[bombeiro.id] || {
          foConquistadas: 0,
          foUsadas: 0,
          foDisponiveis: 0,
          saldoCicloAtual: 0,
        };

        return {
          'Nome': bombeiro.nome,
          'Equipe': bombeiro.equipe,
          'FOs Conquistadas': calculo.foConquistadas,
          'FOs Usadas': calculo.foUsadas,
          'Saldo FOs': calculo.foDisponiveis,
          'Serviços p/ Próxima FO': calculo.saldoCicloAtual,
        };
      });

      const wsResumo = XLSX.utils.json_to_sheet(resumoData);
      wsResumo['!cols'] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      // Aba 2: Escalas Completas
      const escalasData: any[] = [];
      bombeiros.forEach(bombeiro => {
        const row: any = { 'Bombeiro': bombeiro.nome };
        
        // Adicionar todos os dias do ano
        for (let mes = 0; mes < 12; mes++) {
          const ultimoDia = new Date(2026, mes + 1, 0).getDate();
          for (let dia = 1; dia <= ultimoDia; dia++) {
            const data = new Date(2026, mes, dia);
            const chave = `${String(data.getFullYear())}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const coluna = `${dia}/${meses[mes]}`;
            row[coluna] = bombeiro.escala[chave] || '';
          }
        }
        escalasData.push(row);
      });

      const wsEscalas = XLSX.utils.json_to_sheet(escalasData);
      XLSX.utils.book_append_sheet(wb, wsEscalas, 'Escalas');

      // Salvar arquivo
      const nomeArquivo = `Controle_Efetivo_Bombeiros_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      toast.success(`✅ Arquivo exportado: ${nomeArquivo}`);
    } catch (erro) {
      console.error('Erro ao exportar:', erro);
      toast.error('❌ Erro ao exportar arquivo');
    }
  };

  return (
    <Button
      onClick={handleExportarExcel}
      className="gap-2"
      variant="default"
      size="sm"
    >
      <Download className="w-4 h-4" />
      Exportar Excel
    </Button>
  );
}
