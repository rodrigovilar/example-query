import { FilterQuery } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { Subscriber } from '../entities/subscriber.entity';
import { SegmentQueryJson, SegmentRuleJson } from '../types';
import { isString } from '../utils';
import { Account } from 'entities/account.entity';

interface SegmentFilterStrategy {
  process(query: SegmentRuleJson, owner: Account): FilterQuery<Subscriber>;
}

abstract class AbstractSegmentFilter implements SegmentFilterStrategy {
  process(query: SegmentRuleJson, owner: Account): FilterQuery<Subscriber> {
    if (!this.checkArgument(query)) {
      throw new Error(`Wrong query.argument type: ${JSON.stringify(query)}`);
    }
    let filter = this.createFilterQuery(query, owner);
    Object.assign(filter, { owner });
    if (query.not) {
      filter = { $not: filter };
    }
    return filter;
  }

  //default implementation returns true ever - overide to change this logic
  checkArgument(_query: SegmentRuleJson): boolean {
    return true;
  }

  abstract createFilterQuery(
    query: SegmentRuleJson,
    owner: Account
  ): FilterQuery<Subscriber>;
}

class DateSegmentFilter extends AbstractSegmentFilter {
  constructor(private structure: (date: Date) => FilterQuery<Subscriber>) {
    super();
  }

  checkArgument(query: SegmentRuleJson) {
    return isString(query.argument) || query.argument >= 0;
  }

  createFilterQuery(
    query: SegmentRuleJson,
    owner: Account
  ): FilterQuery<Subscriber> {
    let date = this.extractDateArgument(query);
    const filter = this.structure(date);
    Object.assign(filter, { owner });
    return filter;
  }

  private extractDateArgument(query: SegmentRuleJson): Date {
    if (isString(query.argument)) {
      return this.toJSDate(query.argument);
    }
    if (query.argument >= 0) {
      return new Date(Date.now() - query.argument);
    }
    throw new Error(`unrecognize date query argument: ${query.argument}`);
  }

  private toJSDate(dateString: string): Date {
    const date = DateTime.fromISO(dateString).toJSDate();
    if (!date || date.toString() === 'Invalid Date') {
      throw new Error(`malformed date: ${dateString}`);
    }
    return date;
  }
}

// TODO: POST api/v1/subscriber should send local time
class TimezoneSegmentFilter extends AbstractSegmentFilter {
  createFilterQuery(_query: SegmentRuleJson, _owner: Account) {
    return {};
  }
}

class LikeSegmentFilter extends AbstractSegmentFilter {
  constructor(
    private structure: (queryText: { $like: string }) => FilterQuery<Subscriber>
  ) {
    super();
  }

  checkArgument(query: SegmentRuleJson) {
    return isString(query.argument);
  }

  createFilterQuery(
    query: SegmentRuleJson,
    owner: Account
  ): FilterQuery<Subscriber> {
    const likeOp = { $like: `%${query.argument as string}%` };
    const filter = this.structure(likeOp);
    Object.assign(filter, { owner });
    return filter;
  }
}

const segmentFilters: Record<string, SegmentFilterStrategy> = {
  signupAfter: new DateSegmentFilter((date) => ({ createdAt: { $gt: date } })),
  signupBefore: new DateSegmentFilter((date) => ({ createdAt: { $lt: date } })),
  clickAfter: new DateSegmentFilter((date) => ({
    messages: { dateClicked: { $gt: date } },
  })),
  clickBefore: new DateSegmentFilter((date) => ({
    messages: { dateClicked: { $lt: date } },
  })),
  timezone: new TimezoneSegmentFilter(),
  messagesContain: new LikeSegmentFilter((likeOp) => ({
    messages: { body: likeOp },
  })),
};

export function getSegmentFilter(segmentType: string): SegmentFilterStrategy {
  const filter = segmentFilters[segmentType];
  if (filter) {
    return filter;
  }
  throw new Error(`Wrong query.segmentType: ${segmentType}`);
}

export const defaultSegments: (SegmentQueryJson & { name: string })[] = [
  {
    name: 'Clicked in the last 7 days',
    id: '',
    segmentType: 'clickAfter',
    argument: 604800,
  },
  {
    name: 'Clicked in the last 30 days',
    id: '',
    segmentType: 'clickAfter',
    argument: 2592000,
  },
  {
    name: 'Inactive (not clicked for 30 days)',
    id: '',
    segmentType: 'and',
    argument: [
      { id: '', segmentType: 'clickBefore', argument: 2592000 },
      { id: '', segmentType: 'clickAfter', argument: 2592000, not: true },
    ],
  },
  {
    name: 'Silent (never clicked)',
    id: '',
    segmentType: 'clickBefore',
    argument: 0,
    not: true,
  },
];
