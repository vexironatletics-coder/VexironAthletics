import { createApp } from './createApp';
import { startBackendServices } from './startServices';
import logger from './config/logger';

const app = createApp();
const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server running on port ${PORT}`);
  logger.debug(`Health check: http://localhost:${PORT}/api/health`);

  startBackendServices().catch((err) => logger.error(err, 'Background services failed to start'));
});

export default app;
