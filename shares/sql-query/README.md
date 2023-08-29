# Test sql query

## Prerequisites

- Installed [ymlr](https://github.com/circle2jt/ymlr) package

# Run in local
```sh
  ymlr -e SQLURI=postgresql://user:pwd@192.168.11.112 -- https://raw.githubusercontent.com/circle2jt/ymlr-sql/main/shares/sql-query/index.yaml
```

## Run in docker container
```yaml
  docker run --rm -t circle2jt/ymlr -e SQLURI=postgresql://user:pwd@192.168.11.112 -- https://raw.githubusercontent.com/circle2jt/ymlr-sql/main/shares/sql-query/index.yaml
```
