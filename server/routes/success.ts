// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { renderTripsTable } from "../components/tables";
import { trips } from "../db/schema";
import { geti18nString } from "../i18n";
import { progressiveRespond } from "../responses/progressiveEnhancement";
import type {
	i18n,
	responseInformation,
	TripDirection,
	TripStatus,
} from "../shared/types";
import { getNotFoundPageContent } from "../views/status/notFound";
import { renderUnauthorizedPage } from "../views/status/unauthorized";
import {
	renderCancelledParagraph,
	renderConfirmedParagraph,
	renderWaitlistParagraph,
} from "../components/paragraphs";

/**
 * Builds the status message of a trip registration request.
 *
 * @param i18n - The internationalisation object.
 * @param tripStatus - The status of the trip.
 * @returns A message based on the status of the trip.
 */
export function getTripStatusMessage(
	i18n: i18n,
	tripStatus: TripStatus,
): string[] {
	if (tripStatus === "confirmed") {
		return [i18n.success.confirmed, i18n.success.tripTokenWarning];
	}

	if (tripStatus === "waitlist") {
		return [i18n.success.waitlist, i18n.success.tripTokenWarning];
	}

	return [i18n.success.cancelled];
}

/**
 * Builds the status message of a trip of the regular directions (`oneWay`, `return`).
 *
 * @remarks
 *
 * Supports bidirectionality through {@link geti18nString}.
 *
 * @param i18n - The internationalisation object.
 * @param trip - The direction of the trip.
 * @param status - The status of the trip.
 * @param token - The token of the trip.
 * @returns The status message of the trip.
 */
export function getSingleTripMessage(
	i18n: i18n,
	trip: TripDirection,
	status: TripStatus,
	token: string,
): string {
	const i18nTrip = trip === "oneWay" ? i18n.trip.oneWay : i18n.trip.return;
	const message = geti18nString(
		i18n,
		`<strong>[${i18nTrip}]</strong>`,
		...getTripStatusMessage(i18n, status),
		`<code>${token}</code>`,
	);

	if (status === "confirmed") {
		return renderConfirmedParagraph(message);
	}

	if (status === "waitlist") {
		return renderWaitlistParagraph(message);
	}

	return renderCancelledParagraph(message);
}

/**
 * Builds the status message of a roundtrip.
 *
 * @param i18n - The internationalisation object.
 * @param oneWayTripStatus - The status of the associated one-way trip.
 * @param oneWayTripToken - The token of the associated one-way trip.
 * @param returnTripStatus - The status of the associated return trip.
 * @param returnTripToken - The token of the associated return trip.
 * @returns The status message of the roundtrip.
 */
export function getRoundTripMessage(
	i18n: i18n,
	oneWayTripStatus: TripStatus,
	oneWayTripToken: string,
	returnTripStatus: TripStatus,
	returnTripToken: string,
): string {
	const oneWayMessage = getSingleTripMessage(
		i18n,
		"oneWay",
		oneWayTripStatus,
		oneWayTripToken,
	);
	const returnMessage = getSingleTripMessage(
		i18n,
		"return",
		returnTripStatus,
		returnTripToken,
	);

	return oneWayMessage + returnMessage;
}

/**
 * Builds the content of the "Success" page for a single trip.
 *
 * @remarks
 *
 * Returns the {@link getNotFoundPageContent | contents of a "Not Found"} page in case the
 * trip can't be found.
 *
 * In case the trip was confirmed, the {@link renderTripsTable | trip table} correspondent
 * to the trip is injected into the content.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param tripToken - The token of the trip.
 * @param trip - The direction of the trip.
 * @returns An {@link responseInformation | object} containing the content and the
 * status code to be used by the Response this will be tied to.
 */
export function getSingleTripSuccessContent(
	i18n: i18n,
	database: BunSQLiteDatabase,
	date: Date,
	tripToken: string,
	trip: TripDirection,
): responseInformation {
	const currentTrip = database
		.select({ status: trips.status })
		.from(trips)
		.where(eq(trips.tripToken, tripToken))
		.get();

	if (!currentTrip) {
		return { body: getNotFoundPageContent(i18n), status: 404 };
	}

	const tripsTable =
		currentTrip.status === "confirmed"
			? renderTripsTable(i18n, database, date, trip, "confirmed")
			: "";
	const tripMessage = getSingleTripMessage(
		i18n,
		trip,
		currentTrip.status,
		tripToken,
	);
	const body = tripMessage + tripsTable;

	return { body: body, status: 200 };
}

