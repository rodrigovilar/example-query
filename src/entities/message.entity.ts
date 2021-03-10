import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Subscriber } from './subscriber.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  body!: string;

  @Property({ nullable: true })
  dateClicked?: Date;

  @ManyToOne(() => Subscriber)
  recipient!: Subscriber;

  constructor(body: string, recipient: Subscriber) {
    super();
    this.recipient = recipient;
    this.body = body;
  }
}
