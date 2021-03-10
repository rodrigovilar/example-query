import path from 'path';
let config: any;

if (process.env.DATABASE_URL) {
  config = {
    entities: ['dist/entities/*.entity.js'],
    type: 'postgresql',
    clientUrl: process.env.DATABASE_URL,
    port: 5432,
    baseDir: path.join(__dirname, '..'),
    migrations: { disableForeignKeys: false }, // https://github.com/mikro-orm/mikro-orm/issues/190
  };
} else {
  config = {
    entities: ['dist/entities/*.entity.js'],
    type: 'postgresql',
    dbName: 'postgres',
    user: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    password: 'example',
    baseDir: path.join(__dirname, '..'),
  };
}

export default config;
