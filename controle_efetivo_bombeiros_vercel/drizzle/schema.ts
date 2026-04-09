import { mysqlTable, varchar, text, json, datetime, int } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Tabela de Bombeiros
 */
export const bombeirosTable = mysqlTable("bombeiros", {
  id: varchar("id", { length: 255 }).primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  equipe: varchar("equipe", { length: 10 }).notNull(), // VD, AM, AZ
  dataInicio: datetime("data_inicio").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tabela de Escalas (calendário de serviços)
 * Armazena cada dia de escala para cada bombeiro
 */
export const escalasTable = mysqlTable("escalas", {
  id: varchar("id", { length: 255 }).primaryKey(),
  bomberoId: varchar("bombero_id", { length: 255 }).notNull(),
  data: varchar("data", { length: 10 }).notNull(), // YYYY-MM-DD
  sigla: varchar("sigla", { length: 10 }).notNull(), // VD, AM, AZ, FO, DS, F, LP, etc
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Bombeiro = typeof bombeirosTable.$inferSelect;
export type BomberoInsert = typeof bombeirosTable.$inferInsert;

export type Escala = typeof escalasTable.$inferSelect;
export type EscalaInsert = typeof escalasTable.$inferInsert;
