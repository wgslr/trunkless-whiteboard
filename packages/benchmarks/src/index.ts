import { decodeUUID, encodeUUID } from 'encoding';
import { v4 } from 'uuid';
import { Client } from './client';
import { MAX_HEIGHT } from './config';
import { getGroupedByTrigger } from './message-log';
import { groupToLatency, groupToBufferAmount } from './message-processing';
import fp from 'lodash/fp';
import fs from 'fs';

class UnexpectedResponseError extends Error {}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const doHandshake = async (client: Client) =>
  await client.send({
    $case: 'clientHello',
    clientHello: { username: client.name }
  });

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
if (isNaN(clientsN)) {
  console.error('Requires at least one numeric parameter.');
  process.exit(1);
}

const defaultOutputFile = `${new Date()
  .toISOString()
  .replace(/:/g, '-')}_out.csv`;
const outputFile = process.argv[3] || defaultOutputFile;
const log = (message: string) =>
  outputFile === '-'
    ? fs.appendFileSync(outputFile, message + '\n')
    : console.log(message);

const runTest = async () => {
  const messageN = 1000;
  const clients = await setupWhiteboard(clientsN);

  const lineId = await createLine(clients[0]);
  const promises = [];
  for (let i = 0; i < messageN; ++i) {
    for (let j = 0; j < clientsN; ++j) {
      promises.push(
        clients[j].send({
          $case: 'addPointsToLine',
          addPointsToLine: {
            lineId,
            points: [{ x: Math.floor(i / MAX_HEIGHT), y: i % MAX_HEIGHT }]
          }
        })
      );
    }
    await sleep(50); // frequency of draw buffer flush
  }
  await Promise.all(promises);
  await sleep(1000); // give some time for all clients to receive

  const grouped = getGroupedByTrigger().filter(
    g => g.sent.message.body?.$case === 'addPointsToLine'
  );
  if (grouped.length > 0) {
    const t0 = fp.min(grouped.map(g => g.sent.timestamp))!;

    log(
      't,latency_min,latency_max,latency_avg,buffer_min,buffer_max,buffer_avg'
    );
    grouped.forEach(g => {
      const l = groupToLatency(g);
      const k = groupToBufferAmount(g);
      log(
        [g.sent.timestamp - t0, l.min, l.max, l.mean, k.min, k.mean, k.max]
          .map(x => BigInt(x)! / 1000n) // convert to microsecond
          .join(',')
      );
    });
  }

  clients.forEach(c => c.socket.close());
  process.exit(0);
};

runTest();
