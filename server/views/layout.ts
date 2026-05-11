// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { i18n } from "../shared/types";

/**
 * Dynamically builds a semantic HTML page with internationalisation.
 *
 * @param i18n - The internationalisation object.
 * @param content - The main content to be injected into the page.
 * @param view - The current view state. Used when an endpoint
 * offers multiple views depending on its state.
 * @returns A regular HTML page, with `content` injected into it.
 */
export function baseLayout(
	i18n: i18n,
	content: string,
	view: string = "",
): string {
	return `<!doctype html>
  <html lang="${i18n.lang}">
  <head>
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="/client/index.css">
  <meta charset="utf-8">
  <meta name="author" content="Gabriel Santos de Souza">
  <meta name="description" content="${i18n.meta.description}.">
  <meta name="keywords" content="${i18n.meta.keywords.join("; ")}">
  <meta name="license" content="GPL 3.0 or later">
  <meta name="viewport" content="width=device-width">
  <script src="/node_modules/htmx.org/dist/htmx.min.js"></script>
  <script>
  document.addEventListener('htmx:beforeSwap', function(evt) {
  // Let some 400 status codes swap normally.
  if (evt.detail.xhr.status === 400 || evt.detail.xhr.status === 401 || evt.detail.xhr.status === 404) {
  evt.detail.shouldSwap = true;
  evt.detail.isError = false;
  }
  });
  </script>
  <title>busao</title>
  </head>
  <body hx-boost="true">
  <a href="#main" class="skip-to-content">${i18n.skipToContent}
  </a>
  <header>
  <h1><a href="/">busao</a></h1>
  <nav>
  <ul>
  <li>
  <a href="/admin">${i18n.nav.admin}</a>
  </li>
  <li>
  <a href="/waitlist">${i18n.nav.waitlist}</a>
  </li>
  </ul>
  </nav>
  </header>
  <main data-view="${view}" id="main">
      ${content}
      </main>
      <footer>
      <a href="https://github.com/gbr-ufs/busao">busao</a> © 2026 by
      <a href="https://github.com/gbr-ufs">Gabriel Santos de Souza</a>
      is licensed under
      <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL 3.0 or later</a>
      </footer>
      </body>
      </html>`;
}
