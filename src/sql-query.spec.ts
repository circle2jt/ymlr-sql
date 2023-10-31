import { join } from 'path'
import { type ElementProxy } from 'ymlr/src/components/element-proxy'
import { Group } from 'ymlr/src/components/group/group'
import { Testing } from 'ymlr/src/testing'
import { Sql } from './sql'

let sql: ElementProxy<Sql>
let tableName = ''

beforeEach(async () => {
  await Testing.reset()
  Testing.rootScene.tagsManager.register('ymlr-sql', join(__dirname, 'index'))

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
  await sql.$.stop()
})

test('execute query', async () => {
  const group: ElementProxy<Group<any, any>> = await Testing.createElementProxy<Group<any, any>>(Group, {
    uri: process.env.DB_URI,
    runs: [
      {
        'ymlr-sql\'query': {
          uri: process.env.DB_URI,
          opts: {
            client: 'pg'
          },
          query: `INSERT INTO ${tableName}(rd) VALUES(?)`,
          params: [1]
        },
        vars: 'rs'
      }
    ]
  })
  await group.exec()
  expect(Testing.vars.rs.rowCount).toBe(1)
  await group.dispose()
})

test('execute query - used in "ymlr-sql"', async () => {
  const group: ElementProxy<Group<any, any>> = await Testing.createElementProxy<Group<any, any>>(Group, {
    uri: process.env.DB_URI,
    runs: [
      {
        'ymlr-sql': {
          uri: process.env.DB_URI,
          opts: {
            client: 'pg'
          },
          runs: [{
            'ymlr-sql\'query': {
              query: `INSERT INTO ${tableName}(rd) VALUES(?)`,
              params: [1]
            },
            vars: 'rs'
          }]
        }
      }
    ]
  })
  await group.exec()
  expect(Testing.vars.rs.rowCount).toBe(1)
  await group.dispose()
})
