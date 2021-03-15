import { createContext } from 'react';
import { SERVER_URL } from '../config';
import { ServerToClientMessage } from '../protocol/protocol';
import { handleMessage } from './incoming-handler';
import { ProtobufSocketClient } from './protobuf-client';
import { RequestResponseService } from './request-response';

interface IServerContext {
  reqRespService: RequestResponseService;
}

const socket = new WebSocket(SERVER_URL);
const client = new ProtobufSocketClient(socket);
client.addListener('message', handleMessage);

export const reqResponseService = new RequestResponseService(client);

export const contextValue: IServerContext = {
  reqRespService: reqResponseService
};
const ServerContext = createContext(contextValue);

export default ServerContext;
