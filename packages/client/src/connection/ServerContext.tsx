import { createContext } from 'react';
import { SERVER_URL } from '../config';
import { ServerToClientMessage } from '../protocol/protocol';
import { ProtobufSocketClient } from './protobuf-client';
import { RequestResponseService } from './request-response';
import { ServerConnection } from './server-connection';

interface IServerContext {
  connection: ServerConnection;
}

const socket = new WebSocket(SERVER_URL);
export const serverConnection: IServerContext = {
  connection: new ServerConnection(socket)
};

export const reqResponseService = new RequestResponseService(
  new ProtobufSocketClient(socket)
);

const ServerContext = createContext(serverConnection);

export default ServerContext;
