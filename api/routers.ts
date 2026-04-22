import { router, publicProcedure } from "./trpc.js";
import { z } from "zod";
import { supabase } from "./db.js";

export const appRouter = router({
  bombeiros: router({
    // Lista todos os bombeiros
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("bombeiros")
        .select(`*, escalas(*)`);
      
      if (error) {
        console.error("Erro ao listar:", error.message);
        throw new Error(error.message);
      }
      return data || [];
    }),

    // Cria novo bombeiro (Foco aqui para resolver o erro 500)
    create: publicProcedure
      .input(z.object({ 
        nome: z.string(), 
        equipe: z.string(), 
        dataInicio: z.date() 
      }))
      .mutation(async ({ input }) => {
        try {
          const { data, error } = await supabase
            .from("bombeiros")
            .insert([{
              nome: input.nome.toUpperCase(),
              equipe: input.equipe,
              data_inicio: input.dataInicio.toISOString()
            }])
            .select();

          if (error) {
            console.error("Erro Supabase Insert:", error.message);
            throw new Error(error.message);
          }
          
          return data?.[0];
        } catch (e: any) {
          console.error("Erro interno no servidor:", e.message);
          throw new Error("Falha ao salvar bombeiro no banco.");
        }
      }),

    // Deleta bombeiro
    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      const { error } = await supabase.from("bombeiros").delete().eq("id", input);
      if (error) throw new Error(error.message);
      return { success: true };
    }),
  }),

  escalas: router({
    update: publicProcedure
      .input(z.object({ bombeiroId: z.string(), data: z.string(), sigla: z.string() }))
      .mutation(async ({ input }) => {
        if (input.sigla === "") {
          await supabase.from("escalas").delete().match({ bombeiro_id: input.bombeiroId, data: input.data });
        } else {
          await supabase.from("escalas").upsert({
            bombeiro_id: input.bombeiroId,
            data: input.data,
            sigla: input.sigla
          });
        }
        return { success: true };
      })
  })
});

export type AppRouter = typeof appRouter;