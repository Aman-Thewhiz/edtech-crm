import { connectDatabase } from './config/db.js';
import { seedCourseCategories } from './utils/seedCourseCategories.js';
import { seedUsers } from './utils/seedUsers.js';
import { seedLeavePolicies } from './utils/seedLeavePolicies.js';

async function run() {
  await connectDatabase();
  await seedUsers();
  await seedCourseCategories();
  await seedLeavePolicies();
  console.log('Seed complete');
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});