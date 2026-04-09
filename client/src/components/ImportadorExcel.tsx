import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle } from 'lucide-react';
import { useEscala } from '@/contexts/EscalaContext';
import { Bombeiro, formatarData } from '@/lib/foCalculator';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function ImportadorExcel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setBombeiros } = useEscala();
  const [carregando, setCarregando] = useState(false);
  const createBombeiro = trpc.bombeiros.create.useMutation();
  const utils = trpc.useUtils();
  const { data: bombeirosList } = trpc.bombeiros.list.useQuery();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('📁 Arquivo selecionado:', file.name, 'Tamanho:', file.size, 'bytes');
    setCarregando(true);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        console.log('📖 Lendo arquivo...');
        const data = e.target?.result;
        console.log('✓ Dados lidos, tamanho:', data instanceof ArrayBuffer ? data.byteLength : 'desconhecido');

        // Ler o workbook
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('✓ Workbook lido. Abas disponíveis:', workbook.SheetNames);

        // Procurar pela aba "Afastamentos"
        const sheetName = workbook.SheetNames.find((name) =>
          name.toLowerCase().includes('afastamento')
        );

        if (!sheetName) {
          console.error('❌ Aba "Afastamentos" não encontrada');
          toast.error('❌ Aba "Afastamentos" não encontrada');
          setCarregando(false);
          return;
        }

        console.log('✓ Aba encontrada:', sheetName);

        const worksheet = workbook.Sheets[sheetName];
        console.log('✓ Worksheet carregado');

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as any[][];

        console.log('✓ Dados convertidos para JSON');
        console.log('Total de linhas:', jsonData.length);
        console.log('Primeiras 3 linhas:', jsonData.slice(0, 3));

        // Processar dados
        const bombeirosCriados: Bombeiro[] = [];

        console.log('\n🔍 Procurando por bombeiros a partir da linha 10...');

        // Linhas começam do índice 0, então linha 10 é índice 9
        for (let i = 9; i < jsonData.length; i++) {
          const linha = jsonData[i] || [];
          const nome = String(linha[12] || '').trim();
          const dataInicioVal = linha[382];

          if (!nome || nome === 'nan' || nome === 'TOTAL DIA') {
            continue;
          }

          if (!dataInicioVal) {
            console.log(`⚠️ Linha ${i + 1}: ${nome} - sem data de início`);
            continue;
          }

          // Parsear data
          let dataInicio: Date;
          if (typeof dataInicioVal === 'number') {
            dataInicio = new Date((dataInicioVal - 25569) * 86400 * 1000);
          } else if (typeof dataInicioVal === 'string') {
            dataInicio = new Date(dataInicioVal);
          } else {
            console.log(`⚠️ Linha ${i + 1}: ${nome} - data inválida`);
            continue;
          }

          // Construir escala
          const escala: Record<string, string> = {};

          for (let col = 13; col < 378; col++) {
            const valor = String(linha[col] || '').trim().toUpperCase();

            if (valor && valor !== 'NAN' && valor.length > 0) {
              const diaDoAno = col - 13;
              const data = new Date(2026, 0, 1);
              data.setDate(data.getDate() + diaDoAno);
              escala[formatarData(data)] = valor;
            }
          }

          // Determinar equipe
          let equipe = 'VD';
          for (const [, sigla] of Object.entries(escala)) {
            if (['VD', 'AM', 'AZ'].includes(sigla)) {
              equipe = sigla;
              break;
            }
          }

          const bombeiro: Bombeiro = {
            id: `bombeiro-${bombeirosCriados.length}`,
            nome,
            equipe,
            dataInicio,
            escala,
          };

          bombeirosCriados.push(bombeiro);
          console.log(`✅ Bombeiro ${bombeirosCriados.length}: ${nome} (${equipe}) - ${bombeirosCriados.length} serviços registrados`);
        }

        console.log(`\n✨ Total de bombeiros carregados: ${bombeirosCriados.length}`);

        if (bombeirosCriados.length === 0) {
          console.error('❌ Nenhum bombeiro encontrado');
          toast.error('❌ Nenhum bombeiro encontrado na planilha');
          setCarregando(false);
          return;
        }

        // Salvar bombeiros no Supabase via tRPC
        console.log('💾 Salvando bombeiros no Supabase...');
        
        for (const bombeiro of bombeirosCriados) {
          try {
            await createBombeiro.mutateAsync({
              id: crypto.randomUUID(),
              nome: bombeiro.nome,
              equipe: bombeiro.equipe as 'VD' | 'AM' | 'AZ',
              dataInicio: bombeiro.dataInicio,
            });
          } catch (error) {
            console.error(`Erro ao salvar ${bombeiro.nome}:`, error);
          }
        }
        
        // Recarregar lista de bombeiros do Supabase
        await utils.bombeiros.list.invalidate();
        
        // Atualizar estado local
        setBombeiros(bombeirosCriados);
        toast.success(`✅ ${bombeirosCriados.length} bombeiros importados e salvos no banco de dados!`);

        console.log('✓ Bombeiros salvos no Supabase e lista recarregada');

        // Aguardar um pouco para garantir que os dados foram salvos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (erro) {
        console.error('❌ Erro ao processar:', erro);
        toast.error('❌ Erro ao processar arquivo');
        setCarregando(false);
      } finally {
        setCarregando(false);
      }
    };

    reader.onerror = () => {
      console.error('❌ Erro ao ler arquivo');
      toast.error('❌ Erro ao ler arquivo');
      setCarregando(false);
    };

    console.log('📂 Iniciando leitura do arquivo...');
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Planilha Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Instruções:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Selecione seu arquivo Excel (.xlsx ou .xls)</li>
              <li>Abra o Console (F12) para ver o progresso</li>
              <li>Após o carregamento, vá para o Dashboard para ver os saldos</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={carregando}
            className="hidden"
          />
          <Button
            onClick={() => {
              console.log('🖱️ Botão clicado - abrindo seletor de arquivo');
              fileInputRef.current?.click();
            }}
            disabled={carregando}
            className="w-full"
            size="lg"
          >
            {carregando ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo Excel
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
