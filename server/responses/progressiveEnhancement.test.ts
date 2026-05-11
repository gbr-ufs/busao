// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import {
	progressiveDelete,
	progressiveRedirect,
} from "./progressiveEnhancement";

describe("Progressive Enhancement", () => {
	test("[progressiveRedirect] Should return a chunk of HTML in case we have HTMX", async () => {
		const request = new Request("http://localhost", {
			headers: { "HX-Request": "true" },
		});
		const body = "<p>Hello, World</p>";
		const url = "http://localhosts/trips";
		const response = progressiveRedirect(request, body, url);
		const text = await response.text();

		expect(text).toContain(body);
	});

	test("[progressiveRedirect] Should redirect in case we don't have HTMX", async () => {
		const request = new Request("http://localhost");
		const body = "<p>Hello, World</p>";
		const url = "http://localhosts/trips";
		const response = progressiveRedirect(request, body, url);

		expect(response.headers.get("location")).toContain("trips");
	});

	test("[progressiveDelete] Should return an empty response in case we have HTMX", async () => {
		const request = new Request("http://localhost", {
			headers: { "HX-Request": "true" },
		});
		const url = "http://localhosts/trips";
		const response = progressiveDelete(request, url);
		const text = await response.text();

		expect(text).toBeEmpty();
	});

	test("[progressiveDelete] Should redirect in case we don't have HTMX", async () => {
		const request = new Request("http://localhost");
		const url = "http://localhosts/trips";
		const response = progressiveDelete(request, url);

		expect(response.headers.get("location")).toContain("trips");
	});
});
