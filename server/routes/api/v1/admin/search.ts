// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { renderAdminTripsRows } from "../../../../components/tables/rows";
import { isValidSession } from "../../../../db/auth";
import { progressiveRedirect } from "../../../../responses/progressiveEnhancement";
import type { i18n, TripDirection, TripStatus } from "../../../../shared/types";
import { renderUnauthorizedPage } from "../../../../views/status/unauthorized";

/**
 * Searches the database for trips matching the search parameters (`search`, `status`, `trip`).
 *
 * @remarks
 *
 * If the admin is unauthenticated, an {@link renderUnauthorizedPage | "Unauthorized"} page
 * is shown.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param date - The date the trip was registered in.
 * @returns {@link "components/tables/rows".renderAdminTripsRows | rows} that are likely matches to the search
 * parameter in case the admin is authenticated. Otherwise, an {@link renderUnauthorizedPage | "Unauthorized"}
 * page.
 */
export async function handleAdminSearch(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	date: Date,
): Promise<Response> {
	if (!isValidSession(request, database)) {
		return renderUnauthorizedPage(i18n);
	}

	const url = new URL(request.url);
	const search = url.searchParams.get("search") || "";
	const status = url.searchParams.get("status") as TripStatus;
	const trip = url.searchParams.get("trip") as TripDirection;

	const rows = renderAdminTripsRows(i18n, database, date, trip, status, search);

	return progressiveRedirect(request, rows, `/admin${url.search}`);
}
