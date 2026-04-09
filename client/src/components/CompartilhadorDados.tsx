import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Share2 } from 'lucide-react';
import { useEscala } from '@/contexts/EscalaContext';
import { toast } from 'sonner';

export function CompartilhadorDados() {
  const { bombeiros, setBombeiros } = useEscala();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportarDados = () => {
    if (bombeiros.length === 0) {
      toast.error('❌ Nenhum bombeiro para exportar');
      return;
    }

    // Preparar dados para exportação
    const dadosExportacao = {
      versao: '1.0',
      dataExportacao: new Date().toISOString(),
      bombeiros: bombeiros.map(b => ({
        id: b.id,
        nome: b.nome,
        equipe: b.equipe,
        dataInicio: typeof b.dataInicio === 'string' 
          ? b.dataInicio 
          : b.dataInicio.toISOString().split('T')[0],
        escala: b.escala,
      })),
    };

    // Criar arquivo JSON
    const json = JSON.stringify(dadosExportacao, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `controle-bombeiros-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`✅ Dados exportados! ${bombeiros.length} bombeiro(s) salvos.`);
  };

  const importarDados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        const dados = JSON.parse(conteudo);

        // Validar estrutura
        if (!dados.bombeiros || !Array.isArray(dados.bombeiros)) {
          toast.error('❌ Arquivo JSON inválido');
          return;
        }

        // Converter datas de volta para Date
        const bombeirosImportados = dados.bombeiros.map((b: any) => ({
          ...b,
          dataInicio: new Date(b.dataInicio),
          escala: b.escala || {},
        }));

        // Perguntar se quer substituir ou mesclar
        const confirmar = window.confirm(
          `Importar ${bombeirosImportados.length} bombeiro(s)?\n\n` +
          'Clique OK para SUBSTITUIR todos os dados atuais.\n' +
          'Clique CANCELAR para MESCLAR com os dados existentes.'
        );

        if (confirmar) {
          // Substituir
          setBombeiros(bombeirosImportados);
          toast.success(`✅ Dados substituídos! ${bombeirosImportados.length} bombeiro(s) importados.`);
        } else {
          // Mesclar - adicionar bombeiros que não existem
          const idsExistentes = new Set(bombeiros.map(b => b.id));
          const bombeirosNovos = bombeirosImportados.filter((b: any) => !idsExistentes.has(b.id));
          
          if (bombeirosNovos.length > 0) {
            setBombeiros([...bombeiros, ...bombeirosNovos]);
            toast.success(`✅ ${bombeirosNovos.length} bombeiro(s) novo(s) adicionado(s).`);
          } else {
            toast.info('ℹ️ Nenhum bombeiro novo para adicionar.');
          }
        }
      } catch (erro) {
        console.error('Erro ao importar:', erro);
        toast.error('❌ Erro ao importar arquivo JSON');
      }
    };

    reader.readAsText(file);

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Exporte seus dados em JSON para compartilhar com colegas ou fazer backup.
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={exportarDados}
              className="flex-1"
              disabled={bombeiros.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar JSON
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importarDados}
            className="hidden"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-xs text-blue-800">
            💡 <strong>Como usar:</strong> Clique em "Exportar JSON", envie o arquivo para seu colega via WhatsApp/Email, e ele clica em "Importar JSON" para carregar os dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
