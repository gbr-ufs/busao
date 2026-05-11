// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { randomUUIDv7 } from "bun";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const configuration = sqliteTable("configuration", {
	id: integer("id").primaryKey(),
	oneWaySeats: integer("one_way_seats").notNull(),
	returnSeats: integer("return_seats").notNull(),
});

export const trips = sqliteTable("trips", {
	id: text("id")
		.primaryKey()
		.unique()
		.$defaultFn(() => randomUUIDv7()),
	date: text("date").notNull(),
	name: text("name").notNull(),
	trip: text("trip", {
		enum: ["oneWay", "return"],
	}).notNull(),
	tripToken: text("trip_token")
		.notNull()
		.$defaultFn(() => randomUUIDv7()),
	status: text("status", { enum: ["cancelled", "confirmed", "waitlist"] })
		.default("waitlist")
		.notNull(),
});

export const sessions = sqliteTable("sessions", {
	id: text("id")
		.primaryKey()
		.unique()
		.$defaultFn(() => randomUUIDv7()),
});
