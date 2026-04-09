import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Bombeiro, CalculoFO, calcularTodosBombeiros } from '@/lib/foCalculator';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface EscalaContextType {
  bombeiros: Bombeiro[];
  setBombeiros: (bombeiros: Bombeiro[]) => void;
  adicionarBombeiro: (nome: string, equipe: 'VD' | 'AM' | 'AZ') => Promise<void>;
  atualizarBombeiro: (id: string, nome: string, equipe: 'VD' | 'AM' | 'AZ', dataInicio: Date) => Promise<void>;
  removerBombeiro: (id: string) => Promise<void>;
  atualizarEscala: (bombeiroId: string, data: string, sigla: string) => Promise<void>;
  calculos: Record<string, CalculoFO>;
  carregando: boolean;
  erro: string | null;
}

const EscalaContext = createContext<EscalaContextType | undefined>(undefined);

export function EscalaProvider({ children }: { children: React.ReactNode }) {
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [calculos, setCalculos] = useState<Record<string, CalculoFO>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  // Carregar dados do Supabase
  const carregarDadosDoBanco = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      // Busca bombeiros com suas escalas relacionadas
      const { data: listaBombeiros, error: erroBombeiros } = await supabase
        .from('bombeiros')
        .select(`
          id,
          nome,
          equipe,
          data_inicio,
          escalas(id, data, sigla)
        `);

      if (erroBombeiros) {
        console.error('Erro ao carregar bombeiros:', erroBombeiros);
        setErro(erroBombeiros.message);
        return;
      }

      if (!listaBombeiros) {
        setBombeiros([]);
        setCalculos({});
        return;
      }

      // Formata os dados para o padrão que o app usa
      const formatados: Bombeiro[] = listaBombeiros.map((b: any) => ({
        id: b.id,
        nome: b.nome,
        equipe: b.equipe,
        dataInicio: new Date(b.data_inicio),
        escala: b.escalas?.reduce((acc: Record<string, string>, curr: any) => ({
          ...acc,
          [curr.data]: curr.sigla,
        }), {}) || {},
      }));

      setBombeiros(formatados);

      // Recalcula FOs
      const novosCalculos = calcularTodosBombeiros(formatados);
      setCalculos(novosCalculos);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErro(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Configurar Realtime
  useEffect(() => {
    carregarDadosDoBanco();

    // Escuta mudanças em tempo real
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bombeiros' },
        () => {
          console.log('Mudança detectada em bombeiros, recarregando...');
          carregarDadosDoBanco();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escalas' },
        () => {
          console.log('Mudança detectada em escalas, recarregando...');
          carregarDadosDoBanco();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [carregarDadosDoBanco]);

  // Adicionar bombeiro
  const adicionarBombeiro = useCallback(async (nome: string, equipe: 'VD' | 'AM' | 'AZ') => {
    try {
      const { error } = await supabase.from('bombeiros').insert([
        {
          nome,
          equipe,
          data_inicio: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      // Realtime vai atualizar automaticamente
    } catch (err) {
      console.error('Erro ao adicionar bombeiro:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar bombeiro');
      throw err;
    }
  }, []);

  // Atualizar bombeiro
  const atualizarBombeiro = useCallback(
    async (id: string, nome: string, equipe: 'VD' | 'AM' | 'AZ', dataInicio: Date) => {
      try {
        const { error } = await supabase
          .from('bombeiros')
          .update({
            nome,
            equipe,
            data_inicio: dataInicio.toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        // Realtime vai atualizar automaticamente
      } catch (err) {
        console.error('Erro ao atualizar bombeiro:', err);
        setErro(err instanceof Error ? err.message : 'Erro ao atualizar bombeiro');
        throw err;
      }
    },
    []
  );

  // Remover bombeiro
  const removerBombeiro = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('bombeiros').delete().eq('id', id);

      if (error) throw error;
      // Realtime vai atualizar automaticamente
    } catch (err) {
      console.error('Erro ao remover bombeiro:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao remover bombeiro');
      throw err;
    }
  }, []);

  // Atualizar escala
  const atualizarEscala = useCallback(async (bombeiroId: string, data: string, sigla: string) => {
    try {
      if (sigla === '') {
        // Desmarcou - deleta
        const { error } = await supabase
          .from('escalas')
          .delete()
          .eq('bombeiro_id', bombeiroId)
          .eq('data', data);

        if (error) throw error;
      } else {
        // Marcou - insere ou atualiza
        const { error } = await supabase.from('escalas').upsert([
          {
            bombeiro_id: bombeiroId,
            data,
            sigla,
          },
        ]);

        if (error) throw error;
      }
      // Realtime vai atualizar automaticamente
    } catch (err) {
      console.error('Erro ao atualizar escala:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar escala');
      throw err;
    }
  }, []);

  const value: EscalaContextType = {
    bombeiros,
    setBombeiros,
    adicionarBombeiro,
    atualizarBombeiro,
    removerBombeiro,
    atualizarEscala,
    calculos,
    carregando,
    erro,
  };

  return <EscalaContext.Provider value={value}>{children}</EscalaContext.Provider>;
}

export function useEscala() {
  const context = useContext(EscalaContext);
  if (!context) {
    throw new Error('useEscala deve ser usado dentro de EscalaProvider');
  }
  return context;
}
