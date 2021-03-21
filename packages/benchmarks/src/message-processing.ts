import { ReceivedMessage, SentMessage } from './message-log';

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
  const minLatency = min(deltas);
  const maxLatency = max(deltas);
  const meanLatency = avg(deltas);
  return {
    min: minLatency,
    max: maxLatency,
    mean: meanLatency
  };
};

const sum = (arr: bigint[]) => arr.reduce((acc, x) => acc + x, BigInt(0));
const avg = (arr: bigint[]) => sum(arr) / BigInt(arr.length);
const max = (arr: bigint[]) => arr.reduce((m, e) => (e > m ? e : m));
const min = (arr: bigint[]) => arr.reduce((m, e) => (e < m ? e : m));
