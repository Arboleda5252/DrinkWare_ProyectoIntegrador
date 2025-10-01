import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const pool: Pool =
  global.pgPool ??
  new Pool({
    user: 'postgres',
    password: 'system',
    host: 'localhost',
    port: 5432,
    database: 'drinkwarebd',
  });

if (process.env.NODE_ENV !== 'production') global.pgPool = pool;

export async function sql<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const res = await pool.query(text, params);
  return res as QueryResult<T>;
}