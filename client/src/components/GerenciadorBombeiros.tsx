import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Users, Edit2, Loader2, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// Ordem de hierarquia
const HIERARQUIA_ORDEM = [
  '1º Sgt PM Coltri',
  '1º Sgt PM Berto',
  '2º Sgt PM Bruce',
  '2º Sgt PM Mathias',
  '3º Sgt PM Caio César',
  'Cb PM Alain',
  'Cb PM Alessandro',
  'Cb PM Silva Jr',
  'Cb PM Silveira',
  'Cb PM Bravo',
  'Cb PM Rossete',
  'Cb PM Caroline',
  'Cb PM Bortoleto',
  'Cb PM Vieira',
  'Cb PM Saulo',
  'Cb PM Corrêa',
  'Cb PM Luiz Gustavo',
  'Cb PM Hugo',
  'Sd PM Fausto',
  'Sd PM Lucian',
  'Sd PM Anderson Ferreira',
];

const ordenarBombeiros = (bombeiros: any[]) => {
  return [...bombeiros].sort((a, b) => {
    const indexA = HIERARQUIA_ORDEM.indexOf(a.nome);
    const indexB = HIERARQUIA_ORDEM.indexOf(b.nome);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

export function GerenciadorBombeiros() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [inserirAntesId, setInserirAntesId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    equipe: 'VD' as 'VD' | 'AM' | 'AZ',
    dataInicio: new Date().toISOString().split('T')[0],
  });
  const [bombeiros, setBombeiros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load bombeiros on mount
  useEffect(() => {
    loadBombeiros();
  }, []);

  const loadBombeiros = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.bombeiros.list();
      setBombeiros(data || []);
    } catch (error: any) {
      toast.error(`❌ Erro ao carregar bombeiros: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const abrirDialogoAdicionar = () => {
    setEditandoId(null);
    setInserirAntesId(null);
    setFormData({
      nome: '',
      equipe: 'VD',
      dataInicio: new Date().toISOString().split('T')[0],
    });
    setDialogAberto(true);
  };

  const abrirDialogoInserirAntes = (bomberoBefore: any) => {
    setEditandoId(null);
    setInserirAntesId(bomberoBefore.id);
    setFormData({
      nome: '',
      equipe: 'VD',
      dataInicio: new Date().toISOString().split('T')[0],
    });
    setDialogAberto(true);
  };

  const abrirDialogoEditar = (bombeiro: any) => {
    setEditandoId(bombeiro.id);
    setFormData({
      nome: bombeiro.nome,
      equipe: bombeiro.equipe,
      dataInicio: typeof bombeiro.dataInicio === 'string'
        ? bombeiro.dataInicio
        : bombeiro.dataInicio.toISOString().split('T')[0],
    });
    setDialogAberto(true);
  };

  const handleSalvarBombeiro = async () => {
    if (!formData.nome.trim()) {
      toast.error('❌ Nome do bombeiro é obrigatório');
      return;
    }

    try {
      setIsCreating(true);
      await apiClient.bombeiros.create({
        nome: formData.nome.trim(),
        equipe: formData.equipe,
        data_inicio: `${formData.dataInicio}T00:00:00Z`,
      });
      
      toast.success(`✅ Bombeiro "${formData.nome}" adicionado!`);
      setDialogAberto(false);
      setFormData({
        nome: '',
        equipe: 'VD',
        dataInicio: new Date().toISOString().split('T')[0],
      });
      
      // Reload bombeiros
      await loadBombeiros();
    } catch (error: any) {
      toast.error(`❌ Erro ao adicionar: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoverBombeiro = async (id: string) => {
    const bombeiro = bombeiros.find((b: any) => b.id === id);
    if (window.confirm(`Tem certeza que deseja remover "${bombeiro?.nome}"?`)) {
      try {
        setIsDeleting(true);
        await apiClient.bombeiros.delete(parseInt(id));
        toast.success('✅ Bombeiro removido!');
        await loadBombeiros();
      } catch (error: any) {
        toast.error(`❌ Erro ao remover: ${error.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Bombeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Bombeiros ({bombeiros.length})
          </CardTitle>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button onClick={abrirDialogoAdicionar} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Bombeiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editandoId ? 'Editar Bombeiro' : inserirAntesId ? 'Inserir Bombeiro' : 'Adicionar Novo Bombeiro'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nome
                  </label>
                  <Input
                    placeholder="Ex: Sgt Coltri"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Equipe
                  </label>
                  <select
                    value={formData.equipe}
                    onChange={(e) => setFormData({ ...formData, equipe: e.target.value as 'VD' | 'AM' | 'AZ' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VD">Verde (VD)</option>
                    <option value="AM">Amarelo (AM)</option>
                    <option value="AZ">Azul (AZ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={handleSalvarBombeiro}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Adicionar'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bombeiros.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Nenhum bombeiro adicionado. Importe uma planilha ou adicione manualmente.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ordenarBombeiros(bombeiros).map((bombeiro: any) => (
              <div
                key={bombeiro.id}
                className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{bombeiro.nome}</p>
                  <p className="text-xs text-gray-600">
                    Equipe: <span className="font-medium">{bombeiro.equipe}</span>
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirDialogoEditar(bombeiro)}
                    className="gap-1 flex-1 text-xs h-7"
                  >
                    <Edit2 className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirDialogoInserirAntes(bombeiro)}
                    className="gap-1 flex-1 text-xs h-7"
                    title="Inserir novo bombeiro antes deste"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Inserir
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoverBombeiro(bombeiro.id)}
                    disabled={isDeleting}
                    className="gap-1 flex-1 text-xs h-7"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
