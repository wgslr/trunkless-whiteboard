import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import request from 'superwstest';
import { countWhiteboards } from '../models/whiteboard';
import server from '../server';
import { CreateWhiteboardRequest, MessageWrapper } from '../protocol/protocol';

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
    const msg = MessageWrapper.encode(
      MessageWrapper.fromPartial({
        createWhiteboardRequest: {}
      })
    ).finish();
    await request(server).ws('/ws').sendBinary(msg).close().expectClosed();
    expect(countWhiteboards()).toBe(1);
  });
});
