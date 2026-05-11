// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { i18n } from "../shared/types";

export const enUS: i18n = {
	admin: {
		button: "Submit",
		cancel: "Cancel trip",
		clear: "Cancel trips",
		confirm: "Are you sure?",
		password: "Password",
		seatCount: "Seat count",
	},
	cancel: {
		alreadyCancelled: "Trip already cancelled.",
		question:
			"Are you sure you want to cancel your trip? This action cannot be undone.",
		success: "Trip successfully canceled.",
	},
	configuration: {
		orientation: "left-to-right",
	},
	error: "Operation failed. Please try again later.",
	errors: {
		formEntryLong:
			"Form entry exceeds character limit. Please type out a shorter entry.",
		invalidPassword: "Invalid password. Try again.",
		tripTokenNotFound: "Token not found.",
		undefinedFormData: "Form data missing. Please fill out the form correctly.",
	},
	form: {
		button: "Schedule Trip",
		incomplete: "Form incomplete",
		nameTooLong: "Name too long (exceeds 64 characters)",
		personalInformation: "Personal Information",
		trip: {
			legend: "Trip Type",
		},
	},
	lang: "en-US",
	meta: {
		description: "Bus Vacancy Management System",
		keywords: [
			"Databases",
			"Dependency Injection",
			"Domain-Driven Design",
			"Education",
			"Public Transportation",
			"Transportation",
			"Vanilla Web",
		],
	},
	nav: {
		admin: "Admin",
		waitlist: "Waitlist",
	},
	name: "Name",
	no: "No",
	notFound: {
		h2: "Page not found",
		p: "Sorry, but the requested page could not be found",
	},
	skipToContent: "Skip to content",
	success: {
		cancelled: "Trip cancelled successfully!",
		confirmed: "Trip registered successfully!",
		tripTokenWarning:
			"Your cancellation token is (don't share it with anyone else!):",
		waitlist: `Trip registered successfully and added to the <a href="/waitlist">waitlist</a>.`,
	},
	trip: {
		oneWay: "One Way",
		return: "Return",
		roundTrip: "Roundtrip",
	},
	tooEarly: "Come back later! The bus is currently unavailable.",
	unauthorized: {
		h2: "Unauthorized",
		p: "Sorry, you're not allowed to view this page.",
	},
	yes: "Yes",
};
