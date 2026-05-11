// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { set_useful_sqlite_pragmas } from "../../../db/pragmas";
import { configuration } from "../../../db/schema";
import { enUS } from "../../../i18n/enUS";
import { handleRoundTrip, handleSingleTrip, handleTrips } from "./trips";

describe("/api/v1/trips", () => {
	let SQLITE: Database;
	let DATABASE: BunSQLiteDatabase;
	const TRIPS_ROUTE = "/api/v1/trips";
	const BEFORE_NINE_AM = new Date(2026, 6, 7, 8, 59);
	const NINE_AM = new Date(2026, 6, 7, 9);
	const OPENING_HOUR = 9;

	beforeEach(async () => {
		SQLITE = new Database(":memory:");

		set_useful_sqlite_pragmas(SQLITE);

		DATABASE = drizzle(SQLITE);

		migrate(DATABASE, { migrationsFolder: "drizzle" });
		DATABASE.insert(configuration)
			.values({ id: 1, oneWaySeats: 2, returnSeats: 2 })
			.run();
	});

	afterEach(async () => {
		SQLITE.close();
	});

	test("[handleSingleTrip] Should return an error message in case of an addition error", async () => {
		DATABASE.delete(configuration).where(eq(configuration.id, 1)).run();

		const formData = new FormData();

		formData.append("name", "Ana");
		formData.append("trip", "oneWay");

		const request = new Request(`http://localhost${TRIPS_ROUTE}`, {
			body: formData,
			method: "POST",
		});

		const ana = await handleSingleTrip(
			enUS,
			request,
			DATABASE,
			NINE_AM,
			"Ana",
			"oneWay",
		);
		const body = await ana.text();

		expect(body).toContain(enUS.error);
	});

	test("[handleRoundTrip] Should return an error message in case of an addition error", async () => {
		DATABASE.delete(configuration).where(eq(configuration.id, 1)).run();

		const formData = new FormData();

		formData.append("name", "Ana");
		formData.append("trip", "oneWay");

		const request = new Request(`http://localhost${TRIPS_ROUTE}`, {
			body: formData,
			method: "POST",
		});

		const ana = await handleRoundTrip(enUS, request, DATABASE, NINE_AM, "Ana");
		const body = await ana.text();

		expect(body).toContain(enUS.error);
	});

	test("[handleTrips] Should display 'too early' message in case the user got to the page too early", async () => {
		const formData = new FormData();

		formData.append("name", "Ana");
		formData.append("trip", "oneWay");

		const request = new Request(`http://localhost${TRIPS_ROUTE}`, {
			body: formData,
			method: "POST",
		});
		const ana = await handleTrips(
			enUS,
			request,
			DATABASE,
			BEFORE_NINE_AM,
			OPENING_HOUR,
		);
		const body = await ana.text();

		expect(body).toContain(enUS.tooEarly);
	});

	test("[handleTrips] Should return an error message in case of an incomplete form", async () => {
		const formData = new FormData();

		formData.append("name", "Ana");

		const request = new Request(`http://localhost${TRIPS_ROUTE}`, {
			body: formData,
			method: "POST",
		});
		const ana = await handleTrips(
			enUS,
			request,
			DATABASE,
			NINE_AM,
			OPENING_HOUR,
		);
		const body = await ana.text();

		expect(body).toContain(enUS.errors.undefinedFormData);
	});

	test("[handleTrips] Should return a 'name too long' error message in case the name exceeds 64 characters", async () => {
		const formData = new FormData();

		formData.append(
			"name",
			"1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz",
		);
		formData.append("trip", "oneWay");

		const request = new Request("http://locahost/trips", {
			body: formData,
			method: "POST",
		});
		const ana = await handleTrips(
			enUS,
			request,
			DATABASE,
			NINE_AM,
			OPENING_HOUR,
		);
		const body = await ana.text();

		expect(body).toContain(enUS.errors.formEntryLong);
	});
});
