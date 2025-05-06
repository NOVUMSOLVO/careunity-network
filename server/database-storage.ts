import session from "express-session";
import connectPg from "connect-pg-simple";
import {
  users, User, InsertUser, 
  serviceUsers, ServiceUser, InsertServiceUser,
  carePlans, CarePlan, InsertCarePlan,
  goals, Goal, InsertGoal,
  tasks, Task, InsertTask, 
  appointments, Appointment, InsertAppointment,
  notes, Note, InsertNote,
  riskAssessments, RiskAssessment, InsertRiskAssessment,
  resourceLocations, ResourceLocation, InsertResourceLocation,
  communityResources, CommunityResource, InsertCommunityResource,
  resourceReferrals, ResourceReferral, InsertResourceReferral,
  resourceReviews, ResourceReview, InsertResourceReview,
  resourceBookmarks, ResourceBookmark, InsertResourceBookmark
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, or, sql } from "drizzle-orm";
import { hashPassword } from "./auth";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Service User operations
  async getAllServiceUsers(): Promise<ServiceUser[]> {
    return await db.select().from(serviceUsers);
  }
  
  async getServiceUser(id: number): Promise<ServiceUser | undefined> {
    const result = await db.select().from(serviceUsers).where(eq(serviceUsers.id, id));
    return result[0];
  }
  
  async getServiceUserByUniqueId(uniqueId: string): Promise<ServiceUser | undefined> {
    const result = await db.select().from(serviceUsers).where(eq(serviceUsers.uniqueId, uniqueId));
    return result[0];
  }
  
  async createServiceUser(insertServiceUser: InsertServiceUser): Promise<ServiceUser> {
    const [serviceUser] = await db.insert(serviceUsers).values(insertServiceUser).returning();
    return serviceUser;
  }
  
  async updateServiceUser(id: number, serviceUserUpdate: Partial<InsertServiceUser>): Promise<ServiceUser | undefined> {
    const [updatedServiceUser] = await db
      .update(serviceUsers)
      .set(serviceUserUpdate)
      .where(eq(serviceUsers.id, id))
      .returning();
    return updatedServiceUser;
  }
  
  // Care Plan operations
  async getCarePlans(serviceUserId: number): Promise<CarePlan[]> {
    return await db
      .select()
      .from(carePlans)
      .where(eq(carePlans.serviceUserId, serviceUserId));
  }
  
  async getCarePlan(id: number): Promise<CarePlan | undefined> {
    const result = await db.select().from(carePlans).where(eq(carePlans.id, id));
    return result[0];
  }
  
  async createCarePlan(insertCarePlan: InsertCarePlan): Promise<CarePlan> {
    const [carePlan] = await db.insert(carePlans).values(insertCarePlan).returning();
    return carePlan;
  }
  
  async updateCarePlan(id: number, carePlanUpdate: Partial<InsertCarePlan>): Promise<CarePlan | undefined> {
    const [updatedCarePlan] = await db
      .update(carePlans)
      .set(carePlanUpdate)
      .where(eq(carePlans.id, id))
      .returning();
    return updatedCarePlan;
  }
  
  // Goal operations
  async getGoals(carePlanId: number): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.carePlanId, carePlanId));
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(eq(goals.id, id));
    return result[0];
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }
  
  async updateGoal(id: number, goalUpdate: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goalUpdate)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }
  
  // Task operations
  async getTasks(carePlanId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.carePlanId, carePlanId));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  // Appointment operations
  async getAppointments(serviceUserId: number, date?: string): Promise<Appointment[]> {
    if (date) {
      return await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.serviceUserId, serviceUserId),
            eq(appointments.date, date)
          )
        );
    } else {
      return await db
        .select()
        .from(appointments)
        .where(eq(appointments.serviceUserId, serviceUserId));
    }
  }
  
  async getAppointmentsForCaregiver(caregiverId: number, date?: string): Promise<Appointment[]> {
    if (date) {
      return await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.caregiverId, caregiverId),
            eq(appointments.date, date)
          )
        );
    } else {
      return await db
        .select()
        .from(appointments)
        .where(eq(appointments.caregiverId, caregiverId));
    }
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointmentUpdate)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }
  
  // Note operations
  async getNotes(serviceUserId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.serviceUserId, serviceUserId));
  }
  
  async getNote(id: number): Promise<Note | undefined> {
    const result = await db.select().from(notes).where(eq(notes.id, id));
    return result[0];
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }
  
  // Risk Assessment operations
  async getRiskAssessments(serviceUserId: number): Promise<RiskAssessment[]> {
    return await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.serviceUserId, serviceUserId));
  }
  
  async getRiskAssessment(id: number): Promise<RiskAssessment | undefined> {
    const result = await db.select().from(riskAssessments).where(eq(riskAssessments.id, id));
    return result[0];
  }
  
  async createRiskAssessment(insertRiskAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [riskAssessment] = await db.insert(riskAssessments).values(insertRiskAssessment).returning();
    return riskAssessment;
  }
  
  async updateRiskAssessment(id: number, riskAssessmentUpdate: Partial<InsertRiskAssessment>): Promise<RiskAssessment | undefined> {
    const [updatedRiskAssessment] = await db
      .update(riskAssessments)
      .set(riskAssessmentUpdate)
      .where(eq(riskAssessments.id, id))
      .returning();
    return updatedRiskAssessment;
  }
  
  // Resource Location operations
  async getAllResourceLocations(): Promise<ResourceLocation[]> {
    return await db.select().from(resourceLocations);
  }
  
  async getResourceLocation(id: number): Promise<ResourceLocation | undefined> {
    const result = await db.select().from(resourceLocations).where(eq(resourceLocations.id, id));
    return result[0];
  }
  
  async createResourceLocation(location: InsertResourceLocation): Promise<ResourceLocation> {
    const [resourceLocation] = await db.insert(resourceLocations).values(location).returning();
    return resourceLocation;
  }
  
  async updateResourceLocation(id: number, locationUpdate: Partial<InsertResourceLocation>): Promise<ResourceLocation | undefined> {
    const [updatedLocation] = await db
      .update(resourceLocations)
      .set(locationUpdate)
      .where(eq(resourceLocations.id, id))
      .returning();
    return updatedLocation;
  }
  
  // Community Resource operations
  async getAllCommunityResources(): Promise<CommunityResource[]> {
    return await db.select().from(communityResources);
  }
  
  async getCommunityResourcesByCategory(category: string): Promise<CommunityResource[]> {
    // Filter by category - using array_contains postgres function
    return await db
      .select()
      .from(communityResources)
      .where(sql`${communityResources.categories} @> ARRAY[${category}]::text[]`);
  }
  
  async getCommunityResourcesByLocation(locationId: number): Promise<CommunityResource[]> {
    return await db
      .select()
      .from(communityResources)
      .where(eq(communityResources.locationId, locationId));
  }
  
  async getCommunityResource(id: number): Promise<CommunityResource | undefined> {
    const result = await db.select().from(communityResources).where(eq(communityResources.id, id));
    return result[0];
  }
  
  async createCommunityResource(resource: InsertCommunityResource): Promise<CommunityResource> {
    const resourceWithDefaults = {
      ...resource,
      reviewCount: 0,
      rating: null
    };
    const [communityResource] = await db.insert(communityResources).values(resourceWithDefaults).returning();
    return communityResource;
  }
  
  async updateCommunityResource(id: number, resourceUpdate: Partial<InsertCommunityResource>): Promise<CommunityResource | undefined> {
    const [updatedResource] = await db
      .update(communityResources)
      .set(resourceUpdate)
      .where(eq(communityResources.id, id))
      .returning();
    return updatedResource;
  }
  
  async searchCommunityResources(query: string, filters?: any): Promise<CommunityResource[]> {
    // Build the query dynamically based on filters
    let baseQuery = db.select().from(communityResources);
    
    // Text search
    if (query && query.trim() !== '') {
      const searchText = `%${query.toLowerCase()}%`;
      baseQuery = baseQuery.where(
        or(
          sql`LOWER(${communityResources.name}) LIKE ${searchText}`,
          sql`LOWER(${communityResources.description}) LIKE ${searchText}`
        )
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.isFree !== undefined) {
        baseQuery = baseQuery.where(eq(communityResources.isFree, filters.isFree));
      }
      
      if (filters.isReferralRequired !== undefined) {
        baseQuery = baseQuery.where(eq(communityResources.isReferralRequired, filters.isReferralRequired));
      }
      
      if (filters.status) {
        baseQuery = baseQuery.where(eq(communityResources.status, filters.status));
      }
      
      if (filters.categories && filters.categories.length > 0) {
        // Check if any of the filter categories is in the resource categories array
        baseQuery = baseQuery.where(
          sql`${communityResources.categories} && ARRAY[${filters.categories}]::text[]`
        );
      }
    }
    
    return await baseQuery;
  }
  
  // Resource Referral operations
  async getReferrals(serviceUserId?: number, resourceId?: number): Promise<ResourceReferral[]> {
    let query = db.select().from(resourceReferrals);
    
    if (serviceUserId !== undefined) {
      query = query.where(eq(resourceReferrals.serviceUserId, serviceUserId));
    }
    
    if (resourceId !== undefined) {
      if (serviceUserId !== undefined) {
        query = query.where(and(
          eq(resourceReferrals.serviceUserId, serviceUserId),
          eq(resourceReferrals.resourceId, resourceId)
        ));
      } else {
        query = query.where(eq(resourceReferrals.resourceId, resourceId));
      }
    }
    
    return await query;
  }
  
  async getReferral(id: number): Promise<ResourceReferral | undefined> {
    const result = await db.select().from(resourceReferrals).where(eq(resourceReferrals.id, id));
    return result[0];
  }
  
  async createReferral(referral: InsertResourceReferral): Promise<ResourceReferral> {
    const [resourceReferral] = await db.insert(resourceReferrals).values(referral).returning();
    return resourceReferral;
  }
  
  async updateReferral(id: number, referralUpdate: Partial<InsertResourceReferral>): Promise<ResourceReferral | undefined> {
    const [updatedReferral] = await db
      .update(resourceReferrals)
      .set(referralUpdate)
      .where(eq(resourceReferrals.id, id))
      .returning();
    return updatedReferral;
  }
  
  // Resource Review operations
  async getReviews(resourceId: number): Promise<ResourceReview[]> {
    return await db
      .select()
      .from(resourceReviews)
      .where(eq(resourceReviews.resourceId, resourceId));
  }
  
  async getReview(id: number): Promise<ResourceReview | undefined> {
    const result = await db.select().from(resourceReviews).where(eq(resourceReviews.id, id));
    return result[0];
  }
  
  async createReview(review: InsertResourceReview): Promise<ResourceReview> {
    const [resourceReview] = await db.insert(resourceReviews).values(review).returning();
    
    // Update rating and review count in the community resource
    const reviews = await this.getReviews(review.resourceId);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await this.updateCommunityResource(review.resourceId, {
      rating: avgRating,
      reviewCount: reviews.length
    });
    
    return resourceReview;
  }
  
  async updateReview(id: number, reviewUpdate: Partial<InsertResourceReview>): Promise<ResourceReview | undefined> {
    const existingReview = await this.getReview(id);
    if (!existingReview) return undefined;
    
    const [updatedReview] = await db
      .update(resourceReviews)
      .set(reviewUpdate)
      .where(eq(resourceReviews.id, id))
      .returning();
    
    // If rating was updated, recalculate the average rating for the resource
    if (reviewUpdate.rating !== undefined && reviewUpdate.rating !== existingReview.rating) {
      const reviews = await this.getReviews(existingReview.resourceId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      await this.updateCommunityResource(existingReview.resourceId, {
        rating: avgRating
      });
    }
    
    return updatedReview;
  }
  
  // Resource Bookmark operations
  async getBookmarks(userId: number): Promise<ResourceBookmark[]> {
    return await db
      .select()
      .from(resourceBookmarks)
      .where(eq(resourceBookmarks.userId, userId));
  }
  
  async getBookmark(id: number): Promise<ResourceBookmark | undefined> {
    const result = await db.select().from(resourceBookmarks).where(eq(resourceBookmarks.id, id));
    return result[0];
  }
  
  async createBookmark(bookmark: InsertResourceBookmark): Promise<ResourceBookmark> {
    const [resourceBookmark] = await db.insert(resourceBookmarks).values(bookmark).returning();
    return resourceBookmark;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    const result = await db
      .delete(resourceBookmarks)
      .where(eq(resourceBookmarks.id, id))
      .returning({ id: resourceBookmarks.id });
    
    return result.length > 0;
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    try {
      // Check if data already exists
      console.log("Checking for existing data...");
      
      // Check for existing users
      const userCount = await db.select().from(users);
      
      // Check for existing community resources
      const resourceCount = await db.select().from(communityResources);
      
      if (userCount.length > 0 && resourceCount.length > 0) {
        console.log("Both users and community resources already exist - skipping all seeding");
        return;
      }
      
      console.log("Seeding initial data to database...");
      
      // Variables to store created entities for reference
      let adminUser, johnUser, sarahUser, serviceUser1, serviceUser2;
      
      // Check if we need to create users
      if (userCount.length === 0) {
        console.log("Creating users...");
        
        // Create a test admin user
        adminUser = await this.createUser({
          username: 'admin',
          password: await hashPassword('password'), // 'password'
          email: 'admin@careunity.com',
          fullName: 'System Administrator',
          role: 'admin',
          phoneNumber: '+4478943211',
          profileImage: null
        });
        
        // Create some caregivers
        johnUser = await this.createUser({
          username: 'johnsmith',
          password: await hashPassword('password'), // 'password'
          email: 'john.smith@careunity.com',
          fullName: 'John Smith',
          role: 'caregiver',
          phoneNumber: '+4478123456',
          profileImage: null
        });
        
        sarahUser = await this.createUser({
          username: 'sarahjones',
          password: await hashPassword('password'), // 'password'
          email: 'sarah.jones@careunity.com',
          fullName: 'Sarah Jones',
          role: 'caregiver',
          phoneNumber: '+4478654321',
          profileImage: null
        });
      } else {
        console.log("Users already exist - using existing users");
        // Get existing users
        adminUser = await this.getUserByUsername('admin');
        johnUser = await this.getUserByUsername('johnsmith');
        sarahUser = await this.getUserByUsername('sarahjones');
      }
      
      // Check if we need to create service users
      const serviceUserCount = await db.select().from(serviceUsers);
      if (serviceUserCount.length === 0) {
        console.log("Creating service users...");
        
        // Create some service users
        serviceUser1 = await this.createServiceUser({
          fullName: 'Elizabeth Johnson',
          phoneNumber: '+4479123456',
          address: '123 High Street, London',
          profileImage: null,
          uniqueId: 'SU-0001',
          dateOfBirth: '1945-06-12',
          emergencyContact: 'James Johnson (Son) - +4479987654',
          preferences: 'Prefers to be called Betty. Enjoys classical music and gardening programs.',
          needs: 'Assistance with bathing and medication. Needs regular prompting for hydration.',
          lifeStory: 'Retired teacher. Widowed in 2015. Has two children and four grandchildren.'
        });
        
        serviceUser2 = await this.createServiceUser({
          fullName: 'Robert Wilson',
          phoneNumber: '+4479456789',
          address: '45 Church Road, Birmingham',
          profileImage: null,
          uniqueId: 'SU-0002',
          dateOfBirth: '1940-03-22',
          emergencyContact: 'Susan Wilson (Daughter) - +4479876543',
          preferences: 'Early riser. Loves sports, especially cricket. Prefers showers over baths.',
          needs: 'Mobility assistance. Visual impairment requires clear verbal communication.',
          lifeStory: 'Former engineer. Widowed in 2010. Passionate about community volunteering before retirement.'
        });
      } else {
        console.log("Service users already exist - using existing service users");
        // Get existing service users
        serviceUser1 = await this.getServiceUserByUniqueId('SU-0001');
        serviceUser2 = await this.getServiceUserByUniqueId('SU-0002');
      }
      
      // Check if we need to create care plans
      let carePlan1, carePlan2;
      const carePlanCount = await db.select().from(carePlans);
      
      if (carePlanCount.length === 0 && serviceUser1 && serviceUser2) {
        console.log("Creating care plans...");
        
        // Create care plans
        carePlan1 = await this.createCarePlan({
          title: 'Daily Living Support Plan',
          summary: 'Comprehensive plan for maintaining independence in daily activities.',
          serviceUserId: serviceUser1.id,
          status: 'active',
          startDate: '2023-10-15',
          reviewDate: '2024-04-15'
        });
        
        carePlan2 = await this.createCarePlan({
          title: 'Mobility Enhancement Plan',
          summary: 'Focused on improving mobility and preventing falls.',
          serviceUserId: serviceUser2.id,
          status: 'active',
          startDate: '2023-11-01',
          reviewDate: '2024-05-01'
        });
        
        // Check if we need to create goals
        const goalCount = await db.select().from(goals);
        if (goalCount.length === 0 && carePlan1 && carePlan2) {
          console.log("Creating goals...");
          
          // Create goals for first care plan
          await this.createGoal({
            title: 'Maintain personal hygiene independence',
            description: 'Support Elizabeth to maintain independence in personal care activities.',
            carePlanId: carePlan1.id,
            status: 'on track',
            startDate: '2023-10-15',
            targetDate: '2024-01-15',
            progressPercentage: 45
          });
          
          await this.createGoal({
            title: 'Medication management',
            description: 'Ensure consistent and correct medication intake.',
            carePlanId: carePlan1.id,
            status: 'on track',
            startDate: '2023-10-15',
            targetDate: '2024-04-15',
            progressPercentage: 70
          });
          
          await this.createGoal({
            title: 'Social engagement',
            description: 'Increase participation in community activities.',
            carePlanId: carePlan1.id,
            status: 'at risk',
            startDate: '2023-10-15',
            targetDate: '2024-03-01',
            progressPercentage: 25
          });
          
          // Create goals for second care plan
          await this.createGoal({
            title: 'Safe mobility around home',
            description: 'Improve confidence and safety when moving around home.',
            carePlanId: carePlan2.id,
            status: 'on track',
            startDate: '2023-11-01',
            targetDate: '2024-02-01',
            progressPercentage: 60
          });
          
          await this.createGoal({
            title: 'Outdoor walking program',
            description: 'Gradually increase distance and duration of outdoor walks.',
            carePlanId: carePlan2.id,
            status: 'in progress',
            startDate: '2023-11-15',
            targetDate: '2024-04-01',
            progressPercentage: 35
          });
        } else {
          console.log("Goals already exist - skipping goal creation");
        }
        
        // Check if we need to create tasks
        const taskCount = await db.select().from(tasks);
        if (taskCount.length === 0 && carePlan1 && carePlan2) {
          console.log("Creating tasks...");
          
          // Create tasks
          await this.createTask({
            title: 'Morning medication reminder',
            description: 'Remind and observe taking of morning medications with breakfast.',
            carePlanId: carePlan1.id,
            category: 'medication',
            timeOfDay: 'morning',
            completed: false
          });
          
          await this.createTask({
            title: 'Evening bath assistance',
            description: 'Provide minimal assistance with bath preparation and safety supervision.',
            carePlanId: carePlan1.id,
            category: 'personal care',
            timeOfDay: 'evening',
            completed: false
          });
          
          await this.createTask({
            title: 'Indoor walking practice',
            description: 'Practice walking from living room to garden using walking frame.',
            carePlanId: carePlan2.id,
            category: 'mobility',
            timeOfDay: 'afternoon',
            completed: false
          });
        } else {
          console.log("Tasks already exist - skipping task creation");
        }
      } else {
        console.log("Care plans already exist - skipping care plan, goal, and task creation");
        // Get the first two care plans for appointment creation if needed
        const existingCarePlans = await db.select().from(carePlans).limit(2);
        if (existingCarePlans.length >= 2) {
          carePlan1 = existingCarePlans[0];
          carePlan2 = existingCarePlans[1];
        }
      }
      
      // Check if we need to create appointments
      const appointmentCount = await db.select().from(appointments);
      if (appointmentCount.length === 0 && serviceUser1 && serviceUser2) {
        console.log("Creating appointments...");
        
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        await this.createAppointment({
          title: 'Morning Care Visit',
          description: 'Regular morning care visit - personal care and breakfast assistance.',
          serviceUserId: serviceUser1.id,
          caregiverId: 2,
          date: today.toISOString().split('T')[0],
          status: 'scheduled',
          startTime: '08:00',
          endTime: '09:30',
          location: "Service User's Home",
          visitType: 'routine'
        });
        
        await this.createAppointment({
          title: 'Evening Care Visit',
          description: 'Regular evening care visit - meal preparation and medication support.',
          serviceUserId: serviceUser1.id,
          caregiverId: 3,
          date: today.toISOString().split('T')[0],
          status: 'scheduled',
          startTime: '17:00',
          endTime: '18:30',
          location: "Service User's Home",
          visitType: 'routine'
        });
        
        await this.createAppointment({
          title: 'Physiotherapy Session',
          description: 'Weekly physiotherapy session with mobility assessment.',
          serviceUserId: serviceUser2.id,
          caregiverId: 2,
          date: tomorrow.toISOString().split('T')[0],
          status: 'scheduled',
          startTime: '10:00',
          endTime: '11:00',
          location: 'Community Health Center',
          visitType: 'therapy'
        });
        
        await this.createAppointment({
          title: 'GP Appointment',
          description: 'Quarterly check-up with GP.',
          serviceUserId: serviceUser1.id,
          caregiverId: 3,
          date: nextWeek.toISOString().split('T')[0],
          status: 'scheduled',
          startTime: '14:00',
          endTime: '14:30',
          location: 'Riverside Medical Practice',
          visitType: 'medical'
        });
      } else {
        console.log("Appointments already exist - skipping appointment creation");
      }
      
      // Check if we need to create notes
      const noteCount = await db.select().from(notes);
      if (noteCount.length === 0 && serviceUser1 && serviceUser2) {
        console.log("Creating notes...");
        
        const today = new Date();
        
        await this.createNote({
          content: 'Elizabeth was in good spirits today. Completed all morning routines with minimal assistance. Mentioned slight pain in right knee when standing up from chair.',
          serviceUserId: serviceUser1.id,
          category: 'daily care',
          createdBy: 2,
          timestamp: new Date(new Date().setDate(today.getDate() - 1)).toISOString(),
          isVoiceRecorded: false
        });
        
        await this.createNote({
          content: 'Robert completed the indoor walking exercise today, showing improvement in balance. Expressed interest in attempting garden walk next week.',
          serviceUserId: serviceUser2.id,
          category: 'mobility',
          createdBy: 2,
          timestamp: new Date(new Date().setDate(today.getDate() - 2)).toISOString(),
          isVoiceRecorded: false
        });
      } else {
        console.log("Notes already exist - skipping note creation");
      }
      
      // Check if we need to create risk assessments
      const riskAssessmentCount = await db.select().from(riskAssessments);
      if (riskAssessmentCount.length === 0 && serviceUser1 && serviceUser2) {
        console.log("Creating risk assessments...");
        
        const today = new Date();
        
        await this.createRiskAssessment({
          description: 'Fall risk assessment',
          serviceUserId: serviceUser1.id,
          category: 'mobility',
          riskLevel: 'medium',
          mitigations: 'Remove loose rugs. Install additional handrails in bathroom. Ensure adequate lighting, especially at night.',
          reviewDate: new Date(new Date().setMonth(today.getMonth() + 3)).toISOString().split('T')[0]
        });
        
        await this.createRiskAssessment({
          description: 'Medication management risk assessment',
          serviceUserId: serviceUser2.id,
          category: 'medication',
          riskLevel: 'high',
          mitigations: 'Daily medication preparation in dosette box. Twice daily verification of medication intake. Written medication schedule with pictures.',
          reviewDate: new Date(new Date().setMonth(today.getMonth() + 2)).toISOString().split('T')[0]
        });
      } else {
        console.log("Risk assessments already exist - skipping risk assessment creation");
      }
      
      // Check for existing community resources
      const resourceLocationCount = await db.select().from(resourceLocations);
      if (resourceLocationCount.length === 0) {
        // Seed resource locations
        console.log("Seeding community resource locations...");
        const location1 = await this.createResourceLocation({
      name: 'North London Community Centre',
      city: 'London',
      region: 'Greater London',
      postcode: 'N1 5QW',
      latitude: '51.5388',
      longitude: '-0.0998',
      isVirtual: false
    });

    const location2 = await this.createResourceLocation({
      name: 'Birmingham Wellbeing Hub',
      city: 'Birmingham',
      region: 'West Midlands',
      postcode: 'B1 2AA',
      latitude: '52.4796',
      longitude: '-1.9026',
      isVirtual: false
    });

    const location3 = await this.createResourceLocation({
      name: 'Online Services',
      city: 'National',
      region: null,
      postcode: null,
      latitude: null,
      longitude: null,
      isVirtual: true
    });

    // Seed community resources
    console.log("Seeding community resources...");
    
    // Health resources
    await this.createCommunityResource({
      name: 'Elderly Exercise Group',
      description: 'Weekly gentle exercise sessions designed specifically for older adults. Includes seated exercises, balance work, and social activities.',
      categories: ['health', 'social'],
      status: 'active',
      locationId: location1.id,
      address: '123 High Street, London N1 5QW',
      postcode: 'N1 5QW',
      website: 'www.elderlywellness.org.uk',
      contactPhone: '020 7123 4567',
      contactEmail: 'info@elderlywellness.org.uk',
      isFree: false,
      pricing: '£5 per session, concessions available',
      fundingOptions: ['Local authority vouchers', 'Health referral scheme'],
      isReferralRequired: false,
      referralProcess: null,
      referralContact: null,
      eligibilityCriteria: {
        ageGroups: ['65+'],
        conditions: ['Reduced mobility', 'Arthritis', 'Post-stroke'],
        otherCriteria: 'Must be able to travel to venue'
      },
      languages: ['English', 'Polish'],
      accessibilityFeatures: ['Wheelchair access', 'Hearing loop', 'Accessible toilets'],
      serviceArea: 'North London',
      availability: {
        monday: '10:00-12:00',
        wednesday: '10:00-12:00',
        friday: '14:00-16:00',
        notes: 'Closed on bank holidays'
      },
      lastUpdated: '2023-10-15'
    });

    await this.createCommunityResource({
      name: 'Memory Café',
      description: 'Supportive environment for individuals with memory issues and their carers. Features structured activities, information sharing, and peer support.',
      categories: ['health', 'mental_health', 'social'],
      status: 'active',
      locationId: location1.id,
      address: '45 Park Avenue, London N1 6TY',
      postcode: 'N1 6TY',
      website: 'www.alzheimers-support.org.uk/memorycafe',
      contactPhone: '020 7234 5678',
      contactEmail: 'memorycafe@alzheimers-support.org.uk',
      isFree: true,
      pricing: null,
      fundingOptions: ['Charity funded'],
      isReferralRequired: false,
      referralProcess: null,
      referralContact: null,
      eligibilityCriteria: {
        ageGroups: ['Any'],
        conditions: ['Dementia', 'Memory loss', 'Alzheimer\'s'],
        otherCriteria: 'Carers welcome'
      },
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair access', 'Dementia-friendly environment'],
      serviceArea: 'North and East London',
      availability: {
        tuesday: '13:00-15:00',
        thursday: '13:00-15:00',
        notes: 'Drop-in service, no appointment needed'
      },
      lastUpdated: '2023-11-10'
    });

    // Housing resource
    await this.createCommunityResource({
      name: 'Sheltered Housing Advisory Service',
      description: 'Information and support service for older adults considering sheltered or supported housing options. Includes property listings, financial advice, and application assistance.',
      categories: ['housing', 'legal'],
      status: 'active',
      locationId: location2.id,
      address: '78 Victoria Square, Birmingham B1 2AA',
      postcode: 'B1 2AA',
      website: 'www.shelteredhousinghelp.org.uk',
      contactPhone: '0121 345 6789',
      contactEmail: 'advice@shelteredhousinghelp.org.uk',
      isFree: true,
      pricing: null,
      fundingOptions: ['Local authority funded'],
      isReferralRequired: false,
      referralProcess: null,
      referralContact: null,
      eligibilityCriteria: {
        ageGroups: ['55+'],
        conditions: null,
        otherCriteria: 'Must be considering housing options'
      },
      languages: ['English', 'Urdu', 'Punjabi'],
      accessibilityFeatures: ['Wheelchair access', 'Hearing loop', 'Documents in large print'],
      serviceArea: 'West Midlands',
      availability: {
        monday: '09:00-17:00',
        tuesday: '09:00-17:00',
        wednesday: '09:00-17:00',
        thursday: '09:00-17:00',
        friday: '09:00-16:00',
        notes: 'Appointments recommended but drop-ins welcome'
      },
      lastUpdated: '2023-09-20'
    });

    // Transportation
    await this.createCommunityResource({
      name: 'Community Transport Scheme',
      description: 'Door-to-door transport service for elderly and disabled residents unable to use public transport. Includes assisted transport to medical appointments, shopping, and social activities.',
      categories: ['transportation'],
      status: 'active',
      locationId: location2.id,
      address: '15 Station Road, Birmingham B4 7LT',
      postcode: 'B4 7LT',
      website: 'www.communitytransport-bham.org.uk',
      contactPhone: '0121 456 7890',
      contactEmail: 'bookings@communitytransport-bham.org.uk',
      isFree: false,
      pricing: '£3-£10 depending on distance',
      fundingOptions: ['Mobility allowance', 'Local authority vouchers'],
      isReferralRequired: true,
      referralProcess: 'Initial assessment required to determine eligibility. Can be completed over phone or during home visit.',
      referralContact: 'Mobility Assessment Team - 0121 456 7891',
      eligibilityCriteria: {
        ageGroups: ['Any'],
        conditions: ['Mobility impairment', 'Visual impairment', 'Unable to use public transport'],
        otherCriteria: 'Must live within Birmingham city limits'
      },
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair accessible vehicles', 'Passenger assistance'],
      serviceArea: 'Birmingham city area',
      availability: {
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-18:00',
        saturday: '09:00-17:00',
        notes: 'Booking required at least 48 hours in advance'
      },
      lastUpdated: '2023-12-01'
    });

    // Online service
    await this.createCommunityResource({
      name: 'Digital Skills for Seniors',
      description: 'Online training courses specifically designed to help older adults develop digital literacy skills. Includes basic computer skills, internet safety, and using common applications.',
      categories: ['education', 'technology'],
      status: 'active',
      locationId: location3.id,
      address: null,
      postcode: null,
      website: 'www.digitalskillsforseniors.org.uk',
      contactPhone: '0800 123 4567',
      contactEmail: 'help@digitalskillsforseniors.org.uk',
      isFree: true,
      pricing: null,
      fundingOptions: ['Government digital inclusion program'],
      isReferralRequired: false,
      referralProcess: null,
      referralContact: null,
      eligibilityCriteria: {
        ageGroups: ['60+'],
        conditions: null,
        otherCriteria: 'Requires basic internet access to participate'
      },
      languages: ['English', 'Welsh'],
      accessibilityFeatures: ['Screen reader compatible', 'Closed captions'],
      serviceArea: 'United Kingdom',
      availability: {
        monday: '24 hours',
        tuesday: '24 hours',
        wednesday: '24 hours',
        thursday: '24 hours',
        friday: '24 hours',
        saturday: '24 hours',
        sunday: '24 hours',
        notes: 'Live support available 9:00-17:00 weekdays'
      },
      lastUpdated: '2024-01-15'
    });
    
    // Social activities
    await this.createCommunityResource({
      name: 'Creative Arts for Wellbeing',
      description: 'Art therapy sessions designed to promote mental wellbeing and social connection. Activities include painting, crafts, and creative writing in a supportive environment.',
      categories: ['mental_health', 'social', 'activities'],
      status: 'active',
      locationId: location1.id,
      address: '87 Gallery Lane, London N1 8QP',
      postcode: 'N1 8QP',
      website: 'www.creativeartswellbeing.org.uk',
      contactPhone: '020 7345 6789',
      contactEmail: 'info@creativeartswellbeing.org.uk',
      isFree: false,
      pricing: '£8 per session, materials included',
      fundingOptions: ['Arts Council grants', 'Health referral scheme'],
      isReferralRequired: false,
      referralProcess: null,
      referralContact: null,
      eligibilityCriteria: {
        ageGroups: ['18+'],
        conditions: ['Depression', 'Anxiety', 'Loneliness', 'Stress'],
        otherCriteria: 'No previous art experience necessary'
      },
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair access', 'Sensory adaptations'],
      serviceArea: 'London',
      availability: {
        monday: '18:00-20:00',
        wednesday: '10:00-12:00',
        saturday: '14:00-16:00',
        notes: 'Pre-booking recommended due to limited spaces'
      },
      lastUpdated: '2023-11-20'
    });

    // Create some sample reviews
    console.log("Seeding reviews and bookmarks...");
    try {
      const resource1 = await db.select().from(communityResources).where(eq(communityResources.name, "Elderly Exercise Group")).then(res => res[0]);
      const resource2 = await db.select().from(communityResources).where(eq(communityResources.name, "Memory Café")).then(res => res[0]);
      
      if (resource1) {
        await this.createReview({
          resourceId: resource1.id,
          userId: 1, // admin user
          rating: 5,
          comment: "Excellent group with knowledgeable instructors. Very appropriate for all abilities.",
          date: "2023-11-10",
          helpfulCount: 3
        });
        
        await this.createReview({
          resourceId: resource1.id,
          userId: 2, // john smith
          rating: 4,
          comment: "Good variety of exercises and very welcoming group. The venue gets crowded sometimes.",
          date: "2023-12-15",
          helpfulCount: 1
        });
      }
      
      if (resource2) {
        await this.createReview({
          resourceId: resource2.id,
          userId: 3, // sarah jones
          rating: 5,
          comment: "A wonderful, supportive environment. The staff are incredibly patient and understanding.",
          date: "2024-01-05",
          helpfulCount: 4
        });
      }
      
      // Create some sample bookmarks
      if (resource1 && resource2) {
        await this.createBookmark({
          resourceId: resource1.id,
          userId: 2,
          notes: "Recommend this to Mrs. Johnson",
          dateAdded: "2023-11-15"
        });
        
        await this.createBookmark({
          resourceId: resource2.id,
          userId: 3,
          notes: "Good for clients with early-stage dementia",
          dateAdded: "2024-01-10"
        });
      }
    } catch (error) {
      console.error("Error seeding reviews and bookmarks:", error);
    }

        console.log("Database seeding complete!");
      } else {
        console.log("Resource locations already exist - skipping community resource creation");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}