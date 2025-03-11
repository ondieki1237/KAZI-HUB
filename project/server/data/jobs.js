import mongoose from 'mongoose';

// Create some dummy employer IDs (you should replace these with actual user IDs from your database)
const employerIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId()
];

export const jobs = [
  {
    title: "Plumbing Repair",
    description: "Need an experienced plumber to fix a leaking pipe and install new fixtures in the bathroom.",
    category: "Plumbing",
    locationArea: "Westlands",
    locationCity: "Nairobi",
    budget: 15000,
    status: "open",
    employerId: employerIds[0],
    requirements: {
      isRemote: false,
      numberOfOpenings: 1,
      isConfidential: false
    },
    skillsRequired: ["Plumbing", "Pipe fitting", "Fixture installation"],
    duration: "2 days",
    applications: []
  },
  {
    title: "Electrical Installation",
    description: "Looking for an electrician to install new wiring and fixtures in a 3-bedroom house.",
    category: "Electrical",
    locationArea: "Kilimani",
    locationCity: "Nairobi",
    budget: 25000,
    status: "open",
    employerId: employerIds[1],
    requirements: {
      isRemote: false,
      numberOfOpenings: 2,
      isConfidential: false
    },
    skillsRequired: ["Electrical wiring", "Circuit installation", "Safety protocols"],
    duration: "3 days",
    applications: []
  },
  {
    title: "House Painting",
    description: "Need professional painters for interior and exterior painting of a residential house.",
    category: "Painting",
    locationArea: "Kileleshwa",
    locationCity: "Nairobi",
    budget: 35000,
    status: "open",
    employerId: employerIds[2],
    requirements: {
      isRemote: false,
      numberOfOpenings: 3,
      isConfidential: false
    },
    skillsRequired: ["Interior painting", "Exterior painting", "Surface preparation"],
    duration: "5 days",
    applications: []
  },
  {
    title: "Garden Maintenance",
    description: "Looking for a gardener for regular maintenance of home garden and lawn care.",
    category: "Gardening",
    locationArea: "Karen",
    locationCity: "Nairobi",
    budget: 8000,
    status: "open",
    employerId: employerIds[0],
    requirements: {
      isRemote: false,
      numberOfOpenings: 1,
      isConfidential: false
    },
    skillsRequired: ["Lawn maintenance", "Plant care", "Pruning"],
    duration: "Weekly",
    applications: []
  },
  {
    title: "Carpentry Work",
    description: "Need a carpenter to build custom furniture and fix wooden fixtures.",
    category: "Carpentry",
    locationArea: "Lavington",
    locationCity: "Nairobi",
    budget: 40000,
    status: "open",
    employerId: employerIds[1],
    requirements: {
      isRemote: false,
      numberOfOpenings: 1,
      isConfidential: false
    },
    skillsRequired: ["Woodworking", "Furniture making", "Cabinet installation"],
    duration: "4 days",
    applications: []
  }
]; 