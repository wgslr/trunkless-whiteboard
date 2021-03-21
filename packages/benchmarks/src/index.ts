import { Client } from './client';
import { decodeUUID, encodeUUID } from 'encoding';

// const client = new Client();

class UnexpectedResponseError extends Error {}

const doHandshake = async (client: Client) => {
  return await client.send({
    $case: 'clientHello',
    clientHello: { username: client.name }
  });
};

const createWhiteboard = async (client: Client) => {
  const result = await client.send({
    $case: 'createWhiteboardRequest',
    createWhiteboardRequest: {}
  });
  if (result?.$case !== 'whiteboardCreated') {
    throw new UnexpectedResponseError();
  }
  return decodeUUID(result.whiteboardCreated.whiteboardId);
};

const addClientToWhiteboard = async (
  host: Client,
  client: Client,
  whiteboardId: string
) => {
  // do not await, or we will be late for setting watch for host's message
  client.send({
    $case: 'joinWhiteboard',
    joinWhiteboard: { whiteboardId: encodeUUID(whiteboardId) }
  });
  let msg;
  do {
    msg = await host.getNextMessage();
  } while (msg?.$case != 'clientWantsToJoin');
  const clientId = msg.clientWantsToJoin.clientId;

  await host.send({
    $case: 'approveOrDenyJoin',
    approveOrDenyJoin: { approve: true, clientId }
  });
};

const setupWhiteboard = async (clientsNum: number) => {
  const clients = [...Array(clientsNum).keys()].map(() => new Client());
  const [host, ...users] = clients;
  await Promise.all(
    clients.map(async c => {
      await c.ensureConnected();
      await doHandshake(c);
    })
  );
  const whiteboardId = await createWhiteboard(host);
  // do serially for getNextMessage to work reliably
  for (const user of users) {
    await addClientToWhiteboard(host, user, whiteboardId);
  }
  return clients;
};

const runTest = async () => {
  const clients = await setupWhiteboard(4);
  clients.forEach(c => c.socket.close());
  process.exit(0);
};
runTest();

// const create_whiteboard = (host: Client) => {
//   host.send({ $case: 'createWhiteboardRequest' });
// };
