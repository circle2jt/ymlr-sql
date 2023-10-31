import { ElementProxy } from 'ymlr/src/components/element-proxy'
import { Testing } from 'ymlr/src/testing'
import { Sql } from './sql'

let sql: ElementProxy<Sql>
let tableName = ''

beforeEach(async () => {
  await Testing.reset()
  sql = await Testing.createElementProxy(Sql, {
    uri: process.env.DB_URI,
    opts: {
      client: 'pg'
    }
  })
  await sql.exec()
  tableName = `Test${Date.now().toString()}`
  await sql.$.client?.raw(`create table ${tableName} ( rd int )`)
})

afterEach(async () => {
  await sql.$.client?.raw(`drop table ${tableName}`)
  await sql.dispose()
})

test('test CRUD data', async () => {
  const sqlExample: any = await Testing.createElementProxy(Sql, {
    uri: process.env.DB_URI,
    runs: [{
      js: `
        const rs = await $parentState.sqlCtx.raw('INSERT INTO ${tableName}(rd) VALUES(?)', 1);
        return rs
      `,
      vars: 'add'
    },
    {
      js: `
        const rs = await $parentState.sqlCtx.raw('SELECT * FROM ${tableName}');
        return rs
      `,
      vars: 'sel'
    }, {
      js: `
        const rs = await $parentState.sqlCtx.raw('UPDATE ${tableName} SET rd = ?', 2);
        return rs
      `,
      vars: 'edit'
    }, {
      js: `
        const rs = await $parentState.sqlCtx.raw('DELETE FROM ${tableName} WHERE rd = ?', 2);
        return rs
      `,
      vars: 'del'
    }]
  })
  await sqlExample.exec()
  expect(Testing.vars.add.rowCount).toBe(1)
  expect(Testing.vars.sel.rows).toHaveLength(1)
  expect(Testing.vars.del.rowCount).toBe(1)
  expect(Testing.vars.edit.rowCount).toBe(1)
})
