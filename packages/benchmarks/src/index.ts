import { decodeUUID, encodeUUID } from 'encoding';
import { v4 } from 'uuid';
import { Client } from './client';
import { MAX_HEIGHT } from './config';
import { getGroupedByTrigger } from './message-log';
import { groupToLatency } from './message-processing';

// const client = new Client();

class UnexpectedResponseError extends Error {}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

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
  console.log(whiteboardId);
  // do serially for getNextMessage to work reliably
  for (const user of users) {
    await addClientToWhiteboard(host, user, whiteboardId);
  }
  return clients;
};

const createLine = async (client: Client) => {
  const id = encodeUUID(v4());
  await client.send({
    $case: 'createLine',
    createLine: {
      line: {
        id,
        points: [{ x: 0, y: 0 }]
      }
    }
  });
  return id;
};

const clientsN = parseInt(process.argv[2]);
console.log({ clientsN });

const runTest = async () => {
  const messageN = 1000;
  const [host, ...clients] = await setupWhiteboard(clientsN);

  const lineId = await createLine(host);
  const sendTimestamps = [];
  const promises = [];
  for (let i = 0; i < messageN; ++i) {
    sendTimestamps.push(process.hrtime.bigint());
    promises.push(
      host.send({
        $case: 'addPointsToLine',
        addPointsToLine: {
          lineId,
          points: [{ x: Math.floor(i / MAX_HEIGHT), y: i % MAX_HEIGHT }]
        }
      })
    );
    await sleep(50); // frequency of draw buffer flush
  }
  console.log('waiting for acks');
  await Promise.all(promises);
  await sleep(1000); // give some time for all clients to receive

  const grouped = getGroupedByTrigger();
  console.log(grouped);

  // const lineUpdateMessagesPerClient = clients
  //   .map(c => c.receivedMessages)
  //   .map(messageArray =>
  //     messageArray
  //       .filter(([_time, msg]) => msg.body?.$case === 'lineCreatedOrUpdated')
  //       .slice(1) // drop the first one, which is the result of line creation and not update
  //       .map(([time, _msg]) => time)
  //   );

  // const iterations = lodash
  //   .zip(...lineUpdateMessagesPerClient)
  //   .map(x => removeNullish(x));
  // const latencies = lodash
  //   .zip(sendTimestamps, iterations)
  //   .filter(x => x[0] !== undefined && x[1] !== undefined)
  //   .map(x => processIteration(x[0]!, removeNullish(x[1]!))); // a lot of forcing undefined out of types

  console.log('min;max;avg;');
  grouped.map(groupToLatency).forEach(l => {
    console.log([l.min, l.max, l.mean].map(x => x / 1000n).join(';'));
  });

  clients.forEach(c => c.socket.close());
  process.exit(0);
};
runTest();

const processIteration = (
  sendTimestamp: bigint,
  receivedMessageTimestamps: bigint[]
) => {};

// const create_whiteboard = (host: Client) => {
//   host.send({ $case: 'createWhiteboardRequest' });
// };
