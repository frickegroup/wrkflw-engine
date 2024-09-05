import type { ConnectionPool, SQLQuery } from '@databases/pg';
import type { ClientConfig } from '@databases/pg';

import { default as createConnectionPool } from '@databases/pg';

export default class Node {
	#db: ConnectionPool;

	constructor(url: string, poolSize: number, sslOptions: ClientConfig['ssl']) {
		this.#db = createConnectionPool.default({
			connectionString: url,
			poolSize: poolSize,
			bigIntMode: 'number',
			ssl: sslOptions,
		});
	}

	query<T extends object>(q: SQLQuery): Promise<[] | T[]> {
		return this.#db.tx<T[] | []>((tx) => {
			return tx.query(q) as Promise<T[]>;
		}, {});
	}
}

export { sql } from '@databases/pg';
