import * as uuid from 'uuid';
import { SERVER_RESPONSE_TIMEOUT } from '../config';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { ProtobufSocketClient } from './protobuf-client';

type Callback = (message: ServerToClientMessage['body'] | 'timeout') => void;

export class RequestResponseService {
  constructor(private protobufClient: ProtobufSocketClient) {}

  public send(body: ClientToServerMessage['body'], callback?: Callback) {
    // callback - invoked when server sends a response

    const message = { messsageId: uuid.v4(), body };
    this.protobufClient.send(message);

    if (callback) {
      this.setupResponseHandler(message.messsageId, callback);
    }
  }

  private setupResponseHandler(messageId: string, callback: Callback) {
    let serverResponded = false;
    const eventHandler = (serverMessage: ServerToClientMessage) => {
      if (serverMessage.causedBy && serverMessage.causedBy == messageId) {
        this.protobufClient.removeListener('message', eventHandler);
        serverResponded = true;
        callback(serverMessage.body);
      }
    };

    this.protobufClient.addListener('message', eventHandler);

    setTimeout(() => {
      if (!serverResponded) {
        this.protobufClient.removeListener('message', eventHandler);
        console.log('Timeout on awaiting server response');
        callback('timeout');
      }
    }, SERVER_RESPONSE_TIMEOUT);
  }
}
