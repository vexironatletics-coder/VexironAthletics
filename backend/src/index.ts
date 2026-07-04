import http from 'http';
import { createApp } from './createApp';
import { startBackendServices } from './startServices';
import { initSocketServer } from './socket';
import logger from './config/logger';

const app = createApp();
const PORT = process.env.PORT ?? 5000;

/** Socket.IO requires the underlying HTTP server — not app.listen() alone */
const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  logger.info({ port: PORT }, `Server running on port ${PORT}`);
  logger.debug(`Health check: http://localhost:${PORT}/api/health`);
  logger.debug(`Socket.IO: ws://localhost:${PORT}/socket.io`);

  startBackendServices().catch((err) => logger.error(err, 'Background services failed to start'));
});

export default app;
