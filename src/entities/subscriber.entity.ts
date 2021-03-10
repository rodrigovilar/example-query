import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  QueryOrder,
} from '@mikro-orm/core';
import { orm } from '../orm';
import { Account } from './account.entity';
import { BaseEntity } from './base.entity';
import { Message } from './message.entity';

@Entity()
export class Subscriber extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @OneToMany({
    entity: () => Message,
    mappedBy: 'recipient',
    orphanRemoval: true,
    orderBy: { createdAt: QueryOrder.ASC },
  })
  messages = new Collection<Message>(this);

  @ManyToOne(() => Account)
  owner!: Account;

  constructor(
    owner: Account
  ) {
    super();
    this.owner = owner;
  }

  static async create(
    account: Account,
  ): Promise<[boolean, Subscriber]> {
    let subscriber = await orm.em.findOne(Subscriber, {
      owner: account,
    });
    const alreadyCreated = !!subscriber;
    if (!subscriber) {
      subscriber = new Subscriber(account);
      subscriber.owner = account;
      orm.em.persist(subscriber);
      await orm.em.flush();
    }
    return [alreadyCreated, subscriber];
  }
}
