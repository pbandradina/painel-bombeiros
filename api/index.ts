import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
// Importa o seu appRouter da pasta server
import { appRouter } from "../server/routers"; 

const app = express();
app.use(express.json());

// Configura o endpoint que o seu Frontend vai chamar
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

export default app;