import { Knex } from 'knex'
import { ElementProxy } from 'ymlr/src/components/element-proxy'
import { Sql } from './sql'

export interface SqlQueryProps {
  sql?: ElementProxy<Sql>
  uri?: string
  opts?: Knex.Config
  query?: string
  params?: any[]
}
