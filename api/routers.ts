import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import { supabase } from "./db";

export const appRouter = router({
  bombeiros: router({
    // Lista todos os bombeiros e suas escalas
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("bombeiros")
        .select(`*, escalas(*)`);
      
      if (error) {
        console.error("Erro ao buscar bombeiros:", error.message);
        throw new Error(error.message);
      }
      return data || [];
    }),

    // Cria um novo bombeiro
    create: publicProcedure
      .input(z.object({ 
        nome: z.string(), 
        equipe: z.string(), 
        dataInicio: z.date() 
      }))
      .mutation(async ({ input }) => {
        const { data, error } = await supabase
          .from("bombeiros")
          .insert([{
            nome: input.nome.toUpperCase(),
            equipe: input.equipe,
            data_inicio: input.dataInicio.toISOString()
          }])
          .select();

        if (error) {
          console.error("Erro ao inserir bombeiro:", error.message);
          throw new Error(error.message);
        }
        return data?.[0];
      }),

    // Deleta um bombeiro
    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      const { error } = await supabase.from("bombeiros").delete().eq("id", input);
      if (error) throw new Error(error.message);
      return { success: true };
    }),
  }),

  escalas: router({
    // Atualiza ou insere um dia na escala
    update: publicProcedure
      .input(z.object({ 
        bombeiroId: z.string(), 
        data: z.string(), 
        sigla: z.string() 
      }))
      .mutation(async ({ input }) => {
        if (input.sigla === "") {
          const { error } = await supabase
            .from("escalas")
            .delete()
            .match({ bombeiro_id: input.bombeiroId, data: input.data });
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase
            .from("escalas")
            .upsert({
              bombeiro_id: input.bombeiroId,
              data: input.data,
              sigla: input.sigla
            });
          if (error) throw new Error(error.message);
        }
        return { success: true };
      })
  })
});

export type AppRouter = typeof appRouter;