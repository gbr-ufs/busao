// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { renderTripsTable } from "../components/tables";
import { set_useful_sqlite_pragmas } from "../db/pragmas";
import { configuration } from "../db/schema";
import { enUS } from "../i18n/enUS";
import { handleTrips } from "./api/v1/trips";
import { renderWaitlistPage } from "./waitlist";

describe("/waitlist", () => {
	let SQLITE: Database;
	let DATABASE: BunSQLiteDatabase;
	const BEFORE_NINE_AM = new Date(2026, 6, 7, 8, 59);
	const NINE_AM = new Date(2026, 6, 7, 9);

	const OPENING_HOUR = 9;

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

	test("[renderWaitlistPage] Should display 'too early' message in case the user got to the page too early", async () => {
		const response = renderWaitlistPage(
			enUS,
			DATABASE,
			BEFORE_NINE_AM,
			OPENING_HOUR,
		);
		const body = await response.text();

		expect(body).toContain(enUS.tooEarly);
	});

	test("[renderWaitlistPage] Should render the waitlist tables with a roundtrip on the page", async () => {
		const anaFormData = new FormData();

		anaFormData.append("name", "Ana");
		anaFormData.append("trip", "roundTrip");

		const anaRequest = new Request(`http://localhost/trips`, {
			body: anaFormData,
			method: "POST",
		});

		await handleTrips(enUS, anaRequest, DATABASE, NINE_AM, OPENING_HOUR);

		const biaFormData = new FormData();

		biaFormData.append("name", "Bia");
		biaFormData.append("trip", "oneWay");

		const biaRequest = new Request(`http://localhost/trips`, {
			body: biaFormData,
			method: "POST",
		});

		await handleTrips(enUS, biaRequest, DATABASE, NINE_AM, OPENING_HOUR);

		const carlaFormData = new FormData();

		carlaFormData.append("name", "Carla");
		carlaFormData.append("trip", "return");

		const carlaRequest = new Request(`http://localhost/trips`, {
			body: carlaFormData,
			method: "POST",
		});

		await handleTrips(enUS, carlaRequest, DATABASE, NINE_AM, OPENING_HOUR);

		const response = renderWaitlistPage(enUS, DATABASE, NINE_AM, OPENING_HOUR);
		const body = await response.text();
		const oneWayTable = renderTripsTable(
			enUS,
			DATABASE,
			NINE_AM,
			"oneWay",
			"waitlist",
			false,
		);
		const returnTable = renderTripsTable(
			enUS,
			DATABASE,
			NINE_AM,
			"return",
			"waitlist",
			false,
		);

		expect(body).toContain(oneWayTable);
		expect(body).toContain(returnTable);
		expect(body).toContain("Bia");
		expect(body).toContain("Carla");
	});
});
