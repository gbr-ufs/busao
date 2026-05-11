// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { escapeHTML } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { addTrips } from "../../../businessLogic/trips";
import { isFormEntryLong, renderTripsForm } from "../../../components/forms";
import { progressiveRespond } from "../../../responses/progressiveEnhancement";
import type { i18n, TripDirection } from "../../../shared/types";
import { dateYMDToString } from "../../../shared/utils";
import { renderErrorParagraph } from "../../../components/paragraphs";

const ROUTE = "/api/v1/trips";

/**
 * {@link addTrips | Adds} a single trip to a determined direction.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param date - The date the trip was registered in.
 * @param name - The name associated to the trip.
 * @param trip - The direction of the trip.
 * @returns A response redirecting the user to the {@link "routes/success".renderSuccessPage | "Success"} page
 * in case nothing went wrong with the {@link addTrips | addition}. Otherwise, returns a
 * message letting the user know, and recreates the form for the user to try again.
 */
export async function handleSingleTrip(
	i18n: i18n,
	request: Request,
	database: BunSQLiteDatabase,
	date: Date,
	name: string,
	trip: TripDirection,
): Promise<Response> {
	try {
		const [addedTrip] = await addTrips(database, [
			{ date: dateYMDToString(date), name: name, trip: trip },
		]);

		return Response.redirect(
			`/success?${addedTrip?.trip}=${addedTrip?.tripToken}`,
		);
	} catch (_DatabaseError) {
		const form = renderTripsForm(i18n, ROUTE, i18n.error);

		return progressiveRespond(i18n, request, form, 400);
	}
}

/**
 * {@link addTrips | Adds} a roundtrip.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param date - The date the trip was registered in.
 * @param name - The name associated to the trip.
 * @returns A response redirecting the user to the {@link "routes/success".renderSuccessPage | "Success"} page
 * in case nothing went wrong with the {@link addTrips | additions}. Otherwise, returns a
 * message letting the user know, and recreates the form for the user to try again.
 */
export async function handleRoundTrip(
	i18n: i18n,
	request: Request,
	database: BunSQLiteDatabase,
	date: Date,
	name: string,
): Promise<Response> {
	try {
		const addedTrips = await addTrips(database, [
			{ date: dateYMDToString(date), name: name, trip: "oneWay" },
			{ date: dateYMDToString(date), name: name, trip: "return" },
		]);

		return Response.redirect(
			`/success?${addedTrips.flatMap((trip) => `${trip.trip}=${trip.tripToken}`).join("&")}`,
		);
	} catch (_DatabaseError) {
		const form = renderTripsForm(i18n, ROUTE, i18n.error);

		return progressiveRespond(i18n, request, form, 400);
	}
}

/**
 * {@link addTrips | Adds} a trip regardless of direction.
 *
 * @remarks
 *
 * If the user reaches the page before the opening hour, a {@link "views/status/unauthorized".renderTooEarlyPage | "Too Early"} page
 * is shown.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param date - The date the trip was registered in.
 * @param openingHour - The hour the website actually becomes available.
 * @returns
 * - A {@link "views/status/unauthorized".renderTooEarlyPage | "Too Early"} page in case the user got to the
 * page before the right time.
 * - An error message in case any information in the form was missing.
 * - An error message in case the submitted name exceeded the limit.
 * - A response redirecting the user to the {@link "routes/success".renderSuccessPage | "Success"} page
 * in case nothing went wrong with the {@link addTrips | addition(s)}. Otherwise, returns
 * a message letting the user know, and recreates the form for the user to try again.
 */
export async function handleTrips(
	i18n: i18n,
	request: Request,
	database: BunSQLiteDatabase,
	date: Date,
	openingHour: number,
): Promise<Response> {
	if (date.getHours() < openingHour) {
		const tooEarlyParagraph = renderErrorParagraph(i18n.tooEarly);

		return progressiveRespond(i18n, request, tooEarlyParagraph, 401);
	}

	const formData = await request.formData();
	const name = escapeHTML(formData.get("name") || "");
	const trip = formData.get("trip") as TripDirection | "roundTrip";

	if (!name || !trip) {
		const form = renderTripsForm(i18n, ROUTE, i18n.errors.undefinedFormData);

		return progressiveRespond(i18n, request, form, 400);
	}

	if (isFormEntryLong(i18n, name, 64)) {
		const form = renderTripsForm(i18n, ROUTE, i18n.errors.formEntryLong);

		return progressiveRespond(i18n, request, form, 400);
	}

	if (trip === "roundTrip") {
		return handleRoundTrip(i18n, request, database, date, name);
	}

	return handleSingleTrip(i18n, request, database, date, name, trip);
}
