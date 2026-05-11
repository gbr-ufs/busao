// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { set_useful_sqlite_pragmas } from "../../db/pragmas";
import { configuration, trips } from "../../db/schema";
import { enUS } from "../../i18n/enUS";
import { dateYMDToString } from "../../shared/utils";
import { renderAdminTripsRows } from "./rows";

describe("Table Row Components", () => {
	let SQLITE: Database;
	let DATABASE: BunSQLiteDatabase;

	beforeEach(async () => {
		SQLITE = new Database(":memory:");

		set_useful_sqlite_pragmas(SQLITE);

		DATABASE = drizzle(SQLITE);

		migrate(DATABASE, { migrationsFolder: "drizzle" });
		DATABASE.insert(configuration)
			.values({ id: 1, oneWaySeats: 1, returnSeats: 1 })
			.run();
	});

	afterEach(async () => {
		SQLITE.close();
	});

	test("[renderAdminTripsRow] Should render table rows containing trip information", async () => {
		const date = new Date();
		const trip = "oneWay";
		const ana = DATABASE.insert(trips)
			.values({
				date: dateYMDToString(date),
				name: "Ana",
				trip: trip,
				status: "confirmed",
			})
			.returning()
			.get();
		const search = "Ana";
		const rows = renderAdminTripsRows(
			enUS,
			DATABASE,
			date,
			trip,
			"confirmed",
			search,
		);

		expect(rows).toContain(ana.id);
	});
});
