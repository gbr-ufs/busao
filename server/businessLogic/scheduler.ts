// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { dateYMDToString } from "../shared/utils";
import { clearTrips } from "./trips";

/**
 * Schedules the daily trip table cleanup.
 *
 * @param database - The project's database.
 * @param date - The current date.
 * @param openingHour - The hour the website actually becomes available.
 */
export function scheduleDailyReset(
	database: BunSQLiteDatabase,
	date: Date,
	openingHour: number,
) {
	const target = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		openingHour - 1,
		59,
		50,
	);

	if (date.getTime() >= target.getTime()) {
		target.setDate(target.getDate() + 1);
	}

	const millisecondsUntilTarget = target.getTime() - date.getTime();

	console.log(`busao: reset scheduled to ${dateYMDToString(target)}`);

	setTimeout(async () => {
		const timeoutDate = new Date();
		const yesterday = new Date(
			timeoutDate.getFullYear(),
			timeoutDate.getMonth(),
			timeoutDate.getDate() - 1,
		);
		const formattedDate = dateYMDToString(yesterday);

		console.log(`busao: clearing trips from ${formattedDate}`);

		const clearedOneWayTrips = await clearTrips(
			database,
			dateYMDToString(yesterday),
			"oneWay",
		);

		console.log(`busao: cleared ${clearedOneWayTrips.length} one-way trips`);

		const clearedReturnTrips = await clearTrips(
			database,
			dateYMDToString(yesterday),
			"return",
		);

		console.log(`busao: cleared ${clearedReturnTrips.length} return trips`);

		timeoutDate.setSeconds(timeoutDate.getSeconds() + 10);

		scheduleDailyReset(database, timeoutDate, openingHour);
	}, millisecondsUntilTarget);
}
