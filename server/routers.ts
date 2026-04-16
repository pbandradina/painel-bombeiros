// server/routers.ts -> dentro de bombeiros: router({ ...

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
        .select(); // O .select() é importante para retornar o dado criado

      if (error) {
        console.error("Erro Supabase:", error.message);
        throw new Error(error.message);
      }
      
      return data[0];
    } catch (e: any) {
      console.error("Erro no Servidor:", e.message);
      throw new Error(e.message);
    }
  }),