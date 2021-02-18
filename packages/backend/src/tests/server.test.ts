import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import request from 'superwstest';
import server from '../server';

describe('WebSockeet server', () => {
  beforeEach(done => {
    server.listen(0, 'localhost', done);
  });

  afterEach(done => {
    // avoid errors of 'Cannot log after tests are done'
    setTimeout(() => server.close(done), 500);
  });

  it('communicates via websockets', async () => {
    await request(server).ws('/ws').expectText('hello').close().expectClosed();
  });
});
