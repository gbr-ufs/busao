// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { renderErrorParagraph } from "../../components/paragraphs";
import { htmlResponse } from "../../responses";
import type { i18n } from "../../shared/types";
import { baseLayout } from "../layout";

/**
 * Returns the content within a "Unauthorized" page.
 *
 * @remarks
 *
 * Use only when you want the "Unauthorized" bit, not the whole page.
 * @see {@link renderUnauthorizedPage} if you want the whole page.
 *
 * @param i18n - The internationalisation object.
 * @returns The main content of the "Unauthorized" page.
 */
export function getUnauthorizedPageContent(i18n: i18n) {
	return `<h1>401</h1>
  <h2>${i18n.unauthorized.h2}</h2>
  <p>${i18n.unauthorized.p}</p>`;
}

/**
 * Builds the "Unauthorized" page with internationalisation.
 *
 * @param i18n - The internationalisation object.
 * @returns A semantic HTML page for "Unauthorized" (401) status purposes.
 */
export function renderUnauthorizedPage(i18n: i18n): Response {
	const body = baseLayout(i18n, getUnauthorizedPageContent(i18n));

	return htmlResponse(body, 401);
}

/**
 * Builds the "Too Early" page with internationalisation.
 *
 * @remarks
 *
 * Has "Unauthorized" (401) status.
 *
 * @param i18n - The internationalisation object.
 * @returns A semantic HTML page for when the user gets to the webste before
 * the opening hour.
 */
export function renderTooEarlyPage(i18n: i18n): Response {
	const tooEarlyParagraph = renderErrorParagraph(i18n.tooEarly);
	const body = baseLayout(i18n, tooEarlyParagraph);

	return htmlResponse(body, 401);
}
