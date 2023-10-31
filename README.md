# ymlr-sql
ymlr-sql for ymlr plugin

## Shares

- [SQL query](./shares/sql-query/README.md)
<br/>

# Tag details

| Tags | Description |
|---|---|
| [ymlr-sql](#ymlr-sql) | Declare a sql connection |
| [ymlr-sql'query](#ymlr-sql'query) | Execute a sql query |



## <a id="ymlr-sql"></a>ymlr-sql  
  
Declare a sql connection
Supported drivers:
[-] postgresql:           ['pg', 'pg-native']
[-] sqlite:               ['sqlite3', 'better-sqlite3']
[-] mysql:                ['mysql', 'mysql2']
[-] oracle:               ['oracledb']
[-] microsoft sql server: ['tedious']  

Example:  

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


## <a id="ymlr-sql'query"></a>ymlr-sql'query  
  
Execute a sql query  

Example:  

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


<br/>

### Have fun :)