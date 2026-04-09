import { Button } from '@/components/ui/button';
import { useEscala } from '@/contexts/EscalaContext';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';

export function BackupRestore() {
  const { bombeiros, setBombeiros } = useEscala();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    try {
      const dados = JSON.stringify(bombeiros, null, 2);
      const blob = new Blob([dados], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_bombeiros_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('✅ Backup criado com sucesso');
    } catch (erro) {
      console.error('Erro ao criar backup:', erro);
      toast.error('❌ Erro ao criar backup');
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const conteudo = e.target?.result as string;
          const dados = JSON.parse(conteudo);
          
          // Validar estrutura básica
          if (!Array.isArray(dados)) {
            throw new Error('Formato inválido: esperado um array');
          }

          setBombeiros(dados);
          toast.success('✅ Dados restaurados com sucesso');
        } catch (erro) {
          console.error('Erro ao restaurar:', erro);
          toast.error('❌ Arquivo inválido ou corrompido');
        }
      };
      reader.readAsText(file);
    } catch (erro) {
      console.error('Erro ao processar arquivo:', erro);
      toast.error('❌ Erro ao processar arquivo');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleBackup}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Backup JSON
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleRestore}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Restaurar JSON
      </Button>
    </div>
  );
}
