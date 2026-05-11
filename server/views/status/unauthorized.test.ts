// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import { enUS } from "../../i18n/enUS";
import { renderUnauthorizedPage } from "./unauthorized";

describe("401", () => {
	test("[renderUnauthorizedPage] Should successfully write 'Unauthorized' page", async () => {
		const page = renderUnauthorizedPage(enUS);
		const body = await page.text();

		expect(body).toContain("401");
	});
});
