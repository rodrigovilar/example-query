# Example project with Mikro-orm

Project created to reproduce the bug: https://github.com/mikro-orm/mikro-orm/issues/1537

# Steps to reproduce the bug

- Pre-requisite: Node installed, docker installed and docker daemon started
- Start local db `docker-compose up`
- Install dependencies: `yarn install`
- Check db. Go to localhost:8088 and login with
  system: PostgreSQL
  server: db
  user: postgres
  password: example
  db: postgres
- `yarn migration:up`
  => You should see all the tables
- Start server: `yarn serve`
- Create an Account `curl --location --request POST 'http://localhost:3000/api/accounts' --header 'Content-Type: application/json' --data-raw '{"email":"test@getaloro.com", "password":"test123"}'`
- Copy the returned token
- Query segments using the copied token to replace `...` : `curl --location --request GET 'http://localhost:3000/api/segments?withCount=true' --header 'Authorization: Bearer ...'`
- See the error in the server log, e.g.:

```
TableNotFoundException: select count(distinct("e0"."id")) as "count" from "subscriber" as "e0" left join "message" as "e2" on "e0"."id" = "e2"."recipient_id" where "e1"."date_clicked" < '2021-03-10T01:04:39.146Z' and "e0"."owner_id" = 1 and not ("e2"."date_clicked" > '2021-03-10T01:04:39.146Z' and "e0"."owner_id" = 1) - missing FROM-clause entry for table "e1"
    at PostgreSqlExceptionConverter.convertException (/Users/rodrigo/aloro/query-example/node_modules/@mikro-orm/postgresql/PostgreSqlExceptionConverter.js:36:24)
    at PostgreSqlDriver.convertException (/Users/rodrigo/aloro/query-example/node_modules/@mikro-orm/core/drivers/DatabaseDriver.js:185:54)
    at /Users/rodrigo/aloro/query-example/node_modules/@mikro-orm/core/drivers/DatabaseDriver.js:189:24
    at processTicksAndRejections (node:internal/process/task_queues:94:5)
    at PostgreSqlDriver.count (/Users/rodrigo/aloro/query-example/node_modules/@mikro-orm/knex/AbstractSqlDriver.js:140:21)
    at SqlEntityManager.count (/Users/rodrigo/aloro/query-example/node_modules/@mikro-orm/core/EntityManager.js:406:23)
    at countSubscriberWhere (/Users/rodrigo/aloro/query-example/src/entities/segment.entity.ts:76:13)
    at index (/Users/rodrigo/aloro/query-example/src/controlers/segments.controller.ts:11:23)

previous error: select count(distinct("e0"."id")) as "count" from "subscriber" as "e0" left join "message" as "e2" on "e0"."id" = "e2"."recipient_id" where "e1"."date_clicked" < '2021-03-10T01:04:39.146Z' and "e0"."owner_id" = 1 and not ("e2"."date_clicked" > '2021-03-10T01:04:39.146Z' and "e0"."owner_id" = 1) - missing FROM-clause entry for table "e1"
    at Parser.parseErrorMessage (/Users/rodrigo/aloro/query-example/node_modules/pg-protocol/src/parser.ts:357:11)
    at Parser.handlePacket (/Users/rodrigo/aloro/query-example/node_modules/pg-protocol/src/parser.ts:186:21)
    at Parser.parse (/Users/rodrigo/aloro/query-example/node_modules/pg-protocol/src/parser.ts:101:30)
    at Socket.<anonymous> (/Users/rodrigo/aloro/query-example/node_modules/pg-protocol/src/index.ts:7:48)
```
