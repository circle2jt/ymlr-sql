import assert from 'assert'
import knex, { Knex } from 'knex'
import { ElementProxy } from 'ymlr/src/components/element-proxy'
import { Element } from 'ymlr/src/components/element.interface'
import { Group } from 'ymlr/src/components/group/group'
import { GroupItemProps, GroupProps } from 'ymlr/src/components/group/group.props'
import { SqlProps } from './sql.props'

export type OnMessageTextCallback = (channel: string, message: string) => any
export type OnPMessageTextCallback = (pattern: string, channel: string, message: string) => any

export type OnMessageBufferCallback = (channel: Buffer, message: Buffer) => any
export type OnPMessageBufferCallback = (pattern: Buffer, channel: Buffer, message: Buffer) => any
/** |**  ymlr-sql
  Declare a sql connection
  Supported drivers:
    [-] postgresql:           ['pg', 'pg-native']
    [-] sqlite:               ['sqlite3', 'better-sqlite3']
    [-] mysql:                ['mysql', 'mysql2']
    [-] oracle:               ['oracledb']
    [-] microsoft sql server: ['tedious']
  @example
  ```yaml
    - name: "[sql] localhost"
      ymlr-sql:
        uri: mysql://user:pass@ip:port          # mysql uri
        opts:                                   # Refs: https://knexjs.org/guide/#configuration-options
          client: mysql                         # See the drivers in "ymlr-sql"
        runs:                                   # Execute the below commands after connected
          - echo: sql is connected
  ```
  Execute a query
  ```yaml
    - name: "[sql] localhost"
      ymlr-sql:
        uri: postgresql://user:pass@ip:port     # postgresql uri
        runs:                                   # Execute the below commands after connected
          - js: |
              $vars.result = await this.$parentState.sqlCtx.raw('SELECT * FROM Table WHERE id = ? and type = ?', 1, 'my-type')
          - echo: ${ $vars.result }
  ```
*/
const ClientMap: any = {
  postgresql: 'pg',
  mysql: 'mysql'
}
export class Sql implements Element {
  readonly proxy!: ElementProxy<this>
  readonly innerRunsProxy!: ElementProxy<Group<GroupProps, GroupItemProps>>
  readonly ignoreEvalProps = ['client']
  uri!: string
  opts!: Knex.Config

  client?: Knex

  get logger() {
    return this.proxy.logger
  }

  constructor(private readonly props: SqlProps) {
    Object.assign(this, props)
  }

  async newOne() {
    const newOne = await (this.proxy.parent as Group<any, any>).newElementProxy<Sql>(Sql, this.props)
    return newOne
  }

  async exec(parentState?: any) {
    assert(this.uri, '"uri" is required')
    if (!this.opts) this.opts = {}
    if (!this.opts.client) {
      this.opts.client = ClientMap[this.uri.split('://', 1)[0]]
    }
    this.opts.connection = this.uri
    this.client = knex(this.opts)
    const rs = await this.innerRunsProxy.exec({
      ...parentState,
      sqlCtx: this.client
    })
    return rs
  }

  async stop() {
    await this.client?.destroy()
    this.client = undefined
  }

  async dispose() {
    await this.stop()
  }
}
