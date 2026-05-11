// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { cancelTrip } from "../businessLogic/trips";
import { renderCancellationForm } from "../components/forms";
import { trips } from "../db/schema";
import { htmlResponse } from "../responses";
import { progressiveRespond } from "../responses/progressiveEnhancement";
import { TripTokenNotFoundError } from "../shared/errors";
import type { i18n } from "../shared/types";
import { baseLayout } from "../views/layout";

/**
 * Builds the "Cancel" page with internationalisation.
 *
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param tripToken - The token of the trip.
 * @returns A semantic HTML page with {@link renderCancellationForm | a form} to cancel
 * the trip, in case the trip wasn't cancelled. Otherwise, returns a page letting
 * the user know so.
 */
export function renderCancelPage(
	i18n: i18n,
	database: BunSQLiteDatabase,
	tripToken: string,
): Response {
	const [targetTrip] = database
		.select()
		.from(trips)
		.where(eq(trips.tripToken, tripToken))
		.all();

	if (targetTrip?.status === "cancelled") {
		const body = baseLayout(i18n, `<p>${i18n.cancel.alreadyCancelled}</p>`);

		return htmlResponse(body);
	}

	const form = renderCancellationForm(i18n, tripToken);
	const body = baseLayout(i18n, form);

	return htmlResponse(body);
}

/**
 * Cancels a trip by token.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param tripToken - The token of the trip.
 * @returns A response redirecting the user to the {@link "routes/success".renderSuccessPage | "Success"} page
 * in case nothing went wrong with the {@link cancelTrip | cancellation process}. Otherwise,
 * returns a message letting the user know.
 */
export async function handleCancel(
	i18n: i18n,
	request: Request,
	database: BunSQLiteDatabase,
	tripToken: string,
): Promise<Response> {
	try {
		const cancelledTrip = await cancelTrip(database, tripToken);

		return Response.redirect(`/success?${cancelledTrip?.trip}=${tripToken}`);
	} catch (error: unknown) {
		if (error instanceof TripTokenNotFoundError) {
			const body = `<p>${i18n.errors.tripTokenNotFound}</p>`;

			return progressiveRespond(i18n, request, body);
		}

		const body = `<p>${i18n.error}</p>`;

		return progressiveRespond(i18n, request, body);
	}
}
