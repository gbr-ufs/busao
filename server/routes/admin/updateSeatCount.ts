// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { updateSeatCount } from "../../businessLogic/trips";
import { renderUpdateSeatCountForm } from "../../components/forms";
import { renderAdminTripsTable } from "../../components/tables";
import { isValidSession } from "../../db/auth";
import {
	progressiveRedirect,
	progressiveRespond,
} from "../../responses/progressiveEnhancement";
import type { i18n, TripDirection } from "../../shared/types";
import { dateYMDToString } from "../../shared/utils";
import { renderUnauthorizedPage } from "../../views/status/unauthorized";

/**
 * Updates the total of seats available.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param date - The current date.
 * @param route - The API route for user search in {@link renderAdminTripsTable | the tables}.
 * @param maxSeats - The maximum amount of seats of the vehicle.
 * @returns A request to update the seat count of the desired {@link TripDirection | direction} in
 * case the admin is properly authenticated. Otherwise, returns an
 * {@link renderUnauthorizedPage | "Unauthorized"} page.
 */
export async function handleAdminUpdateSeatCount(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	date: Date,
	route: string,
	maxSeats: number,
): Promise<Response> {
	if (!isValidSession(request, database)) {
		return renderUnauthorizedPage(i18n);
	}

	const formData = await request.formData();
	const trip = formData.get("trip") as TripDirection;
	const seatCount = parseInt(formData.get("seatCount") as string, 10);

	if (seatCount > maxSeats) {
		const form = renderUpdateSeatCountForm(
			i18n,
			database,
			trip,
			maxSeats,
			i18n.errors.formEntryLong,
		);

		return progressiveRespond(i18n, request, form, 400);
	}

	try {
		await updateSeatCount(database, trip, seatCount, dateYMDToString(date));

		const form = renderUpdateSeatCountForm(i18n, database, trip, maxSeats);
		const oneWayTable = renderAdminTripsTable(
			i18n,
			database,
			route,
			date,
			"oneWay",
			"confirmed",
			"",
		);
		const returnTable = renderAdminTripsTable(
			i18n,
			database,
			route,
			date,
			"return",
			"confirmed",
			"",
		);
		const body = form + oneWayTable + returnTable;

		return progressiveRedirect(request, body, "/admin");
	} catch (_DatabaseSelectionError) {
		const form = renderUpdateSeatCountForm(
			i18n,
			database,
			trip,
			maxSeats,
			i18n.error,
		);

		return progressiveRespond(i18n, request, form, 400);
	}
}
