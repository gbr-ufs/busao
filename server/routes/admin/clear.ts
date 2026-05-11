// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { clearTrips } from "../../businessLogic/trips";
import { isValidSession } from "../../db/auth";
import { progressiveDelete } from "../../responses/progressiveEnhancement";
import type { i18n, TripDirection } from "../../shared/types";
import { dateYMDToString } from "../../shared/utils";
import { renderUnauthorizedPage } from "../../views/status/unauthorized";

/**
 * Handles the cancellation of all trips of a certain direction.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param date - The current date.
 * @param trip - The trip direction.
 * @returns A request to remove all trips on {@link "components/tables".renderAdminTripsTable | the tables}
 * associated with the direction in case the admin is properly authenticated.
 * Otherwise, returns an {@link "views/status/unauthorized".renderUnauthorizedPage | "Unauthorized"} page.
 */
export async function handleAdminClear(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	date: Date,
	trip: TripDirection,
): Promise<Response> {
	if (!isValidSession(request, database)) {
		return renderUnauthorizedPage(i18n);
	}

	await clearTrips(database, dateYMDToString(date), trip);

	return progressiveDelete(request, "/admin");
}
