// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { renderTripsForm } from "../components/forms";
import { renderTripsTable } from "../components/tables";
import { configuration } from "../db/schema";
import { enUS } from "../i18n/enUS";
import { handleTrips } from "./api/v1/trips";
import { renderIndexPage } from "./index";

describe("/", () => {
	let SQLITE: Database;
	let DATABASE: BunSQLiteDatabase;
	const BEFORE_NINE_AM = new Date(2026, 6, 7, 8, 59);
	const NINE_AM = new Date(2026, 6, 7, 9);
	const OPENING_HOUR = 9;

	beforeEach(async () => {
		SQLITE = new Database(":memory:");
		SQLITE.run("PRAGMA journal_mode = WAL;");
		SQLITE.run("PRAGMA synchronous=NORMAL;");
		DATABASE = drizzle(SQLITE);

		migrate(DATABASE, { migrationsFolder: "drizzle" });
		DATABASE.insert(configuration)
			.values({ id: 1, oneWaySeats: 2, returnSeats: 2 })
			.run();
	});

	afterEach(async () => {
		SQLITE.close();
	});

	test("[renderIndexPage] Should display 'too early' message in case the user got to the page too early", async () => {
		const response = renderIndexPage(
			enUS,
			DATABASE,
			"/trips",
			BEFORE_NINE_AM,
			OPENING_HOUR,
		);
		const body = await response.text();

		expect(body).toContain(enUS.tooEarly);
	});

	test("[renderIndexPage] Should render the form and trip tables with a roundtrip on the page", async () => {
		const formData = new FormData();

		formData.append("name", "Ana");
		formData.append("trip", "roundTrip");

		const tripsRequest = new Request(`http://localhost/trips`, {
			body: formData,
			method: "POST",
		});

		await handleTrips(enUS, tripsRequest, DATABASE, NINE_AM, OPENING_HOUR);

		const indexResponse = renderIndexPage(
			enUS,
			DATABASE,
			"/trips",
			NINE_AM,
			OPENING_HOUR,
		);
		const body = await indexResponse.text();
		const form = renderTripsForm(enUS, "/trips");
		const oneWayTable = renderTripsTable(
			enUS,
			DATABASE,
			NINE_AM,
			"oneWay",
			"confirmed",
			false,
		);
		const returnTable = renderTripsTable(
			enUS,
			DATABASE,
			NINE_AM,
			"return",
			"confirmed",
			false,
		);

		expect(body).toContain(form);
		expect(body).toContain(oneWayTable);
		expect(body).toContain(returnTable);
	});
});
