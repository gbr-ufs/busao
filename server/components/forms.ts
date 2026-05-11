// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { configuration } from "../db/schema";
import { geti18nString } from "../i18n";
import type { i18n, TripDirection, TripStatus } from "../shared/types";
import { renderErrorParagraph } from "./paragraphs";
import { renderAdminCancelTripButton } from "./buttons";

/**
 * Renders the form used for registering trips.
 *
 * @remarks
 *
 * The form asks for a name ({@link isFormEntryLong | with length limit}) and
 * uses a radio button to determine the trip's direction.
 *
 * @param i18n - The internationalisation object.
 * @param route - The API route for adding trips.
 * @param errorMessage - The error message to be added to the form in case something goes wrong.
 * @returns A form for registering trips.
 */
export function renderTripsForm(
	i18n: i18n,
	route: string,
	errorMessage: string = "",
): string {
	return `<form action="${route}" hx-post="${route}" hx-swap="outerHTML" method="POST">
  ${!!errorMessage ? renderErrorParagraph(errorMessage) : ""}
  <fieldset>
    <legend>${i18n.form.personalInformation}</legend>
    <label for="name">${i18n.name}</label>
    <input id="name" type="text" maxlength="64" name="name" required>
  </fieldset>
  <fieldset>
    <legend>${i18n.form.trip.legend}</legend>
    <input id="oneWay" type="radio" name="trip" value="oneWay" required>
    <label for="oneWay">${i18n.trip.oneWay}</label>
    <input id="return" type="radio" name="trip" value="return" required>
    <label for="return">${i18n.trip.return}</label>
    <input id="roundTrip" type="radio" name="trip" value="roundTrip" required>
    <label for="roundTrip">${i18n.trip.roundTrip}</label>
  </fieldset>
  <button type="submit">${i18n.form.button}</button>
</form>`;
}

/**
 * Renders the form used to authenticate into the {@link "routes/admin".renderAdminPage | "Admin"} page.
 *
 * @param i18n - The internationalisation object.
 * @param errorMessage - The error message to be added to the form in case something goes wrong.
 * @returns A form used to log in to the {@link "routes/admin".renderAdminPage | "Admin"} page.
 */
export function renderAdminForm(i18n: i18n, errorMessage: string = ""): string {
	return `<form action="/login" hx-post="/login" hx-swap="outerHTML" method="POST">
  ${!!errorMessage ? renderErrorParagraph(errorMessage) : ""}
  <fieldset>
    <label>${i18n.admin.password}</label>
    <input id="adminPassword" type="password" maxlength="64" name="adminPassword" required>
  </fieldset>
  <button type="submit">${i18n.admin.button}</button>
</form>`;
}

/**
 * Renders the form used to cancel a trip by its token.
 *
 * @param i18n - The internationalisation object.
 * @param tripToken - The token of the trip.
 * @returns A form for cancelling a trip.
 */
export function renderCancellationForm(i18n: i18n, tripToken: string): string {
	return `<form action="/cancel/${tripToken}" class="cancellation-form" hx-post="/cancel/${tripToken}" hx-swap="outerHTML" method="POST">
	<p>${i18n.cancel.question}</p>
	<div class="form-actions">
	<button class="button-text-error" type="submit">${i18n.yes}</button>
	<a class="button-text" href="/">${i18n.no}</a>
	</div>
  </form>`;
}

/**
 * Determines if a form entry that requires extra validation
 * (an `input` field, for example) exceeds a specified maximum length.
 *
 * @remarks
 *
 * Determines length at the grapheme level.
 *
 * @param i18n - The internationalisation object.
 * @param formEntry - The string whose length will be checked.
 * @param maxLength - The maximum length.
 * @returns Whether the form entry exceeds the specified maximum length.
 */
export function isFormEntryLong(
	i18n: i18n,
	formEntry: string,
	maxLength: number = 64,
): boolean {
	const segmenter = new Intl.Segmenter(i18n.lang, {
		granularity: "grapheme",
	});
	const length = [...segmenter.segment(formEntry)].length;

	return length > maxLength;
}

