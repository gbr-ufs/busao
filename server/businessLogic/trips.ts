// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { and, count, desc, eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { configuration, trips } from "../db/schema";
import {
	DatabaseSelectionError,
	DatabaseUpdateError,
	IDNotFoundError,
	TripTokenNotFoundError,
} from "../shared/errors";
import type { PassengerInput, TripDirection } from "../shared/types";

/**
 * Schedule trips based on provided information.
 *
 * @remarks
 *
 * `passengerInputs` is a list to support roundtrips.
 *
 * If the seat count for the direction of the trip is at capacity, the trip
 * is added to the waitlist and put on hold.
 *
 * @param database - The project's database.
 * @param passengerInputs - Passenger information necessary to register a trip.
 * @returns The trips as added to the database.
 * @throws {@link "shared/errors".DatabaseSelectionError | DatabaseSelectionError}
 * Thrown in case the "configuration" table has no rows.
 */
export async function addTrips(
	database: BunSQLiteDatabase,
	passengerInputs: PassengerInput[],
): Promise<(typeof trips.$inferSelect)[]> {
	return database.transaction(
		async (tx) => {
			const resultList = [];
			const currentConfiguration = tx
				.select()
				.from(configuration)
				.where(eq(configuration.id, 1))
				.get();

			// Would happen in case the "configuration" table has no rows.
			if (!currentConfiguration) {
				throw new DatabaseSelectionError("configuration");
			}

			for (const input of passengerInputs) {
				const maxSeats =
					input.trip === "oneWay"
						? currentConfiguration.oneWaySeats
						: currentConfiguration.returnSeats;
				const confirmed = tx
					.select({ count: count() })
					.from(trips)
					.where(
						and(
							eq(trips.date, input.date),
							eq(trips.status, "confirmed"),
							eq(trips.trip, input.trip),
						),
					)
					// Impossible to be undefined due to the call to count.
					.get()!;

				const status = confirmed.count >= maxSeats ? "waitlist" : "confirmed";

				const [inserted] = await tx
					.insert(trips)
					.values({
						name: input.name,
						trip: input.trip,
						date: input.date,
						status: status,
					})
					.returning();

				// Impossible to be undefined because SQLite would
				// throw in a insertion failure.
				resultList.push(inserted!);
			}

			return resultList;
		},
		{ behavior: "immediate" },
	);
}

/**
 * Cancels a trip via token.
 *
 * @remarks
 *
 * As a side-effect, if the trip was confirmed, it increases the priority
 * of the oldest entry in the waitlist.
 *
 * @param database - The project's database.
 * @param token - The token of the trip.
 * @returns The trip as updated in the database.
 * @throws {@link "shared/errors".TripTokenNotFoundError | TripTokenNotFoundError}
 * Thrown in case the token wasn't found in the database.
 * @throws {@link "shared/errors".DatabaseUpdateError | DatabaseUpdateError}
 * Thrown in case something went wrong while cancelling the trip.
 */
export async function cancelTrip(
	database: BunSQLiteDatabase,
	token: string,
): Promise<typeof trips.$inferSelect> {
	return database.transaction(
		async (tx) => {
			const trip = tx
				.select()
				.from(trips)
				.where(eq(trips.tripToken, token))
				.get();

			if (!trip) {
				throw new TripTokenNotFoundError(token);
			}

			if (trip.status === "cancelled") {
				return trip;
			}

			const [cancelledTrip] = await tx
				.update(trips)
				.set({ status: "cancelled" })
				.where(eq(trips.id, trip.id))
				.returning();

			if (!cancelledTrip) {
				throw new DatabaseUpdateError("trips");
			}

			if (trip.status === "confirmed") {
				const oldestOnWishlist = tx
					.select()
					.from(trips)
					.where(
						and(
							eq(trips.date, trip.date),
							eq(trips.status, "waitlist"),
							eq(trips.trip, trip.trip),
						),
					)
					.orderBy(trips.id, trips.name)
					.get();

				if (oldestOnWishlist) {
					tx.update(trips)
						.set({ status: "confirmed" })
						.where(eq(trips.id, oldestOnWishlist.id))
						.run();
				}
			}

			return cancelledTrip;
		},
		{ behavior: "immediate" },
	);
}

/**
 * Cancels all trips of a certain direction.
 *
 * @param database - The project's database.
 * @param date - The date of the trips in YYYY-MM-DD format..
 * @param trip - The direction of the trips.
 * @returns The trips as updated in the database.
 */
