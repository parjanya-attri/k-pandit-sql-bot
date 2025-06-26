import { tool } from '@openai/agents';
import sql from 'mssql';
import { z } from 'zod';

// Helper: Get and validate config from environment variables
function getConfig() {
  const {
    MSSQL_USER,
    MSSQL_PASSWORD,
    MSSQL_SERVER,
    MSSQL_DATABASE,
    MSSQL_PORT,
    MSSQL_ENCRYPT,
  } = process.env;
  if (!MSSQL_USER || !MSSQL_PASSWORD || !MSSQL_SERVER || !MSSQL_DATABASE) {
    throw new Error('Missing required MSSQL config (user, password, server, database)');
  }
  return {
    user: MSSQL_USER,
    password: MSSQL_PASSWORD,
    server: MSSQL_SERVER,
    database: MSSQL_DATABASE,
    port: MSSQL_PORT ? parseInt(MSSQL_PORT) : 1433,
    options: {
      encrypt: MSSQL_ENCRYPT === 'true',
      trustServerCertificate: true,
    },
  };
}

// Helper: Validate table name (prevent SQL injection)
function validateTableName(table: string) {
  if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error('Invalid table name');
  return `[${table}]`;
}

// List Tables Tool
export const listTablesTool = tool({
  name: 'list_tables',
  description: 'List all tables in the MSSQL database.',
  parameters: z.object({}),
  async execute() {
    try {
      const config = getConfig();
      await sql.connect(config);
      const result = await sql.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`
      );
      return result.recordset.map(row => row.TABLE_NAME);
    } catch (err) {
      console.error('List tables error:', err);
      throw new Error('Failed to list tables.');
    }
  }
});

// Read Table Tool
export const readTableTool = tool({
  name: 'read_table',
  description: 'Read up to 100 rows from a table.',
  parameters: z.object({ table: z.string() }),
  async execute({ table }) {
    try {
      const config = getConfig();
      const safeTable = validateTableName(table);
      await sql.connect(config);
      const result = await sql.query(`SELECT TOP 100 * FROM ${safeTable}`);
      return result.recordset;
    } catch (err) {
      console.error('Read table error:', err);
      throw new Error('Failed to read table.');
    }
  }
});

// Execute SQL Tool
export const executeSQLTool = tool({
  name: 'execute_sql',
  description: 'Execute an arbitrary SQL query (SELECT only for safety).',
  parameters: z.object({ query: z.string() }),
  async execute({ query }) {
    if (!/^\s*SELECT/i.test(query)) throw new Error('Only SELECT queries are allowed.');
    try {
      const config = getConfig();
      await sql.connect(config);
      const result = await sql.query(query);
      return result.recordset;
    } catch (err) {
      console.error('Execute SQL error:', err);
      throw new Error('Failed to execute query.');
    }
  }
}); 