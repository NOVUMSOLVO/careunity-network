// Database initialization script
const { db, sqlite } = require('./index.cjs');
const { users, serviceUsers, carePlans, tasks, appointments, notes } = require('./schema-simple.cjs');
const { sql } = require('drizzle-orm');
const bcrypt = require('bcrypt');

// Function to hash a password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Function to initialize the database
async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Create tables
    console.log('Creating tables...');

    // Users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'care_worker',
        phone_number TEXT,
        profile_image TEXT,
        totp_secret TEXT,
        totp_enabled INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Service users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS service_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unique_id TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        address TEXT NOT NULL,
        phone_number TEXT,
        emergency_contact TEXT,
        profile_image TEXT,
        preferences TEXT,
        needs TEXT,
        life_story TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Care plans table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS care_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        start_date TEXT NOT NULL,
        review_date TEXT,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_user_id) REFERENCES service_users (id)
      )
    `);

    // Tasks table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        care_plan_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        time_of_day TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (care_plan_id) REFERENCES care_plans (id)
      )
    `);

    // Appointments table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_user_id INTEGER NOT NULL,
        caregiver_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        location TEXT,
        visit_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_user_id) REFERENCES service_users (id),
        FOREIGN KEY (caregiver_id) REFERENCES users (id)
      )
    `);

    // Notes table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_user_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        category TEXT,
        is_voice_recorded INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_user_id) REFERENCES service_users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    console.log('Tables created successfully');

    // Check if users table is empty
    const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get().count;

    if (userCount === 0) {
      console.log('Seeding database with initial data...');

      // Hash passwords
      const adminPassword = await hashPassword('admin123');
      const caregiverPassword = await hashPassword('care123');
      const managerPassword = await hashPassword('manage123');

      // Insert users
      db.insert(users).values([
        {
          username: 'admin',
          password: adminPassword,
          fullName: 'Admin User',
          email: 'admin@careunity.com',
          role: 'admin'
        },
        {
          username: 'caregiver1',
          password: caregiverPassword,
          fullName: 'John Doe',
          email: 'john@careunity.com',
          role: 'care_worker',
          phoneNumber: '555-123-4567'
        },
        {
          username: 'manager1',
          password: managerPassword,
          fullName: 'Jane Smith',
          email: 'jane@careunity.com',
          role: 'care_manager',
          phoneNumber: '555-987-6543'
        }
      ]).run();

      // Insert service users
      db.insert(serviceUsers).values([
        {
          uniqueId: 'SU001',
          fullName: 'Alice Johnson',
          dateOfBirth: '1945-06-15',
          address: '123 Main St, Anytown',
          phoneNumber: '555-111-2222',
          emergencyContact: 'John Johnson (Son) - 555-333-4444',
          preferences: JSON.stringify({
            mealPreferences: 'Vegetarian',
            wakeTime: '7:00 AM',
            bedTime: '9:00 PM'
          }),
          needs: JSON.stringify({
            mobility: 'Requires walker',
            medication: 'Morning and evening',
            assistance: 'Bathing and dressing'
          })
        },
        {
          uniqueId: 'SU002',
          fullName: 'Bob Williams',
          dateOfBirth: '1938-11-22',
          address: '456 Oak Ave, Somewhere',
          phoneNumber: '555-555-6666',
          emergencyContact: 'Mary Williams (Daughter) - 555-777-8888',
          preferences: JSON.stringify({
            mealPreferences: 'No seafood',
            wakeTime: '6:30 AM',
            bedTime: '8:30 PM'
          }),
          needs: JSON.stringify({
            mobility: 'Independent',
            medication: 'Morning only',
            assistance: 'Meal preparation'
          })
        },
        {
          uniqueId: 'SU003',
          fullName: 'Carol Davis',
          dateOfBirth: '1952-03-08',
          address: '789 Pine Rd, Elsewhere',
          phoneNumber: '555-999-0000',
          emergencyContact: 'David Davis (Husband) - 555-123-7890',
          preferences: JSON.stringify({
            mealPreferences: 'Low sodium',
            wakeTime: '8:00 AM',
            bedTime: '10:00 PM'
          }),
          needs: JSON.stringify({
            mobility: 'Uses wheelchair',
            medication: 'Morning and evening',
            assistance: 'Full assistance'
          })
        }
      ]).run();

      console.log('Database seeded successfully');
    } else {
      console.log('Database already contains data, skipping seeding');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Export the initialization function
module.exports = {
  initializeDatabase
};

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database initialization script failed:', error);
      process.exit(1);
    });
}
