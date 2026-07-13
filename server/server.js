import app from './app.js';
import { connectDatabase } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDatabase();
  await connectRedis();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});