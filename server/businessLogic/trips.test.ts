// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { set_useful_sqlite_pragmas } from "../db/pragmas";
import { configuration, trips } from "../db/schema";
import {
	DatabaseSelectionError,
	DatabaseUpdateError,
	IDNotFoundError,
	TripTokenNotFoundError,
} from "../shared/errors";
import { dateYMDToString } from "../shared/utils";
import {
	addTrips,
	cancelTrip,
	cancelTripByID,
	clearTrips,
	updateSeatCount,
} from "./trips";

describe("Trips Management", () => {
	let SQLITE: Database;
	let DATABASE: BunSQLiteDatabase;
	const TODAY = dateYMDToString(new Date());

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

	test("[addTrips] Should throw an error due to 'configuration' being somehow 'undefined'", async () => {
		DATABASE.delete(configuration).where(eq(configuration.id, 1)).run();

		expect(
			addTrips(DATABASE, [
				{
					date: TODAY,
					name: "Ana",
					trip: "oneWay",
				},
			]),
		).rejects.toThrow(DatabaseSelectionError);
	});

	test("[addTrips] Should add 2 trips as 'confirmed' and 1 as 'waitlist'", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		expect(ana?.status).toBe("confirmed");

		const [bia] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Bia",
				trip: "oneWay",
			},
		]);

		expect(bia?.status).toBe("confirmed");

		const [carla] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Carla",
				trip: "oneWay",
			},
		]);

		expect(carla?.status).toBe("waitlist");
	});

	test("[addTrips] Should add a roundtrip", async () => {
		const ana = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
			{
				date: TODAY,
				name: "Ana",
				trip: "return",
			},
		]);

		expect(ana[0]?.trip).toBe("oneWay");
		expect(ana[0]?.status).toBe("confirmed");
		expect(ana[1]?.trip).toBe("return");
		expect(ana[1]?.status).toBe("confirmed");
	});

	test("[cancelTrip] Should throw an error in case cancelling somehow returns 'undefined'", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				name: "Ana",
				trip: "oneWay",
				date: TODAY,
			},
		]);

		if (!ana) {
			throw new DatabaseUpdateError("trips");
		}

		DATABASE.run(
			"CREATE TRIGGER trips_ignore_cancel_update BEFORE UPDATE OF status ON trips WHEN NEW.status = 'cancelled' BEGIN SELECT RAISE(IGNORE); END;",
		);

		expect(cancelTrip(DATABASE, ana.tripToken)).rejects.toThrow(
			DatabaseUpdateError,
		);
	});

	test("[cancelTrip] Should throw an error due to an invalid trip token", async () => {
		expect(
			cancelTrip(DATABASE, "f6821db7-51f0-4515-b2d6-f7a24f89eea5"),
		).rejects.toThrow(TripTokenNotFoundError);
	});

	test("[cancelTrip] Should do nothing in case the trip is already cancelled", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		if (!ana) {
			throw new DatabaseUpdateError("trips");
		}

		const cancelledOnceAna = await cancelTrip(DATABASE, ana.tripToken);
		const cancelledTwiceAna = await cancelTrip(DATABASE, ana.tripToken);

		expect(cancelledOnceAna?.status).toBe("cancelled");
		expect(cancelledTwiceAna?.status).toBe("cancelled");
	});

	test("[cancelTrip] Should cancel and promote the oldest one on the waitlist", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		if (!ana) {
			throw new DatabaseUpdateError("trips");
		}

		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Bia",
				trip: "oneWay",
			},
		]);

		const [carla] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Carla",
				trip: "oneWay",
			},
		]);

		if (!carla) {
			throw new DatabaseUpdateError("trips");
		}

		const updatedAna = await cancelTrip(DATABASE, ana.tripToken);

		const updatedCarla = DATABASE.select()
			.from(trips)
			.where(eq(trips.id, carla.id))
			.get();

		expect(carla.status).toBe("waitlist");
		expect(updatedAna?.status).toBe("cancelled");
		expect(updatedCarla?.status).toBe("confirmed");
	});

	test("[clearTrips] Should cancel all one-way trips", async () => {
		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);
		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Bia",
				trip: "oneWay",
			},
		]);
		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Carla",
				trip: "oneWay",
			},
		]);

		const [dani] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Daniele",
				trip: "return",
			},
		]);

		if (!dani) {
			throw new DatabaseUpdateError("trips");
		}

		const clearedTrips = await clearTrips(DATABASE, TODAY, "oneWay");

		expect(clearedTrips).toHaveLength(3);

		for (const clearedTrip of clearedTrips) {
			expect(clearedTrip.status).toBe("cancelled");
		}

		const updatedDani = DATABASE.select()
			.from(trips)
			.where(eq(trips.id, dani.id))
			.get();

		expect(updatedDani?.status).toBe("confirmed");
	});

	test("[cancelTripByID] Should throw an error in case cancelling somehow returns 'undefined'", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		if (!ana) {
			throw new DatabaseUpdateError("trips");
		}

		DATABASE.run(
			"CREATE TRIGGER trips_ignore_cancel_update BEFORE UPDATE OF status ON trips WHEN NEW.status = 'cancelled' BEGIN SELECT RAISE(IGNORE); END;",
		);

		expect(cancelTripByID(DATABASE, ana.id)).rejects.toThrow(
			DatabaseUpdateError,
		);
	});

	test("[cancelTripByID] Should throw an error due to an invalid ID", async () => {
		expect(
			cancelTripByID(DATABASE, "f6821db7-51f0-4515-b2d6-f7a24f89eea5"),
		).rejects.toThrow(IDNotFoundError);
	});

	test("[cancelTripByID] Should do nothing in case the trip is already cancelled", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		if (!ana) {
			throw new DatabaseUpdateError("trips");
		}

		await cancelTripByID(DATABASE, ana.id);

		const cancelledTwiceAna = await cancelTripByID(DATABASE, ana.id);

		expect(cancelledTwiceAna.status).toBe("cancelled");
	});

	test("[cancelTripByID] Should cancel and promote the oldest one on the waitlist", async () => {
		const [ana] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		if (!ana) {
			throw new DatabaseUpdateError("trips");
		}

		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Bia",
				trip: "oneWay",
			},
		]);

		const [carla] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Carla",
				trip: "oneWay",
			},
		]);

		if (!carla) {
			throw new DatabaseUpdateError("trips");
		}

		const updatedAna = await cancelTripByID(DATABASE, ana.id);

		const updatedCarla = DATABASE.select()
			.from(trips)
			.where(eq(trips.id, carla.id))
			.get();

		expect(updatedAna.status).toBe("cancelled");
		expect(updatedCarla?.status).toBe("confirmed");
	});

	test("[updateSeatCount] Should throw an error due to 'configuration' being somehow 'undefined'", async () => {
		DATABASE.delete(configuration).where(eq(configuration.id, 1)).run();

		expect(updateSeatCount(DATABASE, "oneWay", 1, TODAY)).rejects.toThrow(
			DatabaseSelectionError,
		);
	});

	test("[updateSeatCount] Should increase the number of seats and promote trips from the waitlist", async () => {
		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);
		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Bia",
				trip: "oneWay",
			},
		]);

		const [carla] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Carla",
				trip: "oneWay",
			},
		]);

		if (!carla) {
			throw new DatabaseUpdateError("trips");
		}

		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Daniele",
				trip: "oneWay",
			},
		]);

		const updatedConfiguration = await updateSeatCount(
			DATABASE,
			"oneWay",
			3,
			TODAY,
		);

		const updatedCarla = DATABASE.select()
			.from(trips)
			.where(eq(trips.id, carla.id))
			.get();

		expect(updatedConfiguration.oneWaySeats).toBe(3);
		expect(updatedCarla?.status).toBe("confirmed");
	});

	test("[updateSeatCount] Should decrease the number of seats and demote the most recent trip", async () => {
		await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Ana",
				trip: "oneWay",
			},
		]);

		const [bia] = await addTrips(DATABASE, [
			{
				date: TODAY,
				name: "Bia",
				trip: "oneWay",
			},
		]);

		if (!bia) {
			throw new DatabaseUpdateError("trips");
		}

		const updatedConfiguration = await updateSeatCount(
			DATABASE,
			"oneWay",
			1,
			TODAY,
		);

		const updatedBia = DATABASE.select()
			.from(trips)
			.where(eq(trips.id, bia.id))
			.get();

		expect(updatedConfiguration.oneWaySeats).toBe(1);
		expect(updatedBia?.status).toBe("waitlist");
	});
});
