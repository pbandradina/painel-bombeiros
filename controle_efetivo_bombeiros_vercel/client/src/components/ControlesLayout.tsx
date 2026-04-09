import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';

export function ControlesLayout() {
  const { tamanhoCalendario, setTamanhoCalendario, tamanhoDashboard, setTamanhoDashboard } = useLayout();

  return (
    <Card className="max-w-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Ajustar Layout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Tamanho do Calendário */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-2">Calendário</label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={tamanhoCalendario === 'pequeno' ? 'default' : 'outline'}
              onClick={() => setTamanhoCalendario('pequeno')}
              className="flex-1 text-xs h-8"
            >
              <ZoomOut className="w-3 h-3 mr-1" />
              Pequeno
            </Button>
            <Button
              size="sm"
              variant={tamanhoCalendario === 'medio' ? 'default' : 'outline'}
              onClick={() => setTamanhoCalendario('medio')}
              className="flex-1 text-xs h-8"
            >
              Médio
            </Button>
            <Button
              size="sm"
              variant={tamanhoCalendario === 'grande' ? 'default' : 'outline'}
              onClick={() => setTamanhoCalendario('grande')}
              className="flex-1 text-xs h-8"
            >
              <ZoomIn className="w-3 h-3 mr-1" />
              Grande
            </Button>
          </div>
        </div>

        {/* Tamanho do Dashboard */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-2">Dashboard</label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={tamanhoDashboard === 'compacto' ? 'default' : 'outline'}
              onClick={() => setTamanhoDashboard('compacto')}
              className="flex-1 text-xs h-8"
            >
              <ZoomOut className="w-3 h-3 mr-1" />
              Compacto
            </Button>
            <Button
              size="sm"
              variant={tamanhoDashboard === 'normal' ? 'default' : 'outline'}
              onClick={() => setTamanhoDashboard('normal')}
              className="flex-1 text-xs h-8"
            >
              Normal
            </Button>
            <Button
              size="sm"
              variant={tamanhoDashboard === 'grande' ? 'default' : 'outline'}
              onClick={() => setTamanhoDashboard('grande')}
              className="flex-1 text-xs h-8"
            >
              <ZoomIn className="w-3 h-3 mr-1" />
              Grande
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
