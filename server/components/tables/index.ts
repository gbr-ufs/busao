// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { and, eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { configuration, trips } from "../../db/schema";
import type { i18n, TripDirection, TripStatus } from "../../shared/types";
import { dateYMDToString } from "../../shared/utils";
import { renderAdminClearTripsForm, renderAdminSearchTripForm } from "../forms";
import { renderAdminTripsRows } from "./rows";

/**
 * Renders the table used to see all trips by date, direction and status.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param date - The desired date.
 * @param trip - The direction of the trips.
 * @param status - The status of the trips.
 * @param swap - Whether to swap any tables with matching ID.
 * @returns A table containing the names of all trips by date, direction and status.
 */
export function renderTripsTable(
	i18n: i18n,
	database: BunSQLiteDatabase,
	date: Date,
	trip: TripDirection,
	status: TripStatus,
	swap: boolean = true,
): string {
	const currentConfiguration = database
		.select()
		.from(configuration)
		.where(eq(configuration.id, 1))
		.get();
	const currentTrips = database
		.select()
		.from(trips)
		.where(
			and(
				eq(trips.date, dateYMDToString(date)),
				eq(trips.status, status),
				eq(trips.trip, trip),
			),
		)
		.all();
	const totalSeats =
		trip === "oneWay"
			? currentConfiguration?.oneWaySeats
			: currentConfiguration?.returnSeats;
	const capacity = `${currentTrips.length}/${totalSeats}`;
	const names = currentTrips
		.map((trip) => `<tr><td>${trip.name}</td></tr>`)
		.join("");
	const table = `<div class="table-container">
  <table id="table-${trip}" ${swap ? 'hx-swap-oob="true"' : ""}>
  <caption>${i18n.trip[trip]} [${capacity}]</caption>
  <tr>
  <th>${i18n.name}</th>
  </tr>
${names}
</table>
</div>`;

	return table;
}

/**
 * Renders the table used by the admin to see all trips by date, direction and status.
 *
 * @remarks
 *
 * The admin table has buttons for clearing specific trips and all of its associated
 * trips.
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param route - The API route for trip search.
 * @param date - The current date.
 * @param trip - The direction of the trips.
 * @param status - The status of the trips.
 * @param search - The input of the search bar associated to the table.
 * @param swap - Whether to swap any tables with matching ID.
 * @returns A table containing all trips by date, direction and status, for the admin
 * to freely manage.
 */
export function renderAdminTripsTable(
	i18n: i18n,
	database: BunSQLiteDatabase,
	route: string,
	date: Date,
	trip: TripDirection,
	status: TripStatus,
	search: string,
	swap: boolean = true,
): string {
	const targetID = `search-results-${trip}-${status}`;
	const form = renderAdminSearchTripForm(route, targetID, trip, status, search);
	const clearAllForm = renderAdminClearTripsForm(i18n, targetID, trip);
	const currentConfiguration = database
		.select()
		.from(configuration)
		.where(eq(configuration.id, 1))
		.get();
	const currentTrips = database
		.select()
		.from(trips)
		.where(
			and(
				eq(trips.date, dateYMDToString(date)),
				eq(trips.status, status),
				eq(trips.trip, trip),
			),
		)
		.all();
	const totalSeats =
		trip === "oneWay"
			? currentConfiguration?.oneWaySeats
			: currentConfiguration?.returnSeats;
	const capacity = `${currentTrips.length}/${totalSeats}`;
	const rows = renderAdminTripsRows(i18n, database, date, trip, status, search);
	const table = `<div class="table-container">
  <table id="table-${trip}" ${swap ? 'hx-swap-oob="true"' : ""}>
	<caption>${i18n.trip[trip]} [${capacity}]</caption>
	<thead>
	<tr class="search-row">
	<th>${form}</th>
	</tr>
	<tr>
	<th>${i18n.name}</th>
	<th class="action-column"></th>
	</tr>
	</thead>
	<tbody id="${targetID}">
	${rows}
	</tbody>
	<tfoot>
	<tr>
	<th>
	        ${clearAllForm}
		</th>
		</tr>
		</tfoot>
		</table>
		</div>`;

	return table;
}
