// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { htmlResponse } from "../../responses";
import type { i18n } from "../../shared/types";
import { baseLayout } from "../layout";

/**
 * Returns the content within a "Not Found" page.
 *
 * @remarks
 *
 * Use only when you want the "Not Found" bit, not the whole page.
 * @see {@link renderNotFoundPage} if you want the whole page.
 *
 * @param i18n - The internationalisation object.
 * @returns The main content of the "Not Found" page.
 */
export function getNotFoundPageContent(i18n: i18n): string {
	return `<h1>404</h1>
	<h2>${i18n.notFound.h2}</h2>
	<p>${i18n.notFound.p}.</p>`;
}

/**
 * Builds the "Not Found" page with internationalisation.
 *
 * @param i18n - The internationalisation object.
 * @returns A semantic HTML page for "Not Found" (404) status purposes.
 */
export function renderNotFoundPage(i18n: i18n): Response {
	const body = baseLayout(i18n, getNotFoundPageContent(i18n));

	return htmlResponse(body, 404);
}
