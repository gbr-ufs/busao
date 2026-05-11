// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { renderTripsForm } from "../components/forms";
import { renderTripsTable } from "../components/tables";
import { htmlResponse } from "../responses";
import type { i18n } from "../shared/types";
import { baseLayout } from "../views/layout";
import { renderTooEarlyPage } from "../views/status/unauthorized";

/**
 * Builds the "Index" page with internationalisation.
 *
 * @remarks
 *
 * Displays a form for adding a trip and tables by trip with people whose trips were confirmed.
 *
 * If the user reaches the page before the opening hour, a {@link renderTooEarlyPage | "Too Early"} page
 * is shown.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param route - The route to the endpoint trip addition requests are made to.
 * @param date - The date the trips were registered in.
 * @param openingHour - The hour the website actually becomes available.
 * @returns A semantic HTML page with the form and tables for each of the
 * available directions at the right time. Otherwise, a {@link renderTooEarlyPage | "Too Early"} page.
 */
export function renderIndexPage(
	i18n: i18n,
	database: BunSQLiteDatabase,
	route: string,
	date: Date,
	openingHour: number,
): Response {
	if (date.getHours() < openingHour) {
		return renderTooEarlyPage(i18n);
	}

	const form = renderTripsForm(i18n, route);

	const oneWayTable = renderTripsTable(
		i18n,
		database,
		date,
		"oneWay",
		"confirmed",
		false,
	);
	const returnTable = renderTripsTable(
		i18n,
		database,
		date,
		"return",
		"confirmed",
		false,
	);
	const content = `<section class="tables">
${oneWayTable}
${returnTable}
</section>
<aside>
${form}
</aside>`;
	const body = baseLayout(i18n, content);

	return htmlResponse(body);
}
