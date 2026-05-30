import { Pool, PoolClient, QueryResult } from "pg";

// Pool compartida para toda la aplicación
let pool: Pool | null = null;

export function initializePool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env.DB_USER || "softcom",
      password: process.env.DB_PASSWORD || "softcom_dev_2026",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "softcom_db",
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    return initializePool();
  }
  return pool;
}

// Ejecutar query simple
export async function query<T = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    return await client.query<T>(text, values);
  } finally {
    client.release();
  }
}

// Ejecutar múltiples queries en transacción
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Cerrar pool (para graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