/**
 * Builds the content of the success page for a roundtrip.
 *
 * @remarks
 *
 * Returns the {@link getNotFoundPageContent | contents of a "Not Found"} page in case
 * any of the trips associated with the roundtirp can't be found.
 *
 * In case one of the trips was confirmed, the {@link renderTripsTable | trip table} correspondent
 * to the confirmed trip is injected into the content.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param date - The date the trip was registered in.
 * @param oneWayTripToken - The token of the associated one-way trip.
 * @param returnTripToken - The token of the asssociated return trip.
 * @returns An {@link responseInformation | object} containg the content and the
 * status code to be used by the Response this will be tied to.
 */
export function getRoundTripSuccessContent(
	i18n: i18n,
	database: BunSQLiteDatabase,
	date: Date,
	oneWayTripToken: string,
	returnTripToken: string,
): responseInformation {
	const oneWayTrip = database
		.select({ status: trips.status })
		.from(trips)
		.where(eq(trips.tripToken, oneWayTripToken))
		.get();

	if (!oneWayTrip) {
		return { body: getNotFoundPageContent(i18n), status: 404 };
	}

	const oneWayTripsTable =
		oneWayTrip.status === "confirmed"
			? renderTripsTable(i18n, database, date, "oneWay", "confirmed")
			: "";
	const returnTrip = database
		.select({ status: trips.status })
		.from(trips)
		.where(eq(trips.tripToken, returnTripToken))
		.get();

	if (!returnTrip) {
		return { body: getNotFoundPageContent(i18n), status: 404 };
	}

	const returnTripsTable =
		returnTrip.status === "confirmed"
			? renderTripsTable(i18n, database, date, "return", "confirmed")
			: "";
	const body =
		getRoundTripMessage(
			i18n,
			oneWayTrip.status,
			oneWayTripToken,
			returnTrip.status,
			returnTripToken,
		) +
		oneWayTripsTable +
		returnTripsTable;

	return { body: body, status: 200 };
}

/**
 * Builds the content of the "Success" page based on the provided tokens.
 *
 * @remarks
 *
 * In case both tokens are provided, it's inferred that the trip is a roundtrip.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param date - The date the trip was registered in.
 * @param oneWayTripToken - The token of the associated one-way trip.
 * @param returnTripToken - The token of the associated return trip.
 * @returns The status message of the trip.
 */
export function getSuccessContent(
	i18n: i18n,
	database: BunSQLiteDatabase,
	date: Date,
	oneWayTripToken: string,
	returnTripToken: string,
): responseInformation {
	if (!returnTripToken) {
		return getSingleTripSuccessContent(
			i18n,
			database,
			date,
			oneWayTripToken,
			"oneWay",
		);
	}

	if (!oneWayTripToken) {
		return getSingleTripSuccessContent(
			i18n,
			database,
			date,
			returnTripToken,
			"return",
		);
	}

	return getRoundTripSuccessContent(
		i18n,
		database,
		date,
		oneWayTripToken,
		returnTripToken,
	);
}

/**
 * Builds the "Success" page tied to a trip with internationalisation.
 *
 * @remarks
 *
 * The parameters (trip tokens) are provided as search parameters:
 *
 * - `oneWay`
 * - `return`
 *
 * If both search parameters have a value, it's inferred that a trip is a roundtrip.
 *
 * If no search parameters are provided, a {@link renderUnauthorizedPage | "Unauthorized"} page is shown.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param date - The date the trip was registered in.
 * @returns - HTML containing the {@link getSuccessContent | status message(s)} and {@link renderTripsTable | table(s)}
 * associated with the trip.
 */
export function renderSuccessPage(
	i18n: i18n,
	request: Request,
	database: BunSQLiteDatabase,
	date: Date,
): Response {
	const { searchParams } = new URL(request.url);
	const oneWayTripToken = searchParams.get("oneWay") || "";
	const returnTripToken = searchParams.get("return") || "";

	if (!oneWayTripToken && !returnTripToken) {
		return renderUnauthorizedPage(i18n);
	}

	const responseInformation = getSuccessContent(
		i18n,
		database,
		date,
		oneWayTripToken,
		returnTripToken,
	);

	return progressiveRespond(
		i18n,
		request,
		responseInformation.body,
		responseInformation.status,
	);
}
