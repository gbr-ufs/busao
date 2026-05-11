// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

// This module just exists to house paragraphs with classes.

/**
 * Renders a paragraph to be used when a trip is confirmed.
 *
 * @param message - The message to be added to the paragraph.
 * @returns A paragraph to be used as a message for confirmed trips.
 */
export function renderConfirmedParagraph(message: string): string {
	return `<p class="status-paragraph confirmed-paragraph">${message}</p>`;
}

/**
 * Renders a paragraph to be used when a trip is added to the waitlist.
 *
 * @param message - The message to be added to the paragraph.
 * @returns A paragraph to be used as a message for waitlist trips.
 */
export function renderWaitlistParagraph(message: string): string {
	return `<p class="status-paragraph waitlist-paragraph">${message}</p>`;
}

/**
 * Renders a paragraph to be used when a trip is cancelled.
 *
 * @param message - The message to be added to the paragraph.
 * @returns A paragraph to be used as a message for cancelled trips.
 */
export function renderCancelledParagraph(message: string): string {
	return `<p class="status-paragraph cancelled-paragraph">${message}</p>`;
}

/**
 * Renders a paragraph for an error message.
 *
 * @param message - The message to be added to the paragraph.
 * @returns A paragraph to be used as an error message.
 */
export function renderErrorParagraph(message: string): string {
	return `<p class="error-paragraph">${message}</p>`;
}
