import assert from 'assert'
import knex, { Knex } from 'knex'
import { Group } from 'ymlr/src/components/group/group'
import { GroupItemProps } from 'ymlr/src/components/group/group.props'
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
export class Sql extends Group<SqlProps, GroupItemProps> {
  uri!: string
  opts!: Knex.Config

  client?: Knex

  constructor(private readonly _props: SqlProps) {
    const { uri, opts, client, ...props } = _props
    super(props as any)
    Object.assign(this, { uri, opts, client })
  }

  async newOne() {
    const newOne = await (this.proxy.parent as Group<any, any>).newElementProxy<Sql>(Sql, this._props)
    return newOne
  }

  async exec(parentState: any = {}) {
    if (!this.client) {
      assert(this.uri, '"uri" or "client" is required')
      if (!this.opts) this.opts = {}
      if (!this.opts.client) {
        this.opts.client = ClientMap[this.uri.split('://', 1)[0]]
      }
      this.opts.connection = this.uri
      this.client = knex(this.opts)
    }
    assert(this.client, '"uri" or "client" is required')
    this.logger.debug('Connect to %s', this.opts)
    parentState.sqlCtx = this.client
    const rs = await super.exec(parentState)
    return rs
  }

  async stop() {
    await this.client?.destroy()
    this.client = undefined
  }

  async dispose() {
    if (this.runs?.length) {
      await this.stop()
    }
  }
}
