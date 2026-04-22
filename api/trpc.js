"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const supabase_js_1 = require("@supabase/supabase-js");
const server_1 = require("@trpc/server");
const superjson_1 = __importDefault(require("superjson"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
// Inicializar tRPC
const t = server_1.initTRPC.create({
    transformer: superjson_1.default,
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
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
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
            .input(zod_1.z.object({
            nome: zod_1.z.string(),
            equipe: zod_1.z.string(),
            dataInicio: zod_1.z.date()
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
            }
            catch (e) {
                console.error("Erro interno no servidor:", e.message);
                throw new Error("Falha ao salvar bombeiro no banco.");
            }
        }),
        // Deleta bombeiro
        delete: publicProcedure
            .input(zod_1.z.object({ id: zod_1.z.number() }))
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
            .input(zod_1.z.object({
            bombeiro_id: zod_1.z.number(),
            data: zod_1.z.date(),
            turno: zod_1.z.string()
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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rota oficial da API que o seu Frontend chama
app.use("/api/trpc", trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
}));
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
// Exportar para a Vercel usar como Serverless Function
exports.default = app;
