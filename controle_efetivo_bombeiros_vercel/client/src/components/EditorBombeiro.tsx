import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bombeiro } from '@/lib/foCalculator';
import { useEscala } from '@/contexts/EscalaContext';
import { Edit2, X } from 'lucide-react';

interface EditorBombeiroProps {
  bombeiro: Bombeiro;
  isOpen: boolean;
  onClose: () => void;
}

export function EditorBombeiro({ bombeiro, isOpen, onClose }: EditorBombeiroProps) {
  const { atualizarBombeiro } = useEscala();
  const [nome, setNome] = useState(bombeiro.nome);
  const [equipe, setEquipe] = useState(bombeiro.equipe || '');
  const [dataInicio, setDataInicio] = useState(
    bombeiro.dataInicio 
      ? new Date(bombeiro.dataInicio).toISOString().split('T')[0]
      : '2026-01-01'
  );

  const handleSalvar = () => {
    atualizarBombeiro(
      bombeiro.id,
      nome,
      equipe as 'VD' | 'AM' | 'AZ',
      new Date(dataInicio)
    );
    onClose();
  };

  const handleReset = () => {
    setNome(bombeiro.nome);
    setEquipe(bombeiro.equipe || '');
    setDataInicio(
      bombeiro.dataInicio 
        ? new Date(bombeiro.dataInicio).toISOString().split('T')[0]
        : '2026-01-01'
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Editar Bombeiro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-medium">
              Nome
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do bombeiro"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipe" className="text-sm font-medium">
              Equipe
            </Label>
            <Input
              id="equipe"
              value={equipe}
              onChange={(e) => setEquipe(e.target.value)}
              placeholder="Ex: Equipe A"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataInicio" className="text-sm font-medium">
              Data de Início
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="text-sm"
          >
            Resetar
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="text-sm"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
