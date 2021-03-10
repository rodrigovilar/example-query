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
