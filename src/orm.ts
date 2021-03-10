import { MikroORM } from '@mikro-orm/core';
import dbConfig from './mikro-orm.config';

export let orm: MikroORM;

export async function initOrm() {
  if (!orm) {
    orm = await MikroORM.init(dbConfig as any);
  } else {
    throw new Error('mikro orm already initialized');
  }
  return orm;
}
