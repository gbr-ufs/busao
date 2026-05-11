// SPX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { and, eq, like } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { trips } from "../../db/schema";
import type { i18n, TripDirection, TripStatus } from "../../shared/types";
import { dateYMDToString } from "../../shared/utils";
import { renderAdminCancelTripForm } from "../forms";

/**
 * Renders the rows of the admin trip table.
 *
 * @remarks
 *
 * Each row consists of the name associated to the trip, and
 * {@link renderAdminCancelTripForm | a form to cancel the associated trip by ID}.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param date - The current date.
 * @param trip - The direction of the trips.
 * @param status - The status of the trips.
 * @param search - The current search query of the {@link "components/tables".renderAdminTripsTable | associated table}.
 * @returns The rows of an admin table.
 */
export function renderAdminTripsRows(
	i18n: i18n,
	database: BunSQLiteDatabase,
	date: Date,
	trip: TripDirection,
	status: TripStatus,
	search: string,
): string {
	const currentTrips = database
		.select()
		.from(trips)
		.where(
			and(
				eq(trips.date, dateYMDToString(date)),
				eq(trips.status, status),
				eq(trips.trip, trip),
				search ? like(trips.name, `%${search}%`) : undefined,
			),
		)
		.all();
	const rows = currentTrips
		.map(
			(trip) => `<tr>
  <td>${trip.name}</td>
  <td>
    ${renderAdminCancelTripForm(i18n, trip.id)}
  </td>
</tr>`,
		)
		.join("");

	return rows;
}
