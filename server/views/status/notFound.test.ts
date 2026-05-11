// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import { enUS } from "../../i18n/enUS";
import { renderNotFoundPage } from "./notFound";

describe("404", () => {
	test("[renderNotFoundPage] Should successfully write the 'Not Found' page", async () => {
		const page = renderNotFoundPage(enUS);
		const body = await page.text();

		expect(body).toContain("404");
	});
});
