/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('../connect');

const seedDir = __dirname;

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Get all JSON files
    const files = fs.readdirSync(seedDir).filter(file => file.endsWith('.json'));

    let seededCount = 0;
    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(seedDir, file);

      try {
        const fileContent = fs.readFileSync(filePath, 'utf8').trim();
        
        // Skip empty files
        if (!fileContent) {
          console.log(`⊘ ${collectionName} is empty (skipped)`);
          continue;
        }

        const data = JSON.parse(fileContent);

        // Get or create collection
        const collection = mongoose.connection.collection(collectionName);

        // Clear existing data
        await collection.deleteMany({});
        console.log(`✓ Cleared ${collectionName}`);

        // Insert new data
        if (Array.isArray(data) && data.length > 0) {
          await collection.insertMany(data);
          console.log(`✓ Seeded ${collectionName} with ${data.length} records`);
          seededCount++;
        } else {
          console.log(`✓ ${collectionName} is empty (no data to seed)`);
        }
      } catch (err) {
        console.error(`✗ Error seeding ${collectionName}:`, err.message);
      }
    }

    console.log(`\n✅ Database seeding complete! (${seededCount} collections seeded)`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

// Wait for connection before seeding
mongoose.connection.on('connected', () => {
  seedDatabase();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
