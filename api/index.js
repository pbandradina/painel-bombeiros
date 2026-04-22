const express = require("express");
const trpcExpress = require("@trpc/server/adapters/express");
const { createClient } = require("@supabase/supabase-js");
const { initTRPC } = require("@trpc/server");
const superjson = require("superjson");
const cors = require("cors");
const { z } = require("zod");

// Inicializar tRPC
const t = initTRPC.create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// Definir routers
const appRouter = router({
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
        const { data, error } = await supabase
          .from("bombeiros")
          .insert([{
            nome: input.nome.toUpperCase(),
            equipe: input.equipe,
            data_inicio: input.dataInicio.toISOString()
          }])
          .select();

        if (error) throw new Error(error.message);
        return data?.[0];
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { error } = await supabase
          .from("bombeiros")
          .delete()
          .eq("id", input.id);

        if (error) throw new Error(error.message);
        return { success: true };
      }),
  }),

  escalas: router({
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("escalas")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data || [];
    }),

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

        if (error) throw new Error(error.message);
        return data?.[0];
      }),
  }),
});

// Criar aplicação Express
const app = express();

app.use(cors());
app.use(express.json());

// Rota da API tRPC
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

// Exportar como handler do Vercel
module.exports = (req, res) => {
  // Remover o prefixo /api se existir
  if (req.url.startsWith("/api")) {
    req.url = req.url.slice(4);
  }
  
  // Delegar para o Express
  app(req, res);
};
