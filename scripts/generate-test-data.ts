/**
 * Test Data Generator
 * 
 * This script generates realistic test data for the CareUnity application.
 * It creates users, service users, care plans, allocations, and other entities
 * needed for comprehensive testing.
 */

import { db } from '../server/db';
import { users, serviceUsers, carePlans, careAllocations, visits, documents } from '../shared/schema';
import { hash } from 'bcrypt';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const CONFIG = {
  // Number of entities to create
  counts: {
    users: 50,
    serviceUsers: 100,
    carePlans: 150,
    careAllocations: 200,
    visits: 500,
    documents: 300,
  },
  // Roles distribution (percentage)
  roles: {
    admin: 5,
    manager: 10,
    caregiver: 70,
    family: 15,
  },
  // Password for all test users
  password: 'TestPassword123!',
  // Date range for data
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31'),
  },
};

/**
 * Main function to generate test data
 */
async function generateTestData() {
  console.log('Starting test data generation...');
  
  // Hash the password once for all users
  const hashedPassword = await hash(CONFIG.password, 10);
  
  // Generate users
  console.log(`Generating ${CONFIG.counts.users} users...`);
  const generatedUsers = await generateUsers(CONFIG.counts.users, hashedPassword);
  console.log('Users generated successfully.');
  
  // Generate service users
  console.log(`Generating ${CONFIG.counts.serviceUsers} service users...`);
  const generatedServiceUsers = await generateServiceUsers(CONFIG.counts.serviceUsers);
  console.log('Service users generated successfully.');
  
  // Generate care plans
  console.log(`Generating ${CONFIG.counts.carePlans} care plans...`);
  const generatedCarePlans = await generateCarePlans(
    CONFIG.counts.carePlans,
    generatedServiceUsers
  );
  console.log('Care plans generated successfully.');
  
  // Generate care allocations
  console.log(`Generating ${CONFIG.counts.careAllocations} care allocations...`);
  const generatedCareAllocations = await generateCareAllocations(
    CONFIG.counts.careAllocations,
    generatedUsers.filter(user => user.role === 'caregiver'),
    generatedServiceUsers,
    generatedCarePlans
  );
  console.log('Care allocations generated successfully.');
  
  // Generate visits
  console.log(`Generating ${CONFIG.counts.visits} visits...`);
  await generateVisits(
    CONFIG.counts.visits,
    generatedCareAllocations
  );
  console.log('Visits generated successfully.');
  
  // Generate documents
  console.log(`Generating ${CONFIG.counts.documents} documents...`);
  await generateDocuments(
    CONFIG.counts.documents,
    generatedServiceUsers,
    generatedUsers
  );
  console.log('Documents generated successfully.');
  
  console.log('Test data generation completed successfully!');
}

/**
 * Generate users with different roles
 */
async function generateUsers(count: number, hashedPassword: string) {
  const generatedUsers = [];
  
  // Calculate counts for each role
  const adminCount = Math.floor(count * (CONFIG.roles.admin / 100));
  const managerCount = Math.floor(count * (CONFIG.roles.manager / 100));
  const caregiverCount = Math.floor(count * (CONFIG.roles.caregiver / 100));
  const familyCount = count - adminCount - managerCount - caregiverCount;
  
  // Generate admins
  for (let i = 0; i < adminCount; i++) {
    const user = {
      id: uuidv4(),
      name: faker.person.fullName(),
      email: `admin-${i}@careunity.test`,
      password: hashedPassword,
      role: 'admin',
      createdAt: faker.date.between({ from: CONFIG.dateRange.start, to: CONFIG.dateRange.end }),
    };
    generatedUsers.push(user);
  }
  
  // Generate managers
  for (let i = 0; i < managerCount; i++) {
    const user = {
      id: uuidv4(),
      name: faker.person.fullName(),
      email: `manager-${i}@careunity.test`,
      password: hashedPassword,
      role: 'manager',
      createdAt: faker.date.between({ from: CONFIG.dateRange.start, to: CONFIG.dateRange.end }),
    };
    generatedUsers.push(user);
  }
  
  // Generate caregivers
  for (let i = 0; i < caregiverCount; i++) {
    const user = {
      id: uuidv4(),
      name: faker.person.fullName(),
      email: `caregiver-${i}@careunity.test`,
      password: hashedPassword,
      role: 'caregiver',
      createdAt: faker.date.between({ from: CONFIG.dateRange.start, to: CONFIG.dateRange.end }),
    };
    generatedUsers.push(user);
  }
  
  // Generate family members
  for (let i = 0; i < familyCount; i++) {
    const user = {
      id: uuidv4(),
      name: faker.person.fullName(),
      email: `family-${i}@careunity.test`,
      password: hashedPassword,
      role: 'family',
      createdAt: faker.date.between({ from: CONFIG.dateRange.start, to: CONFIG.dateRange.end }),
    };
    generatedUsers.push(user);
  }
  
  // Insert users into database
  await db.insert(users).values(generatedUsers);
  
  return generatedUsers;
}

/**
 * Generate service users
 */
async function generateServiceUsers(count: number) {
  const generatedServiceUsers = [];
  
  for (let i = 0; i < count; i++) {
    const serviceUser = {
      id: uuidv4(),
      name: faker.person.fullName(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 100, mode: 'age' }),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      emergencyContact: faker.person.fullName(),
      emergencyPhone: faker.phone.number(),
      createdAt: faker.date.between({ from: CONFIG.dateRange.start, to: CONFIG.dateRange.end }),
    };
    generatedServiceUsers.push(serviceUser);
  }
  
  // Insert service users into database
  await db.insert(serviceUsers).values(generatedServiceUsers);
  
  return generatedServiceUsers;
}

// Additional functions for generating care plans, allocations, visits, and documents
// would be implemented here but are omitted for brevity

// Run the generator
generateTestData()
  .then(() => {
    console.log('Test data generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating test data:', error);
    process.exit(1);
  });
