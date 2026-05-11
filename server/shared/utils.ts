// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Returns a text representation of a date in `YYYY-MM-DD` format.
 *
 * @example
 *
 * ```ts
 * const date = new Date(1987, 10, 14);
 * const ymd = dateYMDToString(date);
 *
 * console.log(ymd); // 1987-11-14
 * ```
 *
 * @param date - A date.
 * @returns A `YYYY-MM-DD` string of the date.
 */
export function dateYMDToString(date: Date): string {
	return date.toISOString().split("T")[0]!;
}
