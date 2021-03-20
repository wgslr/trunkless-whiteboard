import { createContext } from 'react';
import { SERVER_URL } from '../config';
import {
  handleConnected,
  handleDisconnected,
  handleMessage
} from './incoming-handler';
import { ProtobufSocketClient } from './protobuf-client';
import { RequestResponseService } from './request-response';

interface IServerContext {
  reqRespService: RequestResponseService;
}

const client = new ProtobufSocketClient(SERVER_URL);
client.addListener('message', handleMessage);
client.addListener('connected', handleConnected);
client.addListener('disconnected', handleDisconnected);

export const reqResponseService = new RequestResponseService(client);

export const contextValue: IServerContext = {
  reqRespService: reqResponseService
};
const ServerContext = createContext(contextValue);

export default ServerContext;
