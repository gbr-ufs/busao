// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { i18n } from "../shared/types";
import { enUS } from "./enUS";
import { ptBR } from "./ptBR";

export const i18nDictionary: Record<string, i18n> = {
	en: enUS,
	"en-US": enUS,
	pt: ptBR,
	"pt-BR": ptBR,
};

/**
 * Separates multiple strings with spaces with bidirectionality support.
 *
 * @param i18n - The internationalisation object.
 * @param strings - The strings to be joined by spaces.
 * @returns The strings separated by spaces. If the language
 * is written from right to left, the order of the strings is first
 * reversed before being joined by spaces.
 */
export function geti18nString(i18n: i18n, ...strings: string[]): string {
	return i18n.configuration?.orientation === "left-to-right"
		? strings.join(" ")
		: strings.reverse().join(" ");
}

/**
 * Gets the {@link i18n | internationalisation object} from the `request`.
 *
 * @remarks
 *
 * Defaults to english.
 *
 * @param request - The request to the associated endpoint.
 * @returns The {@link i18n | internationalisation object} based on the langauge
 * preferences specified in the
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language | `Accept-Language` header}.
 */
export function getI18N(request: Request): i18n {
	const acceptLanguageHeader = request.headers.get("Accept-Language");

	if (!acceptLanguageHeader) {
		return enUS;
	}

	const languages = acceptLanguageHeader
		.split(",")
		.map((language) => language.split(";")[0] || "".trim());

	for (const language of languages) {
		const matchedLanguage = i18nDictionary[language];

		if (matchedLanguage) {
			return matchedLanguage;
		}
	}

	return enUS;
}
