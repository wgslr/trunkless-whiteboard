import { createContext } from 'react';
import { ServerToClientMessage } from '../protocol/protocol';
import { ProtobufSocketClient } from './protobuf-client';
import { ServerConnection } from './server-connection';

// TODO: set as env variable
const SERVER_URL = 'ws://localhost:3001/ws';

interface IServerContext {
  connection: ServerConnection;
}

const socket = new WebSocket(SERVER_URL);
export const serverConnection: IServerContext = {
  connection: new ServerConnection(socket)
};

const ServerContext = createContext(serverConnection);

export default ServerContext;
