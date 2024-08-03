import { default as createConnectionPool } from '@databases/pg';

import type { ConnectionPool, SQLQuery } from '@databases/pg';

export default class Node {
	#db: ConnectionPool;

	/**
	 *
	 * @param url connection url as string
	 */
	constructor(url: string, poolSize = 2) {
		this.#db = createConnectionPool.default({
			connectionString: url,
			poolSize: poolSize,
			bigIntMode: 'number',
		});
	}

	/**
	 *
	 * @param q query to execute
	 * @returns Array of rows with type
	 */
	query<T extends object>(q: SQLQuery): Promise<[] | T[]> {
		return this.#db.tx<T[] | []>((tx) => {
			return tx.query(q) as Promise<T[]>;
		}, {});
	}
}

export { sql } from '@databases/pg';
