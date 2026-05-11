// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { set_useful_sqlite_pragmas } from "../db/pragmas";
import { configuration } from "../db/schema";
import { enUS } from "../i18n/enUS";
import {
	renderAdminCancelTripForm,
	renderAdminClearTripsForm,
	renderAdminForm,
	renderAdminSearchTripForm,
	renderTripsForm,
	renderUpdateSeatCountForm,
} from "./forms";

describe("Form Components", () => {
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

	test("[renderTripsForm] Should render the form for adding a trip", async () => {
		const form = renderTripsForm(enUS, "/trips");

		expect(form).toContain(enUS.form.button);
	});

	test("[renderAdminForm] Should render the login form of the admin page", async () => {
		const form = renderAdminForm(enUS);

		expect(form).toContain(enUS.admin.button);
	});

	test("[renderUpdateSeatCountForm] Should render the form for updating the number of available seats on the bus", async () => {
		const form = renderUpdateSeatCountForm(enUS, DATABASE, "oneWay", 40);

		expect(form).toContain(enUS.admin.button);
	});

	test("[renderAdminCancelTripForm] Should render the form for cancelling someone's strip from the admin panel", async () => {
		const id = "1";
		const form = renderAdminCancelTripForm(enUS, id);

		expect(form).toContain(id);
	});

	test("[renderAdminSearchTripForm] Should render the form for searching a trip by name", async () => {
		const search = "foo";
		const form = renderAdminSearchTripForm(
			"/trips",
			"search-results-oneWay-confirmed",
			"oneWay",
			"confirmed",
			search,
		);

		expect(form).toContain(search);
	});

	test("[renderAdminClearTripsForm] Should render the form for cancelling all trips of a certain direction", async () => {
		const form = renderAdminClearTripsForm(
			enUS,
			"search-results-oneWay-confirmed",
			"oneWay",
		);

		expect(form).toContain(enUS.admin.clear);
	});
});
