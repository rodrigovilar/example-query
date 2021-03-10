import { Dictionary, Property, wrap } from '@mikro-orm/core';
import { orm } from '../orm';

export abstract class BaseEntity {
  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  merge(dict: Dictionary) {
    wrap(this).assign(dict, { em: orm.em });
  }
}
