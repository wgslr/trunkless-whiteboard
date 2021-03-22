import { ReceivedMessage, SentMessage } from './message-log';
import fp from 'lodash/fp';

export type Group = {
  sent: SentMessage;
  received: ReceivedMessage[];
};

export const groupByTrigger = (
  sent: SentMessage[],
  received: ReceivedMessage[]
): Group[] =>
  sent.map(s => ({
    sent: s,
    received: received.filter(x => x.message.causedBy === s.message.messageId)
  }));

export const groupToLatency = (group: Group) => {
  const deltas = group.received.map(r => r.timestamp - group.sent.timestamp);
  const minLatency = fp.min(deltas);
  const maxLatency = fp.max(deltas);
  const meanLatency = avg(deltas);
  return {
    min: minLatency,
    max: maxLatency,
    mean: meanLatency
  };
};

const sum = (arr: bigint[]): bigint => arr.reduce((acc, x) => acc + x);
const avg = (arr: bigint[]): bigint => sum(arr) / BigInt(arr.length);