/**
 * Renders the form used by the admin to update the total number of seats available.
 *
 * @remarks
 *
 * The maximum value is the starting maximum set at deployment.
 *
 * The default value is the last value that was set.
 *
 * @param i18n - The internationalisation object.
 * @param database - The project's database.
 * @param errorMessage - The error message to be added to the form in case something goes wrong.
 * @param trip - The direction of the trips that will have their seat count updated.
 * @param maxSeats - The new number of maximum seats.
 * @returns A form to update the number of available seats.
 */
export function renderUpdateSeatCountForm(
	i18n: i18n,
	database: BunSQLiteDatabase,
	trip: TripDirection,
	maxSeats: number,
	errorMessage: string = "",
): string {
	const currentConfiguration = database
		.select()
		.from(configuration)
		.where(eq(configuration.id, 1))
		.get();
	const tripLegend = trip === "oneWay" ? i18n.trip.oneWay : i18n.trip.return;
	const totalSeats =
		trip === "oneWay"
			? currentConfiguration?.oneWaySeats
			: currentConfiguration?.returnSeats;

	return `<form action="/admin/updateSeatCount" hx-post="/admin/updateSeatCount" method="POST">
  ${!!errorMessage ? renderErrorParagraph(errorMessage) : ""}
  <fieldset>
	<legend>${geti18nString(i18n, `[${tripLegend}]`, i18n.admin.seatCount)}</legend>
	<input type="hidden" name="trip" value="${trip}">
    <input id="seatCount" name="seatCount" max="${maxSeats}" min="0" type="number" value="${totalSeats}" required>
  </fieldset>
  <button type="submit">${i18n.admin.button}</button>
</form>`;
}

/**
 * Renders the form used by the admin to cancel a trip by ID.
 *
 * @param i18n - The internationalisation object.
 * @param id - The ID of the trip.
 * @returns A form for cancelling a trip by ID.
 */
export function renderAdminCancelTripForm(i18n: i18n, id: string): string {
	return `<form action="/admin/cancel/${id}" hx-confirm="${i18n.admin.confirm}" hx-post="/admin/cancel/${id}" hx-swap="outerHTML swap:1s" hx-target="closest tr" method="POST">
  ${renderAdminCancelTripButton(i18n)}
</form>`;
}

/**
 * Renders the form used by the admin to search for trips.
 *
 * @param route - The API route for user search in {@link "components/tables".renderAdminTripsTable | the tables}.
 * @param target - The table body that will be updated.
 * @param trip - The direction of the trip.
 * @param status - The status of the trip.
 * @param searchQuery - The search query.
 * @returns A form used to search for trips.
 */
export function renderAdminSearchTripForm(
	route: string,
	target: string,
	trip: TripDirection,
	status: TripStatus,
	searchQuery: string,
): string {
	const search = `<input type="search" name="search" hx-get="${route}" hx-include="closest form" hx-trigger="input changed delay:500ms, keyup[key=='Enter'], load" hx-target="#${target}" value="${searchQuery}">`;
	const hiddenStatus = `<input type="hidden" name="status" value="${status}">`;
	const hiddenTrip = `<input type="hidden" name="trip" value="${trip}">`;
	const form = `<form action="${route}" hx-get="${route}" hx-target="#${target}" method="GET">
${hiddenStatus}
${hiddenTrip}
${search}
</form>`;

	return form;
}

/**
 * Renders the form used by the admin to cancel all trips to a certain direction.
 *
 * @param i18n - The internationalisation object.
 * @param target - The table body that will be updated.
 * @param trip - The trip direction that wil have all associated trips cancelled.
 * @returns A form to cancel all trips associated with a direction.
 */
export function renderAdminClearTripsForm(
	i18n: i18n,
	target: string,
	trip: TripDirection,
): string {
	return `<form action="/admin/clear/${trip}" hx-confirm="${i18n.admin.confirm}" hx-post="/admin/clear/${trip}" hx-swap="outerHTML swap:1s" hx-target="#${target}" method="POST">
  <button type="submit">${i18n.admin.clear}</button>
</form>`;
}
