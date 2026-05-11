// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import {
	renderAdminForm,
	renderUpdateSeatCountForm,
} from "../../components/forms";
import { renderAdminTripsTable } from "../../components/tables";
import { isValidSession } from "../../db/auth";
import { htmlResponse } from "../../responses";
import type { i18n } from "../../shared/types";
import { baseLayout } from "../../views/layout";
import { getUnauthorizedPageContent } from "../../views/status/unauthorized";

/**
 * Builds the "Admin" page with internationalisation.
 *
 * @remarks
 *
 * If the admin is unauthenticated, a {@link renderAdminForm | login form} is shown.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param route - The API route for user search in {@link renderAdminTripsTable | the tables}.
 * @param date - The current date.
 * @returns An admin panel, with {@link renderAdminTripsTable | admin tables} and all,
 * in case the admin is properly aithenticated. Otherwise, a login form.
 */
export function renderAdminPage(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	maxSeats: number,
	route: string,
	date: Date,
): Response {
	const form = renderAdminForm(i18n);
	const body = baseLayout(i18n, form, "/admin-login");

	if (isValidSession(request, database)) {
		return renderAdminPageContent(
			i18n,
			request,
			database,
			maxSeats,
			route,
			date,
		);
	}

	return htmlResponse(body);
}

/**
 * Builds the contents of the "Admin" page.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param maxSeats - The maximum amount of seats of the vehicle.
 * @param route - The API route for user search in {@link renderAdminTripsTable | the tables}.
 * @param date - The current date.
 * @returns The contents of the "Admin" page.
 */
export function getAdminPageContent(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	maxSeats: number,
	route: string,
	date: Date,
): string {
	if (!isValidSession(request, database)) {
		return getUnauthorizedPageContent(i18n);
	}

	const updateOneWaySeatCountForm = renderUpdateSeatCountForm(
		i18n,
		database,
		"oneWay",
		maxSeats,
	);
	const updateReturnSeatCountForm = renderUpdateSeatCountForm(
		i18n,
		database,
		"return",
		maxSeats,
	);
	const url = new URL(request.url);
	const search = url.searchParams.get("search") || "";
	const oneWaySearch = url.searchParams.get("trip") === "oneWay" ? search : "";
	const returnSearch = url.searchParams.get("trip") === "return" ? search : "";
	const oneWayTable = renderAdminTripsTable(
		i18n,
		database,
		route,
		date,
		"oneWay",
		"confirmed",
		oneWaySearch,
		false,
	);
	const returnTable = renderAdminTripsTable(
		i18n,
		database,
		route,
		date,
		"return",
		"confirmed",
		returnSearch,
		false,
	);
	const content = `<section class="tables">
${oneWayTable}
${returnTable}
</section>
<aside>
${updateOneWaySeatCountForm}
${updateReturnSeatCountForm}
</aside>`;

	return content;
}

/**
 * Renders the contents of the "Admin" page.
 *
 * @remarks
 *
 * The admin page is primarily composed of a {@link renderUpdateSeatCountForm | form for updating seats}
 * and {@link renderAdminTripsTable | admin tables} for managing trips.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param searchRoute - The API route for user search in {@link renderAdminTripsTable | the tables}.
 * @param date - The current date.
 * @returns The contents of the admin page.
 */
export function renderAdminPageContent(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	maxSeats: number,
	searchRoute: string,
	date: Date,
): Response {
	const content = getAdminPageContent(
		i18n,
		request,
		database,
		maxSeats,
		searchRoute,
		date,
	);
	const body = baseLayout(i18n, content);

	return htmlResponse(body);
}
