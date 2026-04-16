list: publicProcedure.query(async () => {
  try {
    const data = await getBombeiros();
    return data.map((b: any) => ({
      id: b.id,
      nome: b.nome || "Sem Nome",
      equipe: b.equipe || "VD",
      dataInicio: b.data_inicio || new Date().toISOString(),
      escalas: [] // Retornamos vazio por enquanto para o build passar
    }));
  } catch (e) {
    console.error("Erro no roteador:", e);
    throw new Error("Erro ao buscar dados");
  }
}),