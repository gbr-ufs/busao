// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { set_useful_sqlite_pragmas } from "../db/pragmas";
import { configuration, trips } from "../db/schema";
import { enUS } from "../i18n/enUS";
import { dateYMDToString } from "../shared/utils";
import { handleCancel, renderCancelPage } from "./cancel";

describe("/cancel", () => {
	let SQLITE: Database;
	let DATABASE: BunSQLiteDatabase;

	const NINE_AM = new Date(2026, 6, 7, 9);

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

	test("[renderCancelPage] Should display 'already cancelled' message in case  the trip was already cancelled", async () => {
		const ana = DATABASE.insert(trips)
			.values({
				date: dateYMDToString(NINE_AM),
				name: "Ana",
				status: "cancelled",
				trip: "oneWay",
			})
			.returning()
			.get();
		const response = renderCancelPage(enUS, DATABASE, ana.tripToken);
		const body = await response.text();

		expect(body).toContain(enUS.cancel.alreadyCancelled);
	});

	test("[renderCancelPage] Should render the cancel page with the prompt in case the trip wasn't cancelled", async () => {
		const ana = DATABASE.insert(trips)
			.values({
				date: dateYMDToString(NINE_AM),
				name: "Ana",
				trip: "oneWay",
			})
			.returning()
			.get();
		const response = renderCancelPage(enUS, DATABASE, ana.tripToken);
		const body = await response.text();

		expect(body).toContain(enUS.cancel.question);
	});

	test("[handleCancel] Should return an error message in case the token wasn't found", async () => {
		const request = new Request("http://localhost/trips");
		const cancelledTrip = await handleCancel(enUS, request, DATABASE, "1");
		const body = await cancelledTrip.text();

		expect(body).toContain(enUS.errors.tripTokenNotFound);
	});

	test("[handleCancel] Should return an error message in case of a cancellation error", async () => {
		DATABASE.run(
			"CREATE TRIGGER trips_ignore_cancel_update BEFORE UPDATE OF status ON trips WHEN NEW.status = 'cancelled' BEGIN SELECT RAISE(IGNORE); END;",
		);

		const ana = DATABASE.insert(trips)
			.values({
				date: dateYMDToString(NINE_AM),
				name: "Ana",
				trip: "oneWay",
			})
			.returning()
			.get();
		const request = new Request("http://localhost/trips");
		const cancelledAna = await handleCancel(
			enUS,
			request,
			DATABASE,
			ana.tripToken,
		);
		const body = await cancelledAna.text();

		expect(body).toContain(enUS.error);
	});

	test("[handleCancel] Should cancel a trip", async () => {
		const ana = DATABASE.insert(trips)
			.values({
				date: dateYMDToString(NINE_AM),
				name: "Ana",
				trip: "oneWay",
			})
			.returning()
			.get();
		const request = new Request("http://localhost");
		const cancelledAna = await handleCancel(
			enUS,
			request,
			DATABASE,
			ana.tripToken,
		);

		expect(cancelledAna.headers.get("location")).toContain("success");
	});
});
