import CourseCategory from '../models/CourseCategory.js';

const categories = [
  'Technology',
  'Business',
  'Design',
  'Finance',
  'Data Science',
  'Marketing',
];

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function seedCourseCategories() {
  for (const name of categories) {
    const slug = toSlug(name);
    await CourseCategory.updateOne(
      { slug },
      { $setOnInsert: { name, slug }, $set: { isActive: true } },
      { upsert: true },
    );
  }
}