export async function clearTrips(
	database: BunSQLiteDatabase,
	date: string,
	trip: TripDirection,
): Promise<(typeof trips.$inferSelect)[]> {
	const clearedTrips = database
		.update(trips)
		.set({ status: "cancelled" })
		.where(and(eq(trips.date, date), eq(trips.trip, trip)))
		.returning()
		.all();

	return clearedTrips;
}

/**
 * Cancels a trip via ID.
 *
 *
 * @remarks
 *
 * As a side-effect, if the trip was confirmed, it increases the priority
 * of the oldest entry in the waitlist.
 *
 * @param database - The project's database.
 * @param id - The ID of the trip.
 * @returns The trip as updated in the database.
 */
export async function cancelTripByID(
	database: BunSQLiteDatabase,
	id: string,
): Promise<typeof trips.$inferSelect> {
	return database.transaction(
		async (tx) => {
			const trip = tx.select().from(trips).where(eq(trips.id, id)).get();

			if (!trip) {
				throw new IDNotFoundError(id);
			}

			if (trip.status === "cancelled") {
				return trip;
			}

			const [result] = await tx
				.update(trips)
				.set({ status: "cancelled" })
				.where(eq(trips.id, trip.id))
				.returning();

			if (!result) {
				throw new DatabaseUpdateError("trips");
			}

			if (trip.status === "confirmed") {
				const oldestOnWishlist = tx
					.select()
					.from(trips)
					.where(
						and(
							eq(trips.date, trip.date),
							eq(trips.status, "waitlist"),
							eq(trips.trip, trip.trip),
						),
					)
					.orderBy(trips.id, trips.name)
					.get();

				if (oldestOnWishlist) {
					tx.update(trips)
						.set({ status: "confirmed" })
						.where(eq(trips.id, oldestOnWishlist.id))
						.run();
				}
			}

			return result;
		},
		{ behavior: "immediate" },
	);
}

/**
 * Updates the seat count of a trip tale.
 *
 * @remarks
 *
 * If the number goes up, waitlist candidates are promoted
 * from oldest to newest.
 *
 * If the number goes down, confirmed candidates are demoted
 * from newest to oldest.
 *
 * Name is the tie-breaker criteria.
 *
 * @param database - The project's database.
 * @param trip - The direction associated with the table that will be updated.
 * @param newTotalSeats - How many seats will the table have now.
 * @param date - The date of the trips in YYYY-MM-DD format..
 * @returns The configuration as updated in the database.
 * @throws {@link "shared/errors".DatabaseSelectionError | DatabaseSelectionError}
 * Thrown in case the "configuration" table has no rows.
 */
export async function updateSeatCount(
	database: BunSQLiteDatabase,
	trip: TripDirection,
	newTotalSeats: number,
	date: string,
): Promise<typeof configuration.$inferSelect> {
	return database.transaction(
		async (tx) => {
			const currentConfiguration = tx
				.select()
				.from(configuration)
				.where(eq(configuration.id, 1))
				.get();

			// Would happen in case the "configuration" table has no rows.
			if (!currentConfiguration) {
				throw new DatabaseSelectionError("configuration");
			}

			const totalSeats =
				trip === "oneWay"
					? currentConfiguration.oneWaySeats
					: currentConfiguration.returnSeats;

			const diff = newTotalSeats - totalSeats;

			if (newTotalSeats > totalSeats) {
				tx.update(trips)
					.set({ status: "confirmed" })
					.where(
						and(
							eq(trips.date, date),
							eq(trips.status, "waitlist"),
							eq(trips.trip, trip),
						),
					)
					.orderBy(trips.id, trips.name)
					.limit(diff)
					.run();
			}

			if (newTotalSeats < totalSeats) {
				tx.update(trips)
					.set({ status: "waitlist" })
					.where(
						and(
							eq(trips.date, date),
							eq(trips.status, "confirmed"),
							eq(trips.trip, trip),
						),
					)
					.orderBy(desc(trips.id), desc(trips.name))
					.limit(Math.abs(diff))
					.run();
			}

			const setValue =
				trip === "oneWay"
					? { oneWaySeats: newTotalSeats }
					: { returnSeats: newTotalSeats };
			const [updatedConfiguration] = await tx
				.update(configuration)
				.set(setValue)
				.where(eq(configuration.id, 1))
				.returning();

			return updatedConfiguration!;
		},
		{ behavior: "immediate" },
	);
}
