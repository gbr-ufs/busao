// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import { fileResponse } from "../responses";
import { dateYMDToString } from "./utils";

describe("Utility Functions", () => {
	test("[dateYMDToString] Should format a date to a Year-Month-Day format", async () => {
		const date = new Date(1987, 10, 14);
		const got = dateYMDToString(date);
		const expected = "1987-11-14";

		expect(got).toBe(expected);
	});

	test("[dateYMDToString] Should pad values with zeros and not use index-based months", async () => {
		const date = new Date(2026, 0, 1);
		const got = dateYMDToString(date);
		const expected = "2026-01-01";

		expect(got).toBe(expected);
	});

	test("[fileResponse] Should return the contents of the README", async () => {
		const request = new Request("http://localhost/README.md");
		const response = fileResponse(request);
		const body = await response.text();

		expect(body).toContain("busao");
	});
});
