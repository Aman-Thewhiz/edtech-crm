import Settings from '../models/Settings.js';

export async function getSettings() {
  let settings = await Settings.findOne({ isDeleted: false });
  if (!settings) {
    // Create default settings if not found
    settings = await Settings.create({
      instituteName: 'EduFlow CRM Institute',
    });
  }
  return settings;
}

export async function updateSettings(data) {
  const settings = await Settings.findOneAndUpdate(
    { isDeleted: false },
    { $set: data },
    { new: true, upsert: true }
  );
  return settings;
}
