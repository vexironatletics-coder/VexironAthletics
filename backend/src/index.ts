import { createApp } from './createApp';
import { startBackendServices } from './startServices';

const app = createApp();
const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  startBackendServices().catch(() => undefined);
});

export default app;
