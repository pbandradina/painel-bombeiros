import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEscala } from '@/contexts/EscalaContext';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface RelatorioData {
  nome: string;
  foConquistadas: number;
  foUsadas: number;
  foDisponiveis: number;
  periodos: Array<{
    numero: number;
    dataInicio: string;
    dataFim: string;
    dataUso?: string;
  }>;
}

export function RelatorioPeriodo() {
  const { bombeiros, calculos } = useEscala();
  const [isOpen, setIsOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-12-31');
  const [relatorios, setRelatorios] = useState<RelatorioData[]>([]);

  const handleGerarRelatorio = () => {
    try {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (inicio > fim) {
        toast.error('Data inicial não pode ser maior que data final');
        return;
      }

      const dados = bombeiros.map(bombeiro => {
        const calculo = calculos[bombeiro.id] || {
          foConquistadas: 0,
          foUsadas: 0,
          foDisponiveis: 0,
          periodosConquista: [],
        };

        // Filtrar períodos dentro do intervalo
        const periodosFiltrados = calculo.periodosConquista.filter(p => {
          const dataInicioP = new Date(p.dataInicio);
          const dataFimP = new Date(p.dataFim);
          return dataInicioP <= fim && dataFimP >= inicio;
        });

        return {
          nome: bombeiro.nome,
          foConquistadas: calculo.foConquistadas,
          foUsadas: calculo.foUsadas,
          foDisponiveis: calculo.foDisponiveis,
          periodos: periodosFiltrados,
        };
      });

      setRelatorios(dados);
      toast.success('✅ Relatório gerado com sucesso');
    } catch (erro) {
      console.error('Erro ao gerar relatório:', erro);
      toast.error('❌ Erro ao gerar relatório');
    }
  };

  const handleExportarRelatorio = () => {
    try {
      const conteudo = relatorios
        .map(r => {
          let texto = `\n${r.nome}\n`;
          texto += `FOs Conquistadas: ${r.foConquistadas}\n`;
          texto += `FOs Usadas: ${r.foUsadas}\n`;
          texto += `Saldo: ${r.foDisponiveis}\n`;
          texto += `\nPeríodos:\n`;
          
          r.periodos.forEach(p => {
            texto += `  FO #${p.numero}: ${p.dataInicio} a ${p.dataFim}`;
            if (p.dataUso) {
              texto += ` (Usada em ${p.dataUso})`;
            }
            texto += '\n';
          });

          return texto;
        })
        .join('\n---\n');

      const blob = new Blob([conteudo], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_fo_${dataInicio}_a_${dataFim}.txt`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('✅ Relatório exportado com sucesso');
    } catch (erro) {
      console.error('Erro ao exportar:', erro);
      toast.error('❌ Erro ao exportar relatório');
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Calendar className="w-4 h-4" />
        Relatório Período
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Relatório de FOs por Período
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Filtros */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-sm font-medium">
                  Data Inicial
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-sm font-medium">
                  Data Final
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleGerarRelatorio}
              className="w-full"
              size="sm"
            >
              Gerar Relatório
            </Button>

            {/* Resultados */}
            {relatorios.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-sm">Resultados:</h3>
                {relatorios.map((r, idx) => (
                  <Card key={idx} className="text-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{r.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-green-50 p-2 rounded">
                          <span className="font-medium">Conquistadas:</span> {r.foConquistadas}
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <span className="font-medium">Usadas:</span> {r.foUsadas}
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="font-medium">Saldo:</span> {r.foDisponiveis}
                        </div>
                      </div>

                      {r.periodos.length > 0 && (
                        <div className="text-xs space-y-1 pt-2 border-t">
                          <span className="font-medium">Períodos:</span>
                          {r.periodos.map((p, pIdx) => (
                            <div key={pIdx} className="text-gray-600 ml-2">
                              FO #{p.numero}: {p.dataInicio} a {p.dataFim}
                              {p.dataUso && <span className="text-green-600"> ✓ Usada em {p.dataUso}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {relatorios.length > 0 && (
              <Button
                onClick={handleExportarRelatorio}
                variant="outline"
                size="sm"
              >
                Exportar Relatório
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
