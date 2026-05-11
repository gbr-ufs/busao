// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import { randomUUIDv7 } from "bun";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { isFormEntryLong, renderAdminForm } from "../components/forms";
import { sessions } from "../db/schema";
import {
	progressiveRedirect,
	progressiveRespond,
} from "../responses/progressiveEnhancement";
import type { i18n } from "../shared/types";
import { getAdminPageContent } from "./admin";

/**
 * Handles the authentication logic.
 *
 * @remarks
 *
 * Adds a session cookie on successful login, to skip the login page.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @param maxSeats - The maximum amount of seats of the vehicle.
 * @param route - The API route for user search in {@link "components/tables".renderAdminTripsTable | the tables}.
   @param date - The current date.
 * @param adminPassword - The instance's admin password.
 * @returns
 * - An error message in case no password is provided.
 * - An error message in case the submitted password exceeded the limit.
 * - A redirect to the {@link "routes/admin".renderAdminPage | "Admin"} page in case the admin gets the password right.
 */
export async function handleLogin(
	i18n: i18n,
	request: BunRequest,
	database: BunSQLiteDatabase,
	maxSeats: number,
	route: string,
	date: Date,
	adminPassword: string,
): Promise<Response> {
	const formData = await request.formData();
	const formPassword = formData.get("adminPassword") as string;

	if (!formPassword) {
		const form = renderAdminForm(i18n, i18n.errors.undefinedFormData);

		return progressiveRespond(i18n, request, form, 400);
	}

	if (isFormEntryLong(i18n, formPassword, 64)) {
		const form = renderAdminForm(i18n, i18n.errors.formEntryLong);

		return progressiveRespond(i18n, request, form, 400);
	}

	if (formPassword !== adminPassword) {
		const form = renderAdminForm(i18n, i18n.errors.invalidPassword);

		return progressiveRespond(i18n, request, form, 401);
	}

	const id = randomUUIDv7();

	database.insert(sessions).values({ id: id }).run();

	request.cookies.set("session", id, {
		httpOnly: true,
		sameSite: "strict",
		secure: true,
	});

	return progressiveRedirect(
		request,
		getAdminPageContent(i18n, request, database, maxSeats, route, date),
		"/admin",
	);
}
