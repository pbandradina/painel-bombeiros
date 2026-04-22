import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import cors from "cors";
import { z } from "zod";

// Inicializar tRPC
const t = initTRPC.create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRÍTICO: Variáveis de ambiente do Supabase não encontradas.");
  console.error("SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Definir routers
const appRouter = router({
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

    // Cria novo bombeiro
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
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { error } = await supabase
          .from("bombeiros")
          .delete()
          .eq("id", input.id);

        if (error) {
          console.error("Erro ao deletar:", error.message);
          throw new Error(error.message);
        }

        return { success: true };
      }),
  }),

  escalas: router({
    // Lista todas as escalas
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("escalas")
        .select("*");
      
      if (error) {
        console.error("Erro ao listar escalas:", error.message);
        throw new Error(error.message);
      }
      return data || [];
    }),

    // Cria nova escala
    create: publicProcedure
      .input(z.object({ 
        bombeiro_id: z.number(),
        data: z.date(),
        turno: z.string()
      }))
      .mutation(async ({ input }) => {
        const { data, error } = await supabase
          .from("escalas")
          .insert([{
            bombeiro_id: input.bombeiro_id,
            data: input.data.toISOString(),
            turno: input.turno
          }])
          .select();

        if (error) {
          console.error("Erro ao criar escala:", error.message);
          throw new Error(error.message);
        }

        return data?.[0];
      }),
  }),
});

// Criar aplicação Express
const app = express();

app.use(cors());
app.use(express.json());

// Rota oficial da API que o seu Frontend chama
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Exportar para a Vercel usar como Serverless Function
export default app;
