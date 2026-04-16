import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import { supabase } from "./db";

export const appRouter = router({
  bombeiros: router({
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("bombeiros")
        .select(`*, escalas(*)`);
      if (error) throw new Error(error.message);
      return data || [];
    }),

    create: publicProcedure
      .input(z.object({ 
        nome: z.string(), 
        equipe: z.string(), 
        dataInicio: z.date() 
      }))
      .mutation(async ({ input }) => {
        const { data, error } = await supabase.from("bombeiros").insert([{
          nome: input.nome.toUpperCase(),
          equipe: input.equipe,
          data_inicio: input.dataInicio.toISOString()
        }]).select();
        if (error) throw new Error(error.message);
        return data?.[0];
      }),

    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      await supabase.from("bombeiros").delete().eq("id", input);
      return { success: true };
    }),
  }),

  escalas: router({
    update: publicProcedure
      .input(z.object({ 
        bombeiroId: z.string(), 
        data: z.string(), 
        sigla: z.string() 
      }))
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