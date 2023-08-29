import { Knex } from 'knex'
import { GroupItemProps, GroupProps } from 'ymlr/src/components/group/group.props'
import { SqlQueryProps } from './sql-query.props'

export type SqlProps = {
  uri: string
  client: 'pg' | 'sqlite3' | 'mysql' | 'oracledb'
  opts: Knex.Config
  runs?: Array<GroupItemProps | {
    'ymlr-sql\'query': SqlQueryProps
  }>
} & GroupProps
