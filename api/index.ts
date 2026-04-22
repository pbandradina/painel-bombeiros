import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routers.js";
import cors from "cors";

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

// Exportar para a Vercel usar como Serverless Function
export default app;
