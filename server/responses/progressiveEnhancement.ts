// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { i18n } from "../shared//types";
import { baseLayout } from "../views/layout";
import { htmlResponse } from ".";

/**
 * Responds with support for no client-side JavaScript.
 *
 * @param i18n - The internationalisation object.
 * @param request - The request to the associated endpoint.
 * @param body - The HTML to be returned by the request.
 * @param status - The status code of the request.
 * @returns
 * - An {@link htmlResponse | HTML response} containing the chunk of
 * HTML specified in case HTMX is enabled, enabling reactive behaviour.
 * - A semantic HTML page in case HTMX is disabled.
 */
export function progressiveRespond(
	i18n: i18n,
	request: Request,
	body: string,
	status: number = 200,
): Response {
	return request.headers.get("HX-Request")
		? htmlResponse(body, status)
		: htmlResponse(baseLayout(i18n, body), status);
}

/**
 * Redirects with support for no client-side JavaScript.
 *
 * @param request - The request to the associated endpoint.
 * @param body - The HTML to be returned by the request.
 * @param url - The URL to be redirected to.
 * @returns
 * - An {@link htmlResponse | HTML response} containing the chunk of
 * HTML specified in case HTMX is enabled, enabling reactive behaviour.
 * - A redirect to a page with the same content in case HTMX is disabled.
 */
export function progressiveRedirect(
	request: Request,
	body: string,
	url: string,
): Response {
	return request.headers.get("HX-Request")
		? htmlResponse(body)
		: Response.redirect(url);
}

/**
 * Deletes an element from the page with support for no client-side JavaScript.
 *
 * @param request - The request to the associated endpoint.
 * @param url - The URL to be redirected to.
 * @returns
 * - An empty response to delete the associated element in case HTMX is enabled,
 * enabling reactive behaviour.
 * - A redirect to a page with the same content in case HTMX is disabled.
 */
export function progressiveDelete(request: Request, url: string): Response {
	return progressiveRedirect(request, "", url);
}
