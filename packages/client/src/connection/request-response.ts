import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { ProtobufSocketClient } from './protobuf-client';
import * as uuid from 'uuid';

type Callback = (message: ServerToClientMessage['body'] | 'TIMEOUT') => void;

export class RequestResponseService {
  private messageIdToCallback: Map<string, Callback> = new Map();

  constructor(private protobufClient: ProtobufSocketClient) {}

  public send(body: ClientToServerMessage['body'], callback?: Callback) {
    const message = { messsageId: uuid.v4(), body };
    this.protobufClient.send(message);

    const eventHandler = ({ body }: Required<ServerToClientMessage>) => {
      // const data =
      // if ('causedBy' in data) {
      //   const causedBy = data.causedBy;
      // }
      // causedBy
    };

    if (callback) {
      // this.messageIdToCallback.set(messageId, callback);
    }
  }
}
