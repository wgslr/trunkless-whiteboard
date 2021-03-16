import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import request from 'superwstest';
import { countWhiteboards } from '../models/whiteboard';
import server from '../server';
import {
  CreateWhiteboardRequest,
  ClientToServerMessage
} from '../protocol/protocol';
import { v4 } from 'uuid';
import { encodeUUID } from 'encoding';

describe('WebSockeet server', () => {
  beforeEach(done => {
    server.listen(0, 'localhost', done);
  });

  afterEach(done => {
    // avoid errors of 'Cannot log after tests are done'
    setTimeout(() => server.close(done), 500);
  });

  it('communicates via websockets', async () => {
    await request(server).ws('/ws').close().expectClosed();
  });

  it('creates a whiteboard', async () => {
    const msg = ClientToServerMessage.encode({
      body: {
        $case: 'createWhiteboardRequest',
        createWhiteboardRequest: {}
      }
    }).finish();
    await request(server).ws('/ws').sendBinary(msg).close().expectClosed();
    expect(countWhiteboards()).toBe(1);
  });

  xit('conencting to nonexistent whiteboard returns error', async () => {
    const msg = ClientToServerMessage.encode({
      body: {
        $case: 'joinWhiteboard',
        joinWhiteboard: { whiteboardId: encodeUUID(v4()) }
      }
    }).finish();
    // FIXME check response
    await request(server).ws('/ws').sendBinary(msg).close().expectClosed();
    expect(countWhiteboards()).toBe(1); // TODO why is it still 1?
  });
});
