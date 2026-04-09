CREATE TABLE `bombeiros` (
	`id` varchar(255) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`equipe` varchar(10) NOT NULL,
	`data_inicio` datetime NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `bombeiros_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalas` (
	`id` varchar(255) NOT NULL,
	`bombero_id` varchar(255) NOT NULL,
	`data` varchar(10) NOT NULL,
	`sigla` varchar(10) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `escalas_id` PRIMARY KEY(`id`)
);
