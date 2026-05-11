// SPDX-FileCopyrightText: 2026 Gabriel Santos de Souza <gabriel.santosdesouza@dcomp.ufs.br>
//
// SPDX-License-Identifier: GPL-3.0-or-later

export class BusaoError extends Error {}

export class DatabaseError extends BusaoError {}

export class DatabaseSelectionError extends DatabaseError {
	constructor(databaseTable: string) {
		super();
		this.message = `failed to select database table: ${databaseTable}`;
	}
}

export class TripTokenNotFoundError extends DatabaseError {
	constructor(tripToken: string) {
		super();
		this.message = `trip token not found: ${tripToken}`;
	}
}

export class DatabaseUpdateError extends DatabaseError {
	constructor(databaseTable: string) {
		super();
		this.message = `failed to update entry in database table: ${databaseTable}`;
	}
}

export class IDNotFoundError extends BusaoError {
	constructor(id: string) {
		super();
		this.message = `ID not found: ${id}`;
	}
}
