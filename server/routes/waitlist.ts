// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { renderTripsTable } from "../components/tables";
import { htmlResponse } from "../responses";
import type { i18n } from "../shared/types";
import { baseLayout } from "../views/layout";
import { renderTooEarlyPage } from "../views/status/unauthorized";

/**
 * Builds the "Waitlist" page with internationalisation.
 *
 * @remarks
 *
 * The "Waitlist" page is similar to the {@link "routes".renderIndexPage | "Index"} page.
 * It differs from the fact that the tables on this page only display
 * people on the waitlist by trip, and its lack of form.
 *
 * Shows trips by date.
 *
 * If the user reaches the page before the opening hour, a {@link renderTooEarlyPage | "Too Early"} page
 * is shown.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param date - The date the trips were registered in.
 * @param openingHour - The hour the website actually becomes available.
 * @returns A semantic HTML page with waitlist tables for each of the
 * available directions at the right time. Otherwise, a {@link renderTooEarlyPage | "Too Early"} page.
 */
export function renderWaitlistPage(
	i18n: i18n,
	database: BunSQLiteDatabase,
	date: Date,
	openingHour: number,
): Response {
	if (date.getHours() < openingHour) {
		return renderTooEarlyPage(i18n);
	}

	const oneWayTable = renderTripsTable(
		i18n,
		database,
		date,
		"oneWay",
		"waitlist",
		false,
	);
	const returnTable = renderTripsTable(
		i18n,
		database,
		date,
		"return",
		"waitlist",
		false,
	);
	const content = `<section class="tables">
${oneWayTable}
${returnTable}
</section>`;
	const body = baseLayout(i18n, content);

	return htmlResponse(body);
}
