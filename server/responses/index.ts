// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import { file } from "bun";

export function fileResponse(request: Request): Response {
	return new Response(file(`.${new URL(request.url).pathname}`));
}

export function htmlResponse(body: string, status: number = 200) {
	return new Response(body, {
		headers: { "Content-Type": "text/html" },
		status: status,
	});
}
