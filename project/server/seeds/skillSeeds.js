import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import dotenv from 'dotenv';

dotenv.config();

const skillSeeds = [
  {
    skillDescription: "Professional Carpentry and Furniture Making",
    isGroup: false,
    availability: "Monday-Friday, 8 AM - 6 PM",
    charges: 2500,
    contact: {
      phone: "+254 712 345 678",
      email: "carpenter1@example.com",
      location: "Nairobi CBD"
    },
    pastWorkFiles: ["furniture1.jpg", "furniture2.jpg"]
  },
  {
    skillDescription: "Expert Plumbing Services",
    isGroup: true,
    groupName: "Mombasa Master Plumbers",
    availability: "24/7 Emergency Service",
    charges: 3000,
    contact: {
      phone: "+254 723 456 789",
      email: "plumbers@example.com",
      website: "www.mombasaplumbers.com",
      location: "Mombasa"
    },
    pastWorkFiles: ["plumbing1.jpg"]
  },
  {
    skillDescription: "Electrical Installation and Repairs",
    isGroup: false,
    availability: "Flexible Hours",
    charges: 2000,
    contact: {
      phone: "+254 734 567 890",
      email: "electrician@example.com",
      location: "Kisumu"
    }
  },
  {
    skillDescription: "Professional Painting Services",
    isGroup: true,
    groupName: "Nakuru Painters Association",
    availability: "Monday-Saturday, 7 AM - 5 PM",
    charges: 1500,
    contact: {
      phone: "+254 745 678 901",
      location: "Nakuru"
    }
  },
  {
    skillDescription: "Masonry and Building Works",
    isGroup: true,
    groupName: "Eldoret Builders",
    availability: "Full-time",
    charges: 3500,
    contact: {
      phone: "+254 756 789 012",
      email: "builders@example.com",
      location: "Eldoret"
    }
  },
  {
    skillDescription: "Landscaping and Gardening",
    isGroup: false,
    availability: "Weekends",
    charges: 1800,
    contact: {
      phone: "+254 767 890 123",
      location: "Karen, Nairobi"
    }
  },
  {
    skillDescription: "Welding and Metal Works",
    isGroup: true,
    groupName: "Thika Welders Union",
    availability: "Monday-Friday, 8 AM - 5 PM",
    charges: 2800,
    contact: {
      phone: "+254 778 901 234",
      email: "welders@example.com",
      location: "Thika"
    }
  },
  {
    skillDescription: "CCTV Installation",
    isGroup: false,
    availability: "On-Call",
    charges: 4000,
    contact: {
      phone: "+254 789 012 345",
      website: "www.securitypro.com",
      location: "Westlands, Nairobi"
    }
  },
  {
    skillDescription: "Solar Panel Installation",
    isGroup: true,
    groupName: "Green Energy Solutions",
    availability: "Monday-Saturday, 9 AM - 6 PM",
    charges: 5000,
    contact: {
      phone: "+254 790 123 456",
      email: "solar@example.com",
      website: "www.greenenergy.com",
      location: "Machakos"
    }
  },
  {
    skillDescription: "Tiling and Flooring",
    isGroup: false,
    availability: "Flexible Schedule",
    charges: 2200,
    contact: {
      phone: "+254 701 234 567",
      location: "Kitengela"
    }
  }
];

// Function to seed the database
const seedSkills = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');

    // Add userId to each skill (you'll need to create a test user first)
    const testUserId = '65c8f1e6c52d9b7f23a93e13'; // Replace with a valid user ID from your database
    const skillsWithUserId = skillSeeds.map(skill => ({
      ...skill,
      userId: testUserId
    }));

    // Insert new skills
    await Skill.insertMany(skillsWithUserId);
    console.log('Successfully seeded skills');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedSkills(); 