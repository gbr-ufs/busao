// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { cancelTripByID } from "../../businessLogic/trips";
import { isValidSession } from "../../db/auth";
import {
	progressiveDelete,
	progressiveRespond,
} from "../../responses/progressiveEnhancement";
import type { i18n } from "../../shared/types";
import { renderUnauthorizedPage } from "../../views/status/unauthorized";

/**
 * Handles the cancellation of a single trip by ID.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param id - The ID of the trip.
 * @returns
 * - An {@link renderUnauthorizedPage | "Unauthorized"} page in case the
 * admin is unauthenticated.
 * - An error message in case something goes wrong with the {@link cancelTripByID | cancellation process}.
 * - A request to remove the table row associated with the ID.
 */
export async function handleAdminCancel(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	id: string,
): Promise<Response> {
	if (!isValidSession(request, database)) {
		return renderUnauthorizedPage(i18n);
	}

	// We only catch {@link DatabaseUpdateError} here because it's impossible
	// for the ID to not be found.
	try {
		await cancelTripByID(database, id);

		return progressiveDelete(request, "/admin");
	} catch (_DatabaseUpdateError) {
		const body = `<p>${i18n.error}</p>`;

		return progressiveRespond(i18n, request, body);
	}
}
