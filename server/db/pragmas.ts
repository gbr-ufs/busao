// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Database } from "bun:sqlite";

export function set_useful_sqlite_pragmas(database: Database): undefined {
	database.run("PRAGMA journal_mode = WAL;");
	database.run("PRAGMA synchronous = NORMAL;");
	database.run("PRAGMA busy_timeout = 5000;");
}
