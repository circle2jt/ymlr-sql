import { type Knex } from 'knex'
import { type ElementProxy } from 'ymlr/src/components/element-proxy'
import { type Sql } from './sql'

export interface SqlQueryProps {
  sql?: ElementProxy<Sql>
  uri?: string
  opts?: Knex.Config
  query?: string
  params?: any[]
}
