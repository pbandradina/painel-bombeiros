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
        .insert([
          {
            nome: input.nome.toUpperCase(),
            equipe: input.equipe,
            data_inicio: input.dataInicio.toISOString(),
          },
        ])
        .select(); // O .select() é fundamental para o tRPC confirmar o sucesso

      if (error) throw error;
      return data[0];
    } catch (e: any) {
      console.error("Erro ao criar bombeiro:", e.message);
      throw new Error("Falha no banco de dados: " + e.message);
    }
  }),