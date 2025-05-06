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
    // Check if data already exists
    const userCount = await db.select().from(users);
    if (userCount.length > 0) {
      console.log("Database already has data - skipping seed");
      return;
    }

    console.log("Seeding initial data to database...");

    // Create a test admin user
    await this.createUser({
      username: 'admin',
      password: await hashPassword('password'), // 'password'
      email: 'admin@careunity.com',
      fullName: 'System Administrator',
      role: 'admin',
      phoneNumber: '+4478943211',
      profileImage: null
    });

    // Create some caregivers
    await this.createUser({
      username: 'johnsmith',
      password: await hashPassword('password'), // 'password'
      email: 'john.smith@careunity.com',
      fullName: 'John Smith',
      role: 'caregiver',
      phoneNumber: '+4478123456',
      profileImage: null
    });

    await this.createUser({
      username: 'sarahjones',
      password: await hashPassword('password'), // 'password'
      email: 'sarah.jones@careunity.com',
      fullName: 'Sarah Jones',
      role: 'caregiver',
      phoneNumber: '+4478654321',
      profileImage: null
    });

    // Create some service users
    const serviceUser1 = await this.createServiceUser({
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

    const serviceUser2 = await this.createServiceUser({
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

    // Create care plans
    const carePlan1 = await this.createCarePlan({
      title: 'Daily Living Support Plan',
      summary: 'Comprehensive plan for maintaining independence in daily activities.',
      serviceUserId: serviceUser1.id,
      status: 'active',
      startDate: '2023-10-15',
      reviewDate: '2024-04-15'
    });

    const carePlan2 = await this.createCarePlan({
      title: 'Mobility Enhancement Plan',
      summary: 'Focused on improving mobility and preventing falls.',
      serviceUserId: serviceUser2.id,
      status: 'active',
      startDate: '2023-11-01',
      reviewDate: '2024-05-01'
    });

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

    // Create appointments
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

    // Create notes
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

    // Create risk assessments
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

    console.log("Database seeding complete!");
  }
}