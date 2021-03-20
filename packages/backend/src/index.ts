import server from './server';
import logger from './lib/logger';

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => logger.info(`Listening on ${PORT}`));
