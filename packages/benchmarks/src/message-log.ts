import { groupByTrigger } from './message-processing';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from './protocol/protocol';

export type SentMessage = {
  timestamp: bigint;
  clientName: string;
  message: ClientToServerMessage;
  bufferBeforeSending: number;
};

export type ReceivedMessage = {
  timestamp: bigint;
  clientName: string;
  message: ServerToClientMessage;
  bufferAfterSending: number;
};

export const sentMessages: SentMessage[] = [];
export const receivedMessages: ReceivedMessage[] = [];

export const getGroupedByTrigger = () =>
  groupByTrigger(sentMessages, receivedMessages);
