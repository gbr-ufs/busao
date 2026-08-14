// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, test } from "bun:test";
import {
	renderCancelledParagraph,
	renderConfirmedParagraph,
	renderErrorParagraph,
	renderWaitlistParagraph,
} from "./paragraphs";

describe("Paragraph Components", () => {
	test("[renderConfirmedParagraph] Śhould render the form for a confirmation message", async () => {
		const helloWorld = "Hello, World!";
		const paragraph = renderConfirmedParagraph(helloWorld);

		expect(paragraph).toContain(helloWorld);
	});

	test("[renderWaitlistParagraph] Śhould render the form for a waitlist message", async () => {
		const helloWorld = "Hello, World!";
		const paragraph = renderWaitlistParagraph(helloWorld);

		expect(paragraph).toContain(helloWorld);
	});

	test("[renderCancelledParagraph] Śhould render the form for a confirmation message", async () => {
		const helloWorld = "Hello, World!";
		const paragraph = renderCancelledParagraph(helloWorld);

		expect(paragraph).toContain(helloWorld);
	});

	test("[renderErrorParagraph] Śhould render the form for an error message", async () => {
		const helloWorld = "Hello, World!";
		const paragraph = renderErrorParagraph(helloWorld);

		expect(paragraph).toContain(helloWorld);
	});
});
