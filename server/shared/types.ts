// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Describes the direction of a trip.
 */
export type TripDirection = "oneWay" | "return";

export type PassengerInput = {
	/**
	 * The date of the trip in YYYY-MM-DD format.
	 */
	date: string;
	name: string;
	/**
	 * The direction of the trip.
	 */
	trip: TripDirection;
};

export type TripStatus = "confirmed" | "waitlist" | "cancelled";

export type i18n = {
	admin: {
		button: string;
		cancel: string;
		clear: string;
		confirm: string;
		password: string;
		seatCount: string;
	};
	cancel: { alreadyCancelled: string; question: string; success: string };
	configuration: {
		orientation: "left-to-right" | "right-to-left";
	};
	error: string;
	errors: {
		formEntryLong: string;
		invalidPassword: string;
		tripTokenNotFound: string;
		undefinedFormData: string;
	};
	form: {
		button: string;
		incomplete: string;
		nameTooLong: string;
		personalInformation: string;
		trip: {
			legend: string;
		};
	};
	trip: {
		return: string;
		roundTrip: string;
		oneWay: string;
	};
	lang: string;
	meta: {
		description: string;
		keywords: string[];
	};
	name: string;
	notFound: {
		h2: string;
		p: string;
	};
	nav: {
		admin: string;
		waitlist: string;
	};
	no: string;
	skipToContent: string;
	success: {
		cancelled: string;
		confirmed: string;
		tripTokenWarning: string;
		waitlist: string;
	};
	tooEarly: string;
	unauthorized: {
		h2: string;
		p: string;
	};
	yes: string;
};

export type responseInformation = {
	body: string;
	status: number;
};
