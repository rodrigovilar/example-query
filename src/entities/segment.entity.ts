import {
  BeforeCreate,
  BeforeUpdate,
  Entity,
  FilterQuery,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { orm } from '../orm';
import { Account } from './account.entity';
import { BaseEntity } from './base.entity';
import { SegmentQueryJson, isSegmentRule, isSegmentCondition } from '../types';
import { getSegmentFilter } from '../logic/segmentStrategy';
import { Subscriber } from './subscriber.entity';

@Entity()
export class Segment extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  query!: SegmentQueryJson;

  @ManyToOne(() => Account)
  owner!: Account;

  @Property({ persist: false })
  count?: number;

  @Property({ persist: false })
  subscribers?: Subscriber[];

  constructor(name: string, query: SegmentQueryJson, owner: Account) {
    super();
    this.name = name;
    this.query = query;
    this.owner = owner;
  }

  async getSubscribers(): Promise<Subscriber[]> {
    const where = this.buildFilterQuery();
    return await orm.em.find(Subscriber, where);
  }

  countSubscribers(): Promise<number> {
    return countSubscriberWhere(this.buildFilterQuery());
  }

  async containsSubscriber(subscriberId: number) {
    const where = this.buildFilterQuery();
    Object.assign(where, { id: subscriberId });
    return (await countSubscriberWhere(where)) > 0;
  }

  buildFilterQuery(): FilterQuery<Subscriber> {
    return buildFilterQueryRec(this.query, this.owner);
  }

  @BeforeUpdate()
  @BeforeCreate()
  validate() {
    // try to build the query to validate it
    this.buildFilterQuery();
  }
}

async function countSubscriberWhere(
  where: FilterQuery<Subscriber>
): Promise<number> {
  let count = 0;
  try {
    count = await orm.em.count(Subscriber, where);
  } catch (err) {
    console.error(err);
  }
  return count;
}

function buildFilterQueryRec(
  query: SegmentQueryJson,
  owner: Account
): FilterQuery<Subscriber> {
  if (isSegmentCondition(query)) {
    return {
      [`$${query.segmentType}`]: query.argument.map((qs) =>
        buildFilterQueryRec(qs, owner)
      ),
    };
  } else if (isSegmentRule(query)) {
    return getSegmentFilter(query.segmentType).process(query, owner);
  }
  throw new Error(`unrecognize query segment: ${query}`);
}
