import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { orm } from '../orm';
import { BaseEntity } from './base.entity';
import { isSegmentCondition, JwtAccount, SegmentQueryJson } from '../types';
import { Subscriber } from './subscriber.entity';
import { generateClientId, getSimpleDecodedHash, hash } from '../utils';
import { Segment } from './segment.entity';
import { defaultSegments } from '../logic/segmentStrategy';

@Entity()
export class Account extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  email!: string;

  @Property()
  @Unique()
  clientId!: string;

  @Property({ length: 500, hidden: true })
  hash!: string;

  @Property({ length: 5000, hidden: true })
  salt!: string;


  @OneToMany({
    entity: () => Subscriber,
    mappedBy: 'owner',
    orphanRemoval: true,
  })
  subscribers = new Collection<Subscriber>(this);

  constructor(
    email: string,
    hash: string,
    salt: string,
  ) {
    super();
    this.email = email;
    this.hash = hash;
    this.salt = salt;
    this.clientId = generateClientId();
  }

  static async signup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Account> {
    const result = await Account.validateAndHashPassword(password);
    const account = new Account(
      email,
      Buffer.from(result.hash).toString('base64'),
      result.salt
    );
    orm.em.persist(account);
    Account.createDefaultSegments(account);
    await orm.em.flush();
    return account;
  }

  static validateAndHashPassword(
    password: string
  ): Promise<{ salt: string; hash: string }> {
    if (password.length < 7) {
      throw new Error('Password should be at least 7 characters long');
    }
    return hash(password);
  }

  async isValidPassword(password: string): Promise<boolean | Account> {
    if (this.salt && this.hash) {
      const computedHashString = await getSimpleDecodedHash(
        password,
        this.salt
      );
      if (computedHashString === this.hash) {
        return this;
      }
    }
    return false;
  }

  asJwt(): JwtAccount {
    return {
      accountType: 'account',
      id: this.id,
      email: this.email,
      clientId: this.clientId,
      subscribeMessage: '',
      confirmationMessage: '',
      firstMessage: '',
      firstMessageLink: '',
    };
  }

  private static async createDefaultSegments(account: Account): Promise<void> {
    for (const { name: segmentName, ...segmentQuery } of defaultSegments) {
      Account.populateIds(segmentQuery);
      const segment = new Segment(segmentName, segmentQuery, account);
      orm.em.persist(segment);
    }
  }

  private static populateIds(segmentQuery: SegmentQueryJson) {
    segmentQuery.id = generateClientId();
    if (isSegmentCondition(segmentQuery)) {
      const segmentCondition = segmentQuery;
      for (const childSegment of segmentCondition.argument) {
        Account.populateIds(childSegment);
      }
    }
  }

}

declare global {
  namespace Express {
      interface Request {
          account?: Account;
      }
  }
}
