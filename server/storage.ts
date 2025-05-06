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
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service User operations
  getAllServiceUsers(): Promise<ServiceUser[]>;
  getServiceUser(id: number): Promise<ServiceUser | undefined>;
  getServiceUserByUniqueId(uniqueId: string): Promise<ServiceUser | undefined>;
  createServiceUser(serviceUser: InsertServiceUser): Promise<ServiceUser>;
  updateServiceUser(id: number, serviceUser: Partial<InsertServiceUser>): Promise<ServiceUser | undefined>;
  
  // Care Plan operations
  getCarePlans(serviceUserId: number): Promise<CarePlan[]>;
  getCarePlan(id: number): Promise<CarePlan | undefined>;
  createCarePlan(carePlan: InsertCarePlan): Promise<CarePlan>;
  updateCarePlan(id: number, carePlan: Partial<InsertCarePlan>): Promise<CarePlan | undefined>;
  
  // Goal operations
  getGoals(carePlanId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  
  // Task operations
  getTasks(carePlanId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Appointment operations
  getAppointments(serviceUserId: number, date?: string): Promise<Appointment[]>;
  getAppointmentsForCaregiver(caregiverId: number, date?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  // Note operations
  getNotes(serviceUserId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  
  // Risk Assessment operations
  getRiskAssessments(serviceUserId: number): Promise<RiskAssessment[]>;
  getRiskAssessment(id: number): Promise<RiskAssessment | undefined>;
  createRiskAssessment(riskAssessment: InsertRiskAssessment): Promise<RiskAssessment>;
  updateRiskAssessment(id: number, riskAssessment: Partial<InsertRiskAssessment>): Promise<RiskAssessment | undefined>;
  
  // Resource Location operations
  getAllResourceLocations(): Promise<ResourceLocation[]>;
  getResourceLocation(id: number): Promise<ResourceLocation | undefined>;
  createResourceLocation(location: InsertResourceLocation): Promise<ResourceLocation>;
  updateResourceLocation(id: number, location: Partial<InsertResourceLocation>): Promise<ResourceLocation | undefined>;
  
  // Community Resource operations
  getAllCommunityResources(): Promise<CommunityResource[]>;
  getCommunityResourcesByCategory(category: string): Promise<CommunityResource[]>;
  getCommunityResourcesByLocation(locationId: number): Promise<CommunityResource[]>;
  getCommunityResource(id: number): Promise<CommunityResource | undefined>;
  createCommunityResource(resource: InsertCommunityResource): Promise<CommunityResource>;
  updateCommunityResource(id: number, resource: Partial<InsertCommunityResource>): Promise<CommunityResource | undefined>;
  searchCommunityResources(query: string, filters?: any): Promise<CommunityResource[]>;
  
  // Resource Referral operations
  getReferrals(serviceUserId?: number, resourceId?: number): Promise<ResourceReferral[]>;
  getReferral(id: number): Promise<ResourceReferral | undefined>;
  createReferral(referral: InsertResourceReferral): Promise<ResourceReferral>;
  updateReferral(id: number, referral: Partial<InsertResourceReferral>): Promise<ResourceReferral | undefined>;
  
  // Resource Review operations
  getReviews(resourceId: number): Promise<ResourceReview[]>;
  getReview(id: number): Promise<ResourceReview | undefined>;
  createReview(review: InsertResourceReview): Promise<ResourceReview>;
  updateReview(id: number, review: Partial<InsertResourceReview>): Promise<ResourceReview | undefined>;
  
  // Resource Bookmark operations
  getBookmarks(userId: number): Promise<ResourceBookmark[]>;
  getBookmark(id: number): Promise<ResourceBookmark | undefined>;
  createBookmark(bookmark: InsertResourceBookmark): Promise<ResourceBookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
  
  // Seed initial data
  seedInitialData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private serviceUsersStore: Map<number, ServiceUser>;
  private carePlansStore: Map<number, CarePlan>;
  private goalsStore: Map<number, Goal>;
  private tasksStore: Map<number, Task>;
  private appointmentsStore: Map<number, Appointment>;
  private notesStore: Map<number, Note>;
  private riskAssessmentsStore: Map<number, RiskAssessment>;
  private resourceLocationsStore: Map<number, ResourceLocation>;
  private communityResourcesStore: Map<number, CommunityResource>;
  private resourceReferralsStore: Map<number, ResourceReferral>;
  private resourceReviewsStore: Map<number, ResourceReview>;
  private resourceBookmarksStore: Map<number, ResourceBookmark>;
  
  sessionStore: session.Store;
  
  userCurrentId: number;
  serviceUserCurrentId: number;
  carePlanCurrentId: number;
  goalCurrentId: number;
  taskCurrentId: number;
  appointmentCurrentId: number;
  noteCurrentId: number;
  riskAssessmentCurrentId: number;
  resourceLocationCurrentId: number;
  communityResourceCurrentId: number;
  resourceReferralCurrentId: number;
  resourceReviewCurrentId: number;
  resourceBookmarkCurrentId: number;

  constructor() {
    this.usersStore = new Map();
    this.serviceUsersStore = new Map();
    this.carePlansStore = new Map();
    this.goalsStore = new Map();
    this.tasksStore = new Map();
    this.appointmentsStore = new Map();
    this.notesStore = new Map();
    this.riskAssessmentsStore = new Map();
    this.resourceLocationsStore = new Map();
    this.communityResourcesStore = new Map();
    this.resourceReferralsStore = new Map();
    this.resourceReviewsStore = new Map();
    this.resourceBookmarksStore = new Map();
    
    this.userCurrentId = 1;
    this.serviceUserCurrentId = 1;
    this.carePlanCurrentId = 1;
    this.goalCurrentId = 1;
    this.taskCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.noteCurrentId = 1;
    this.riskAssessmentCurrentId = 1;
    this.resourceLocationCurrentId = 1;
    this.communityResourceCurrentId = 1;
    this.resourceReferralCurrentId = 1;
    this.resourceReviewCurrentId = 1;
    this.resourceBookmarkCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed with some initial data
    this._seedInitialData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.usersStore.set(id, user);
    return user;
  }
  
  // Service User operations
  async getAllServiceUsers(): Promise<ServiceUser[]> {
    return Array.from(this.serviceUsersStore.values());
  }
  
  async getServiceUser(id: number): Promise<ServiceUser | undefined> {
    return this.serviceUsersStore.get(id);
  }
  
  async getServiceUserByUniqueId(uniqueId: string): Promise<ServiceUser | undefined> {
    return Array.from(this.serviceUsersStore.values()).find(
      (serviceUser) => serviceUser.uniqueId === uniqueId,
    );
  }
  
  async createServiceUser(insertServiceUser: InsertServiceUser): Promise<ServiceUser> {
    const id = this.serviceUserCurrentId++;
    const serviceUser: ServiceUser = { ...insertServiceUser, id };
    this.serviceUsersStore.set(id, serviceUser);
    return serviceUser;
  }
  
  async updateServiceUser(id: number, serviceUserUpdate: Partial<InsertServiceUser>): Promise<ServiceUser | undefined> {
    const existingServiceUser = this.serviceUsersStore.get(id);
    if (!existingServiceUser) {
      return undefined;
    }
    
    const updatedServiceUser: ServiceUser = { ...existingServiceUser, ...serviceUserUpdate };
    this.serviceUsersStore.set(id, updatedServiceUser);
    return updatedServiceUser;
  }
  
  // Care Plan operations
  async getCarePlans(serviceUserId: number): Promise<CarePlan[]> {
    return Array.from(this.carePlansStore.values()).filter(
      (carePlan) => carePlan.serviceUserId === serviceUserId,
    );
  }
  
  async getCarePlan(id: number): Promise<CarePlan | undefined> {
    return this.carePlansStore.get(id);
  }
  
  async createCarePlan(insertCarePlan: InsertCarePlan): Promise<CarePlan> {
    const id = this.carePlanCurrentId++;
    const carePlan: CarePlan = { ...insertCarePlan, id };
    this.carePlansStore.set(id, carePlan);
    return carePlan;
  }
  
  async updateCarePlan(id: number, carePlanUpdate: Partial<InsertCarePlan>): Promise<CarePlan | undefined> {
    const existingCarePlan = this.carePlansStore.get(id);
    if (!existingCarePlan) {
      return undefined;
    }
    
    const updatedCarePlan: CarePlan = { ...existingCarePlan, ...carePlanUpdate };
    this.carePlansStore.set(id, updatedCarePlan);
    return updatedCarePlan;
  }
  
  // Goal operations
  async getGoals(carePlanId: number): Promise<Goal[]> {
    return Array.from(this.goalsStore.values()).filter(
      (goal) => goal.carePlanId === carePlanId,
    );
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goalsStore.get(id);
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalCurrentId++;
    const goal: Goal = { ...insertGoal, id };
    this.goalsStore.set(id, goal);
    return goal;
  }
  
  async updateGoal(id: number, goalUpdate: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existingGoal = this.goalsStore.get(id);
    if (!existingGoal) {
      return undefined;
    }
    
    const updatedGoal: Goal = { ...existingGoal, ...goalUpdate };
    this.goalsStore.set(id, updatedGoal);
    return updatedGoal;
  }
  
  // Task operations
  async getTasks(carePlanId: number): Promise<Task[]> {
    return Array.from(this.tasksStore.values()).filter(
      (task) => task.carePlanId === carePlanId,
    );
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksStore.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const task: Task = { ...insertTask, id };
    this.tasksStore.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasksStore.get(id);
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask: Task = { ...existingTask, ...taskUpdate };
    this.tasksStore.set(id, updatedTask);
    return updatedTask;
  }
  
  // Appointment operations
  async getAppointments(serviceUserId: number, date?: string): Promise<Appointment[]> {
    let appointments = Array.from(this.appointmentsStore.values()).filter(
      (appointment) => appointment.serviceUserId === serviceUserId,
    );
    
    if (date) {
      appointments = appointments.filter(
        (appointment) => appointment.date === date,
      );
    }
    
    return appointments;
  }
  
  async getAppointmentsForCaregiver(caregiverId: number, date?: string): Promise<Appointment[]> {
    let appointments = Array.from(this.appointmentsStore.values()).filter(
      (appointment) => appointment.caregiverId === caregiverId,
    );
    
    if (date) {
      appointments = appointments.filter(
        (appointment) => appointment.date === date,
      );
    }
    
    return appointments;
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointmentsStore.get(id);
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointmentsStore.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointmentsStore.get(id);
    if (!existingAppointment) {
      return undefined;
    }
    
    const updatedAppointment: Appointment = { ...existingAppointment, ...appointmentUpdate };
    this.appointmentsStore.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Note operations
  async getNotes(serviceUserId: number): Promise<Note[]> {
    return Array.from(this.notesStore.values()).filter(
      (note) => note.serviceUserId === serviceUserId,
    );
  }
  
  async getNote(id: number): Promise<Note | undefined> {
    return this.notesStore.get(id);
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const note: Note = { ...insertNote, id };
    this.notesStore.set(id, note);
    return note;
  }
  
  // Risk Assessment operations
  async getRiskAssessments(serviceUserId: number): Promise<RiskAssessment[]> {
    return Array.from(this.riskAssessmentsStore.values()).filter(
      (riskAssessment) => riskAssessment.serviceUserId === serviceUserId,
    );
  }
  
  async getRiskAssessment(id: number): Promise<RiskAssessment | undefined> {
    return this.riskAssessmentsStore.get(id);
  }
  
  async createRiskAssessment(insertRiskAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = this.riskAssessmentCurrentId++;
    const riskAssessment: RiskAssessment = { ...insertRiskAssessment, id };
    this.riskAssessmentsStore.set(id, riskAssessment);
    return riskAssessment;
  }
  
  async updateRiskAssessment(id: number, riskAssessmentUpdate: Partial<InsertRiskAssessment>): Promise<RiskAssessment | undefined> {
    const existingRiskAssessment = this.riskAssessmentsStore.get(id);
    if (!existingRiskAssessment) {
      return undefined;
    }
    
    const updatedRiskAssessment: RiskAssessment = { ...existingRiskAssessment, ...riskAssessmentUpdate };
    this.riskAssessmentsStore.set(id, updatedRiskAssessment);
    return updatedRiskAssessment;
  }
  
  // Resource Location operations
  async getAllResourceLocations(): Promise<ResourceLocation[]> {
    return Array.from(this.resourceLocationsStore.values());
  }
  
  async getResourceLocation(id: number): Promise<ResourceLocation | undefined> {
    return this.resourceLocationsStore.get(id);
  }
  
  async createResourceLocation(location: InsertResourceLocation): Promise<ResourceLocation> {
    const id = this.resourceLocationCurrentId++;
    const resourceLocation: ResourceLocation = { ...location, id };
    this.resourceLocationsStore.set(id, resourceLocation);
    return resourceLocation;
  }
  
  async updateResourceLocation(id: number, locationUpdate: Partial<InsertResourceLocation>): Promise<ResourceLocation | undefined> {
    const existingLocation = this.resourceLocationsStore.get(id);
    if (!existingLocation) {
      return undefined;
    }
    
    const updatedLocation: ResourceLocation = { ...existingLocation, ...locationUpdate };
    this.resourceLocationsStore.set(id, updatedLocation);
    return updatedLocation;
  }
  
  // Community Resource operations
  async getAllCommunityResources(): Promise<CommunityResource[]> {
    return Array.from(this.communityResourcesStore.values());
  }
  
  async getCommunityResourcesByCategory(category: string): Promise<CommunityResource[]> {
    return Array.from(this.communityResourcesStore.values()).filter(
      (resource) => resource.categories.includes(category)
    );
  }
  
  async getCommunityResourcesByLocation(locationId: number): Promise<CommunityResource[]> {
    return Array.from(this.communityResourcesStore.values()).filter(
      (resource) => resource.locationId === locationId
    );
  }
  
  async getCommunityResource(id: number): Promise<CommunityResource | undefined> {
    return this.communityResourcesStore.get(id);
  }
  
  async createCommunityResource(resource: InsertCommunityResource): Promise<CommunityResource> {
    const id = this.communityResourceCurrentId++;
    const communityResource: CommunityResource = { 
      ...resource, 
      id,
      reviewCount: 0
    };
    this.communityResourcesStore.set(id, communityResource);
    return communityResource;
  }
  
  async updateCommunityResource(id: number, resourceUpdate: Partial<InsertCommunityResource>): Promise<CommunityResource | undefined> {
    const existingResource = this.communityResourcesStore.get(id);
    if (!existingResource) {
      return undefined;
    }
    
    const updatedResource: CommunityResource = { ...existingResource, ...resourceUpdate };
    this.communityResourcesStore.set(id, updatedResource);
    return updatedResource;
  }
  
  async searchCommunityResources(query: string, filters?: any): Promise<CommunityResource[]> {
    const normalizedQuery = query.toLowerCase().trim();
    
    return Array.from(this.communityResourcesStore.values()).filter(resource => {
      const nameMatch = resource.name.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = resource.description.toLowerCase().includes(normalizedQuery);
      
      // Apply additional filters if provided
      let matchesFilters = true;
      if (filters) {
        if (filters.isFree !== undefined && resource.isFree !== filters.isFree) {
          matchesFilters = false;
        }
        
        if (filters.isReferralRequired !== undefined && resource.isReferralRequired !== filters.isReferralRequired) {
          matchesFilters = false;
        }
        
        if (filters.status && resource.status !== filters.status) {
          matchesFilters = false;
        }
        
        if (filters.categories && filters.categories.length > 0) {
          const hasMatchingCategory = resource.categories.some(cat => 
            filters.categories.includes(cat)
          );
          if (!hasMatchingCategory) {
            matchesFilters = false;
          }
        }
      }
      
      return (nameMatch || descriptionMatch) && matchesFilters;
    });
  }
  
  // Resource Referral operations
  async getReferrals(serviceUserId?: number, resourceId?: number): Promise<ResourceReferral[]> {
    let referrals = Array.from(this.resourceReferralsStore.values());
    
    if (serviceUserId !== undefined) {
      referrals = referrals.filter(referral => referral.serviceUserId === serviceUserId);
    }
    
    if (resourceId !== undefined) {
      referrals = referrals.filter(referral => referral.resourceId === resourceId);
    }
    
    return referrals;
  }
  
  async getReferral(id: number): Promise<ResourceReferral | undefined> {
    return this.resourceReferralsStore.get(id);
  }
  
  async createReferral(referral: InsertResourceReferral): Promise<ResourceReferral> {
    const id = this.resourceReferralCurrentId++;
    const resourceReferral: ResourceReferral = { ...referral, id };
    this.resourceReferralsStore.set(id, resourceReferral);
    return resourceReferral;
  }
  
  async updateReferral(id: number, referralUpdate: Partial<InsertResourceReferral>): Promise<ResourceReferral | undefined> {
    const existingReferral = this.resourceReferralsStore.get(id);
    if (!existingReferral) {
      return undefined;
    }
    
    const updatedReferral: ResourceReferral = { ...existingReferral, ...referralUpdate };
    this.resourceReferralsStore.set(id, updatedReferral);
    return updatedReferral;
  }
  
  // Resource Review operations
  async getReviews(resourceId: number): Promise<ResourceReview[]> {
    return Array.from(this.resourceReviewsStore.values()).filter(
      (review) => review.resourceId === resourceId
    );
  }
  
  async getReview(id: number): Promise<ResourceReview | undefined> {
    return this.resourceReviewsStore.get(id);
  }
  
  async createReview(review: InsertResourceReview): Promise<ResourceReview> {
    const id = this.resourceReviewCurrentId++;
    const resourceReview: ResourceReview = { ...review, id };
    this.resourceReviewsStore.set(id, resourceReview);
    
    // Update the resource's rating and review count
    const resourceId = review.resourceId;
    const resource = this.communityResourcesStore.get(resourceId);
    if (resource) {
      const reviews = this.getReviews(resourceId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const averageRating = totalRating / (reviews.length + 1);
      
      const updatedResource: CommunityResource = {
        ...resource,
        rating: averageRating,
        reviewCount: reviews.length + 1
      };
      
      this.communityResourcesStore.set(resourceId, updatedResource);
    }
    
    return resourceReview;
  }
  
  async updateReview(id: number, reviewUpdate: Partial<InsertResourceReview>): Promise<ResourceReview | undefined> {
    const existingReview = this.resourceReviewsStore.get(id);
    if (!existingReview) {
      return undefined;
    }
    
    const updatedReview: ResourceReview = { ...existingReview, ...reviewUpdate };
    this.resourceReviewsStore.set(id, updatedReview);
    
    // If rating changed, update the resource's average rating
    if (reviewUpdate.rating && reviewUpdate.rating !== existingReview.rating) {
      const resourceId = existingReview.resourceId;
      const resource = this.communityResourcesStore.get(resourceId);
      
      if (resource) {
        const reviews = await this.getReviews(resourceId);
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        const updatedResource: CommunityResource = {
          ...resource,
          rating: averageRating
        };
        
        this.communityResourcesStore.set(resourceId, updatedResource);
      }
    }
    
    return updatedReview;
  }
  
  // Resource Bookmark operations
  async getBookmarks(userId: number): Promise<ResourceBookmark[]> {
    return Array.from(this.resourceBookmarksStore.values()).filter(
      (bookmark) => bookmark.userId === userId
    );
  }
  
  async getBookmark(id: number): Promise<ResourceBookmark | undefined> {
    return this.resourceBookmarksStore.get(id);
  }
  
  async createBookmark(bookmark: InsertResourceBookmark): Promise<ResourceBookmark> {
    const id = this.resourceBookmarkCurrentId++;
    const resourceBookmark: ResourceBookmark = { ...bookmark, id };
    this.resourceBookmarksStore.set(id, resourceBookmark);
    return resourceBookmark;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    if (!this.resourceBookmarksStore.has(id)) {
      return false;
    }
    
    return this.resourceBookmarksStore.delete(id);
  }
  
  // Seed initial data
  async seedInitialData(): Promise<void> {
    // Already handled in constructor
    this._seedInitialData();
  }
  
  // Private method to seed initial data for demo purposes
  private _seedInitialData() {
    // This will be populated by the server when needed
    console.log("In-memory storage initialized");
  }
}

// Switch to database storage
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
