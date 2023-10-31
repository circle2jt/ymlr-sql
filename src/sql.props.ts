import { type Knex } from 'knex'

export interface SqlProps {
  uri: string
  client: 'pg' | 'sqlite3' | 'mysql' | 'oracledb'
  opts: Knex.Config
}
