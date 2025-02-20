import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { jobs } from '../data/jobs.js';
import Job from '../models/Job.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert new jobs
    await Job.insertMany(jobs);
    console.log('Successfully seeded jobs');

    // Log the inserted jobs
    const insertedJobs = await Job.find({});
    console.log('Inserted jobs:', insertedJobs);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase(); 