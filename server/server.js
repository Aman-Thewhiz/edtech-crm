import app from './app.js';
import { connectDatabase } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { env } from './config/env.js';

import { seedUsers } from './utils/seedUsers.js';
import { seedCourseCategories } from './utils/seedCourseCategories.js';
import { seedLeavePolicies } from './utils/seedLeavePolicies.js';

async function bootstrap() {
  await connectDatabase();
  await connectRedis();

 
  await seedUsers();
  await seedCourseCategories();
  await seedLeavePolicies();
  console.log("Database seeded successfully.");

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});