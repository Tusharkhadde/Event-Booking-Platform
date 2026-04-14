require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Event Schema (Minimal for migration)
const eventSchema = new mongoose.Schema({
  imageUrl: String,
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const events = await Event.find({
      imageUrl: { $ne: null },
      $nor: [{ imageUrl: /^http/ }] // Only find images that don't start with http
    });

    console.log(`Found ${events.length} events to migrate.`);

    for (const event of events) {
      const localPath = path.join(process.cwd(), 'public/uploads', event.imageUrl);
      
      if (fs.existsSync(localPath)) {
        console.log(`Uploading ${event.imageUrl}...`);
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'events',
        });
        
        console.log(`Successfully uploaded. New URL: ${result.secure_url}`);
        
        event.imageUrl = result.secure_url;
        await event.save();
        console.log(`Updated database record for event ${event._id}`);
      } else {
        console.warn(`File not found locally: ${localPath}`);
      }
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

migrate();
