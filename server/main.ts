// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { Database } from "bun:sqlite";
import { type BunRequest, escapeHTML, serve } from "bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { scheduleDailyReset } from "./businessLogic/scheduler";
import { set_useful_sqlite_pragmas } from "./db/pragmas";
import { configuration } from "./db/schema";
import { getI18N } from "./i18n";
import { fileResponse } from "./responses";
import { renderIndexPage } from "./routes";
import { handleAdminCancel } from "./routes/admin/cancel";
import { handleAdminClear } from "./routes/admin/clear";
import { renderAdminPage } from "./routes/admin/index";
import { handleAdminUpdateSeatCount } from "./routes/admin/updateSeatCount";
import { handleAdminSearch } from "./routes/api/v1/admin/search";
import { handleTrips } from "./routes/api/v1/trips";
import { handleCancel, renderCancelPage } from "./routes/cancel";
import { handleLogin } from "./routes/login";
import { renderSuccessPage } from "./routes/success";
import { renderWaitlistPage } from "./routes/waitlist";
import type { TripDirection } from "./shared/types";
import { renderNotFoundPage } from "./views/status/notFound";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const OPENING_HOUR = parseInt(process.env.OPENING_HOUR || "9", 10);
const MAX_SEATS = parseInt(process.env.MAX_SEATS || "40", 10);
const SQLITE = new Database(process.env.DATABASE_URL || "data/busao.sqlite");

set_useful_sqlite_pragmas(SQLITE);

const DATABASE = drizzle(SQLITE);

migrate(DATABASE, { migrationsFolder: "drizzle" });
DATABASE.insert(configuration)
	.values({ id: 1, oneWaySeats: MAX_SEATS, returnSeats: MAX_SEATS })
	.onConflictDoNothing()
	.run();

scheduleDailyReset(DATABASE, new Date(), OPENING_HOUR);

const API_ROUTES = {
	search: "/api/v1/admin/search",
	trips: "/api/v1/trips",
} as const;

/**
 * Entrypoint of the program.
 *
 * Implements the server routes.
 *
 * @remarks
 *
 * The server has a schedule system. Some requests will be barried if performed
 * before the opening hour.
 *
 * @param / - Index page.
 * @param /admin - Admin page.
 * @param /admin/cancel/:id - Cancel a trip by user ID `id`.
 * @param /admin/clear/:trip - Cancel all trips of a certain direction `trip`.
 * @param /api/v1/admin/search - Use search parameters to search for a trip,
 * filtering by status and direction (`search`, `status` and `trip`, respectively).
 * @param /api/v1/trips - Schedule a trip by form data. A trip consists of a
 * name (the name of the passenger) and its direction ("oneWay", "return", "roundTrip").
 * @param /assets/* - Access files inside the assets directory (binary files for the browser).
 * @param /cancel/:token - Cancel a trip by token `token`.
 * @param /client/* - Access files inside the client directory (CSS, client-side JavaScript).
 * @param /login - Houses the authentication logic for the admin panel.
 * @param /node_modules/* - Access files inside the node_modules directory (for client-side JavaScript).
 * @param /success - Success page.
 * @param /waitlist - Waitlist page.
 */
export const server = serve({
	routes: {
		"/": (request) =>
			renderIndexPage(
				getI18N(request),
				DATABASE,
				API_ROUTES.trips,
				new Date(),
				OPENING_HOUR,
			),
		"/admin": (request) =>
			renderAdminPage(
				getI18N(request),
				request,
				DATABASE,
				MAX_SEATS,
				API_ROUTES.search,
				new Date(),
			),
		"/admin/cancel/:id": {
			POST: async (request: BunRequest<"/admin/cancel/:id">) =>
				await handleAdminCancel(
					getI18N(request),
					request,
					DATABASE,
					escapeHTML(request.params.id),
				),
		},
		"/admin/clear/:trip": {
			POST: async (request: BunRequest<"/admin/clear/:trip">) =>
				await handleAdminClear(
					getI18N(request),
					request,
					DATABASE,
					new Date(),
					escapeHTML(request.params.trip) as TripDirection,
				),
		},
		"/admin/updateSeatCount": {
			POST: async (request) =>
				await handleAdminUpdateSeatCount(
					getI18N(request),
					request,
					DATABASE,
					new Date(),
					API_ROUTES.search,
					MAX_SEATS,
				),
		},
		"/api/v1/admin/search": async (request) =>
			await handleAdminSearch(getI18N(request), request, DATABASE, new Date()),
		"/api/v1/trips": {
			POST: async (request) =>
				await handleTrips(
					getI18N(request),
					request,
					DATABASE,
					new Date(),
					OPENING_HOUR,
				),
		},
		"/assets/*": (request) => fileResponse(request),
		"/cancel/:token": {
			GET: (request: BunRequest<"/cancel/:token">) =>
				renderCancelPage(
					getI18N(request),
					DATABASE,
					escapeHTML(request.params.token),
				),
			POST: async (request: BunRequest<"/cancel/:token">) =>
				await handleCancel(
					getI18N(request),
					request,
					DATABASE,
					escapeHTML(request.params.token),
				),
		},
		"/client/*": (request) => fileResponse(request),
		"/login": {
			POST: async (request) =>
				await handleLogin(
					getI18N(request),
					request,
					DATABASE,
					MAX_SEATS,
					API_ROUTES.search,
					new Date(),
					ADMIN_PASSWORD,
				),
		},
		"/node_modules/*": (request) => fileResponse(request),
		"/success": (request) =>
			renderSuccessPage(getI18N(request), request, DATABASE, new Date()),
		"/waitlist": (request) =>
			renderWaitlistPage(getI18N(request), DATABASE, new Date(), OPENING_HOUR),
	},
	fetch(request) {
		return renderNotFoundPage(getI18N(request));
	},
});
