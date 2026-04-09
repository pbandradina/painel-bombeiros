import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import {
  getBombeiros,
  getBombeiro,
  createBombeiro,
  updateBombeiro,
  deleteBombeiro,
  getEscalas,
  getEscala,
  createEscala,
  updateEscala,
  deleteEscala,
  deleteEscalasByBombero,
} from "./db";

export const appRouter = router({
  bombeiros: router({
    // Obter todos os bombeiros
    list: publicProcedure.query(async () => {
      const bombeiros = await getBombeiros();
      return bombeiros.map((b: any) => ({
        nome: b.nome,
        equipe: b.equipe,
        dataInicio: typeof b.dataInicio === 'string' ? b.dataInicio : b.dataInicio.toISOString(),
        escalas: b.escalas || [],
      }));
    }),

    // Obter um bombeiro específico
    get: publicProcedure.input(z.string()).query(async ({ input }) => {
      const result = await getBombeiro(input);
      if (result.length === 0) return null;
      const b = result[0];
      return {
        id: b.id,
        nome: b.nome,
        equipe: b.equipe,
        dataInicio: typeof b.dataInicio === 'string' ? b.dataInicio : b.dataInicio.toISOString(),
        escalas: b.escalas || [],
      };
    }),

    // Criar novo bombeiro
    create: publicProcedure
      .input(
        z.object({
          id: z.string(),
          nome: z.string(),
          equipe: z.enum(["VD", "AM", "AZ"]),
          dataInicio: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        await createBombeiro(input);
        return {
          id: input.id,
          nome: input.nome,
          equipe: input.equipe,
          dataInicio: input.dataInicio.toISOString(),
          escalas: [],
        };
      }),

    // Atualizar bombeiro
    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          nome: z.string().optional(),
          equipe: z.enum(["VD", "AM", "AZ"]).optional(),
          dataInicio: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateBombeiro(id, updates);
        return {
          id: input.id,
          nome: input.nome || '',
          equipe: input.equipe || 'VD',
          dataInicio: input.dataInicio ? input.dataInicio.toISOString() : new Date().toISOString(),
          escalas: [],
        };
      }),

    // Deletar bombeiro
    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      await deleteBombeiro(input);
      return { success: true, id: input };
    }),
  }),

  escalas: router({
    // Obter escalas de um bombeiro
    list: publicProcedure.input(z.string()).query(async ({ input }) => {
      return getEscalas(input);
    }),

    // Obter uma escala específica
    get: publicProcedure
      .input(
        z.object({
          bomberoId: z.string(),
          data: z.string(),
        })
      )
      .query(async ({ input }) => {
        const result = await getEscala(input.bomberoId, input.data);
        return result.length > 0 ? result[0] : null;
      }),

    // Criar escala
    create: publicProcedure
      .input(
        z.object({
          id: z.string(),
          bomberoId: z.string(),
          data: z.string(),
          sigla: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await createEscala(input);
        return { id: input.id, bomberoId: input.bomberoId, data: input.data, sigla: input.sigla };
      }),

    // Atualizar escala
    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          sigla: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, sigla } = input;
        await updateEscala(id, { sigla });
        return { id, sigla };
      }),

    // Deletar escala
    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      await deleteEscala(input);
      return { success: true, id: input };
    }),

    // Deletar todas as escalas de um bombeiro
    deleteByBombero: publicProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        await deleteEscalasByBombero(input);
        return { success: true, bomberoId: input };
      }),
  }),
});

export type AppRouter = typeof appRouter;
