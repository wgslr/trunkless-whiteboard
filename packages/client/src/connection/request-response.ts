import * as uuid from 'uuid';
import { SERVER_RESPONSE_TIMEOUT } from '../config';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { ProtobufSocketClient } from './protobuf-client';

type Callback = (message: ServerToClientMessage['body'] | 'timeout') => void;

export class RequestResponseService {
  private messageIdToResponseHandler: Map<
    NonNullable<ServerToClientMessage['causedBy']>,
    Callback
  > = new Map();

  constructor(private protobufClient: ProtobufSocketClient) {
    const callResponeHandlerIfPresent = (
      message: ServerToClientMessage
    ): void => {
      const { causedBy } = message;
      if (causedBy) {
        const handler = this.messageIdToResponseHandler.get(causedBy);
        if (handler) {
          handler(message.body);
        }
      }
    };

    this.protobufClient.addListener('message', callResponeHandlerIfPresent);
  }

  public send(body: ClientToServerMessage['body'], callback?: Callback) {
    // callback - invoked when server sends a response

    const message = { messsageId: uuid.v4(), body };
    this.protobufClient.send(message);

    if (callback) {
      this.setupResponseHandler(message.messsageId, callback);
    }
  }

  private setupResponseHandler(messageId: string, callback: Callback) {
    this.messageIdToResponseHandler.set(messageId, msg => {
      this.messageIdToResponseHandler.delete(messageId);
      callback(msg);
    });
    setTimeout(() => {
      if (this.messageIdToResponseHandler.delete(messageId)) {
        console.warn('Timeout on awaiting server response');
        callback('timeout');
      }
    }, SERVER_RESPONSE_TIMEOUT);
  }
}
