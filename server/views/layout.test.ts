// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import { enUS } from "../i18n/enUS";
import { baseLayout } from "./layout";

describe("Page Layout", () => {
	test("[baseLayout] Should successfully write a page with a simple paragraph", async () => {
		const helloWorld = "<p>Hello, World!</p>";
		const page = baseLayout(enUS, helloWorld);

		expect(page).toContain(helloWorld);
	});
});
