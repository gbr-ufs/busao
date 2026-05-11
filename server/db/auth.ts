// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { BunRequest } from "bun";
import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { sessions } from "./schema";

/**
 * Determines if an authentication token is actually valid.
 *
 * @param request - The request to the associated endpoint.
 * @param database - The project's database.
 * @returns Whether the `session` cookie has a value that has actually
 * been registered in the database.
 */
export function isValidSession(
	request: BunRequest,
	database: BunSQLiteDatabase,
): boolean {
	const id = request.cookies.get("session") || "";

	return !!database.select().from(sessions).where(eq(sessions.id, id)).get();
}
