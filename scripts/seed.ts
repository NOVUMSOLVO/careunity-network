import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';
import { users, serviceUsers, resourceLocations, communityResources, resourceReviews, resourceBookmarks } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

neonConfig.webSocketConstructor = ws;
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Seeding database with sample data...');
  
  try {
    // Seed users
    console.log('Seeding users...');
    const adminUser = await db.insert(users).values({
      username: 'admin',
      password: await hashPassword('admin123'),
      fullName: 'System Administrator',
      email: 'admin@careunity.com',
      role: 'admin',
      phoneNumber: '07700900000',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }).returning().then(res => res[0]);
    
    const johnUser = await db.insert(users).values({
      username: 'jsmith',
      password: await hashPassword('password123'),
      fullName: 'John Smith',
      email: 'john.smith@careunity.com',
      role: 'caregiver',
      phoneNumber: '07700900001',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    }).returning().then(res => res[0]);
    
    const sarahUser = await db.insert(users).values({
      username: 'sjones',
      password: await hashPassword('password123'),
      fullName: 'Sarah Jones',
      email: 'sarah.jones@careunity.com',
      role: 'manager',
      phoneNumber: '07700900002',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    }).returning().then(res => res[0]);
    
    // Seed service users
    console.log('Seeding service users...');
    const alice = await db.insert(serviceUsers).values({
      uniqueId: 'SU00001',
      fullName: 'Alice Brown',
      dateOfBirth: '1945-06-12',
      address: '123 Oak Street, London, SE1 7TP',
      phoneNumber: '07700900100',
      emergencyContact: 'Robert Brown (Son): 07700900101',
      preferences: JSON.stringify({
        mealPreferences: 'Vegetarian, no spicy food',
        sleepSchedule: 'Early to bed (8pm), early to rise (6am)',
        activitiesEnjoyed: ['Reading', 'Knitting', 'Classical music']
      }),
      needs: JSON.stringify({
        mobilitySupport: 'Uses a walker, needs assistance with steps',
        medicationManagement: 'Needs reminders for morning and evening medication',
        personalCare: 'Independent with washing, needs help with bathing'
      })
    }).returning().then(res => res[0]);
    
    const bob = await db.insert(serviceUsers).values({
      uniqueId: 'SU00002',
      fullName: 'Bob Williams',
      dateOfBirth: '1938-11-28',
      address: '45 Maple Avenue, London, NW3 5QT',
      phoneNumber: '07700900102',
      emergencyContact: 'Jennifer Williams (Daughter): 07700900103',
      preferences: JSON.stringify({
        mealPreferences: 'Traditional English food, dislikes fish',
        sleepSchedule: 'Night owl, usually sleeps from 11pm to 7am',
        activitiesEnjoyed: ['Gardening', 'Watching sports', 'Playing cards']
      }),
      needs: JSON.stringify({
        mobilitySupport: 'Uses a wheelchair outside, can walk short distances inside with a cane',
        medicationManagement: 'Needs full assistance with medication administration',
        personalCare: 'Needs full assistance with bathing and dressing'
      }),
      lifeStory: 'Bob was a carpenter for over 40 years. He has three children and five grandchildren. He loves telling stories about his time working on historic buildings in London.'
    }).returning().then(res => res[0]);
    
    // Seed resource locations
    console.log('Seeding resource locations...');
    const location1 = await db.insert(resourceLocations).values({
      name: 'Westside Community Center',
      city: 'London',
      region: 'Greater London',
      postcode: 'W2 1HG',
      latitude: '51.5098',
      longitude: '-0.1975',
      isVirtual: false
    }).returning().then(res => res[0]);
    
    const location2 = await db.insert(resourceLocations).values({
      name: 'Northside Care Hub',
      city: 'London',
      region: 'Greater London',
      postcode: 'N4 2DW',
      latitude: '51.5762',
      longitude: '-0.1065',
      isVirtual: false
    }).returning().then(res => res[0]);
    
    const location3 = await db.insert(resourceLocations).values({
      name: 'Online Services',
      city: 'London',
      region: 'Virtual',
      isVirtual: true
    }).returning().then(res => res[0]);
    
    // Seed community resources
    console.log('Seeding community resources...');
    const resource1 = await db.insert(communityResources).values({
      name: 'Elderly Exercise Group',
      description: 'Gentle exercise classes designed specifically for older adults to maintain mobility, strength, and balance. Sessions are led by qualified instructors with experience in geriatric fitness.',
      categories: ['health', 'social', 'activities'],
      locationId: location1.id,
      contactPhone: '020 7123 4567',
      contactEmail: 'exercise@westsidecommunity.org',
      website: 'https://westsidecommunity.org/elderly-exercise',
      address: '45 West Avenue, London',
      postcode: 'W2 1HG',
      availability: {
        monday: '10:00-11:30',
        wednesday: '10:00-11:30',
        friday: '14:00-15:30',
        notes: 'Drop-in sessions, no booking required'
      },
      isFree: false,
      pricing: '£5 per session, £20 for a monthly pass',
      fundingOptions: ['Local authority funding available', 'Discounts for carers'],
      eligibilityCriteria: {
        ageGroups: ['65+'],
        conditions: ['Limited mobility', 'Arthritis', 'Post-surgery recovery'],
        otherCriteria: 'Must be able to stand for short periods with support if needed'
      },
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair access', 'Ground floor location', 'Accessible toilets'],
      serviceArea: 'West London',
      status: 'active',
      rating: 4,
      reviewCount: 2,
      lastUpdated: '2023-11-15'
    }).returning().then(res => res[0]);
    
    const resource2 = await db.insert(communityResources).values({
      name: 'Memory Café',
      description: 'A welcoming and supportive environment for people living with dementia and their carers. The café offers activities, information sharing, and a chance to socialize in a safe space.',
      categories: ['social', 'mental_health', 'health'],
      locationId: location2.id,
      contactPhone: '020 7456 7890',
      contactEmail: 'memory@northsidecare.org',
      website: 'https://northsidecare.org/memory-cafe',
      address: '78 North Street, London',
      postcode: 'N4 2DW',
      availability: {
        tuesday: '13:00-15:00',
        thursday: '13:00-15:00',
        notes: 'First visit must be booked in advance'
      },
      isFree: true,
      eligibilityCriteria: {
        conditions: ['Dementia', 'Alzheimer\'s', 'Memory issues'],
        otherCriteria: 'Open to both those with memory issues and their carers/family members'
      },
      languages: ['English', 'Polish', 'Urdu'],
      accessibilityFeatures: ['Wheelchair access', 'Dementia-friendly design', 'Quiet space available'],
      serviceArea: 'North London',
      status: 'active',
      rating: 5,
      reviewCount: 1,
      lastUpdated: '2024-01-08'
    }).returning().then(res => res[0]);
    
    const resource3 = await db.insert(communityResources).values({
      name: 'Creative Arts Therapy',
      description: 'Art therapy sessions designed to improve mental wellbeing through creative expression. No previous art experience necessary. Materials provided.',
      categories: ['mental_health', 'activities', 'health'],
      locationId: location1.id,
      contactPhone: '020 7234 5678',
      contactEmail: 'arts@westsidecommunity.org',
      website: 'https://westsidecommunity.org/arts-therapy',
      address: '45 West Avenue, London',
      postcode: 'W2 1HG',
      availability: {
        monday: '18:00-20:00',
        wednesday: '10:00-12:00',
        saturday: '14:00-16:00',
        notes: 'Pre-booking recommended due to limited spaces'
      },
      isFree: false,
      pricing: '£8 per session, concessions available',
      fundingOptions: ['NHS referral scheme', 'Means-tested discounts'],
      eligibilityCriteria: {
        ageGroups: ['18+'],
        conditions: ['Depression', 'Anxiety', 'Loneliness', 'Stress'],
        otherCriteria: 'No previous art experience necessary'
      },
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair access', 'Sensory adaptations'],
      serviceArea: 'London',
      status: 'active',
      lastUpdated: '2023-11-20'
    }).returning().then(res => res[0]);
    
    // Create some sample reviews
    console.log('Seeding reviews and bookmarks...');
    try {
      if (resource1) {
        await db.insert(resourceReviews).values({
          resourceId: resource1.id,
          userId: adminUser.id, // admin user
          rating: 5,
          comment: "Excellent group with knowledgeable instructors. Very appropriate for all abilities.",
          date: "2023-11-10",
          helpfulCount: 3
        });
        
        await db.insert(resourceReviews).values({
          resourceId: resource1.id,
          userId: johnUser.id, // john smith
          rating: 4,
          comment: "Good variety of exercises and very welcoming group. The venue gets crowded sometimes.",
          date: "2023-12-15",
          helpfulCount: 1
        });
      }
      
      if (resource2) {
        await db.insert(resourceReviews).values({
          resourceId: resource2.id,
          userId: sarahUser.id, // sarah jones
          rating: 5,
          comment: "A wonderful, supportive environment. The staff are incredibly patient and understanding.",
          date: "2024-01-05",
          helpfulCount: 4
        });
      }
      
      // Create some sample bookmarks
      if (resource1 && resource2) {
        await db.insert(resourceBookmarks).values({
          resourceId: resource1.id,
          userId: johnUser.id,
          notes: "Recommend this to Mrs. Johnson",
          dateAdded: "2023-11-15"
        });
        
        await db.insert(resourceBookmarks).values({
          resourceId: resource2.id,
          userId: sarahUser.id,
          notes: "Good for clients with early-stage dementia",
          dateAdded: "2024-01-10"
        });
      }
    } catch (error) {
      console.error("Error seeding reviews and bookmarks:", error);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase().catch(console.error);