import assert from 'assert'
import { type Knex } from 'knex'
import { type ElementProxy } from 'ymlr/src/components/element-proxy'
import { type Element } from 'ymlr/src/components/element.interface'
import { Sql } from './sql'
import { type SqlQueryProps } from './sql-query.props'

/** |**  ymlr-sql'query
  Execute a sql query
  @example
  Publish a message to sql
  ```yaml
    - name: "[sql] localhost"
      ymlr-sql'query:
        uri: postgresql://user:pass@ip:port                     # postgresql uri
        opts:
          client: pg
        query: "SELECT * FROM Table WHERE id = ? and type = ?"
        prms:
          - 1
          - my-type
      vars: result

    - echo: ${ $vars.result }
  ```

  Reuse sql connection to execute multiple times
  ```yaml
    - name: "[sql] localhost"
      ymlr-sql:
        uri: postgresql://user:pass@ip:port                     # postgresql uri
        opts:
          client: pg
        runs:
          - ymlr-sql'query:
              query: "SELECT * FROM Table WHERE id = ? and type = ?"
              prms:
                - 1
                - my-type
          - ...
          # Other elements
  ```

  Or reuse by global variable
  Reuse sql connection to execute multiple times
  ```yaml
    - name: "[sql] localhost"
      id: db
      ymlr-sql:
        uri: postgresql://user:pass@ip:port                     # postgresql uri
        opts:
          client: pg

    - ymlr-sql'query:
        sql: ${ $vars.db }
        query: "SELECT * FROM Table WHERE id = ? and type = ?"
        prms:
          - 1
          - my-type
    - ...
    # Other elements
  ```
*/
export class SqlQuery implements Element {
  proxy!: ElementProxy<this>

  uri?: string
  opts!: Knex.Config
  query?: string
  params?: any[]

  sql?: ElementProxy<Sql>

  constructor({ sql, query, params, ...props }: SqlQueryProps) {
    Object.assign(this, { sql, query, params, ...props })
  }

  async exec(parentState: any) {
    assert(this.query)
    let sql = this.sql
    if (!sql) {
      if (this.uri) {
        sql = this.sql = await this.proxy.scene.newElementProxy(Sql, {
          uri: this.uri,
          opts: this.opts
        })
        sql.logger = this.proxy.logger
        await this.sql.exec(parentState)
      } else {
        sql = this.proxy.getParentByClassName<Sql>(Sql)
      }
    }
    assert(sql, '"uri" is required OR "ymlr-sql\'query" only be used in "ymlr-sql"')
    const result = await sql.$.client?.raw(this.query, ...(this.params || []))
    return result
  }

  async stop() {
    await this.sql?.$.stop()
    this.sql = undefined
  }

  async dispose() {
    await this.stop()
  }
}
