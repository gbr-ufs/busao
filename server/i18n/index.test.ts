// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import type { i18n } from "../shared/types";
import { getI18N, geti18nString } from ".";
import { enUS } from "./enUS";
import { ptBR } from "./ptBR";

describe("i18n utilities", () => {
	test("[geti18nString] Should write text from left to right", async () => {
		const expected = `${enUS.yes} foo`;
		const actual = geti18nString(enUS, enUS.yes, "foo");

		expect(actual).toBe(expected);
	});

	test("[geti18nString] Should write text from right to left", async () => {
		const zhCN = {
			configuration: { orientation: "right-to-left" },
			yes: "确定",
		} as i18n;
		const actual = geti18nString(zhCN, zhCN.yes, "foo");
		const expected = `foo ${zhCN.yes}`;

		expect(actual).toBe(expected);
	});

	test("[getI18N] Should set the page's language to the default english in case the request doesn't include the 'Accept-Language' header", async () => {
		const request = new Request("http://localhost");
		const i18n = getI18N(request);

		expect(i18n).toBe(enUS);
	});

	test("[getI18N] Should set the page's language to one of the available languages", async () => {
		const request = new Request("http://localhost", {
			headers: { "Accept-Language": "pt" },
		});
		const i18n = getI18N(request);

		expect(i18n).toBe(ptBR);
	});

	test("[getI18N] Should set the page's language to the default english in case the language is unsupported", async () => {
		const request = new Request("http://localhost", {
			headers: { "Accept-Language": "sindarin" },
		});
		const i18n = getI18N(request);

		expect(i18n).toBe(enUS);
	});
});
