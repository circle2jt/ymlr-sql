import { ElementProxy } from 'ymlr/src/components/element-proxy'
import { Testing } from 'ymlr/src/testing'
import { Sql } from './sql'

let sql: ElementProxy<Sql>

beforeEach(async () => {
  await Testing.reset()
  sql = await Testing.createElementProxy(Sql, {
    uri: process.env.DB_URI,
    opts: {
      client: 'pg'
    }
  })
  await sql.exec()
  await sql.$.client?.raw('create table a ( rd int )')
})

afterEach(async () => {
  await sql.$.client?.raw('drop table a')
  await sql.$.stop()
})

test('test CRUD data', async () => {
  const sqlExample: any = await Testing.createElementProxy(Sql, {
    client: sql.$.client,
    runs: [{
      js: `
        const rs = await $parentState.sqlCtx.raw('INSERT INTO a(rd) VALUES(?)', 1);
        return rs
      `,
      vars: 'add'
    },
    {
      js: `
        const rs = await $parentState.sqlCtx.raw('SELECT * FROM a');
        return rs
      `,
      vars: 'sel'
    }, {
      js: `
        const rs = await $parentState.sqlCtx.raw('UPDATE a SET rd = ?', 2);
        return rs
      `,
      vars: 'edit'
    }, {
      js: `
        const rs = await $parentState.sqlCtx.raw('DELETE FROM a WHERE rd = ?', 2);
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
