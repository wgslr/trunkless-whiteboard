import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { ProtobufSocketClient } from './protobuf-client';
import * as uuid from 'uuid';
import { EventSharp } from '@material-ui/icons';

type Callback = (message: ServerToClientMessage['body'] | 'TIMEOUT') => void;

export class RequestResponseService {
  /** Map from a message id to response callback */
  // private messageIdToCallback: Map<string, Callback> = new Map();

  constructor(private protobufClient: ProtobufSocketClient) {}

  public send(body: ClientToServerMessage['body'], callback?: Callback) {
    const message = { messsageId: uuid.v4(), body };
    this.protobufClient.send(message);

    if (callback) {
      const eventHandler = (serverMessage: ServerToClientMessage) => {
        if (
          serverMessage.causedBy &&
          serverMessage.causedBy == message.messsageId
        ) {
          const callback = this.messageIdToCallback.get(message.causedBy);
          if (callback) {
            callback(message.body);
          }
        }
      };

      // this.messageIdToCallback.set(messageId, callback);

      this.protobufClient.addListener('message', eventHandler);
      this.protobufClient.
    }
  }
}
