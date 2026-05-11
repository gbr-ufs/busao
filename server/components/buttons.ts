// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

// This module just exists to house buttons with classes.

import type { i18n } from "../shared/types";

/**
 * Renders the button used by the admin to cancel trips.
 *
 * @param i18n - The internationalisation object.
 * @returns A button for cancelling trips.
 */
export function renderAdminCancelTripButton(i18n: i18n): string {
	return `<button aria-label="${i18n.admin.cancel}" class="button-error" type="submit">X</button>`;
}
