
export interface JwtUser {
  accountType: 'user';
  id: number;
  email: string;
}

export interface JwtAccount {
  accountType: 'account';
  id: number;
  email: string;
  clientId: string;
  subscribeMessage: string;
  confirmationMessage: string;
  firstMessage?: string;
  firstMessageLink?: string;
}

export type SegmentQueryJson = SegmentConditionJson | SegmentRuleJson;

export interface SegmentConditionJson {
  id: string;
  segmentType: segmentConditionType;
  argument: SegmentQueryJson[];
}
export interface SegmentRuleJson {
  id: string;
  segmentType: segmentType;
  argument: string | number;
  not?: boolean;
}

export type segmentType =
  | 'signupAfter'
  | 'signupBefore'
  | 'tag'
  | 'clickAfter'
  | 'clickBefore'
  | 'deviceType'
  | 'timezone';

export type segmentConditionType = 'and' | 'or';

export function isSegmentRule(
  query: SegmentQueryJson
): query is SegmentRuleJson {
  const segmentType = (query as SegmentConditionJson).segmentType;
  return segmentType !== 'and' && segmentType !== 'or';
}

export function isSegmentCondition(
  query: SegmentQueryJson
): query is SegmentConditionJson {
  return (
    !!query.id &&
    ['or', 'and'].includes(query.segmentType) &&
    Array.isArray(query.argument)
  );
}

