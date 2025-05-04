import { 
  users, User, InsertUser, 
  serviceUsers, ServiceUser, InsertServiceUser,
  carePlans, CarePlan, InsertCarePlan,
  goals, Goal, InsertGoal,
  tasks, Task, InsertTask,
  appointments, Appointment, InsertAppointment,
  notes, Note, InsertNote,
  riskAssessments, RiskAssessment, InsertRiskAssessment
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
  
  sessionStore: session.Store;
  
  userCurrentId: number;
  serviceUserCurrentId: number;
  carePlanCurrentId: number;
  goalCurrentId: number;
  taskCurrentId: number;
  appointmentCurrentId: number;
  noteCurrentId: number;
  riskAssessmentCurrentId: number;

  constructor() {
    this.usersStore = new Map();
    this.serviceUsersStore = new Map();
    this.carePlansStore = new Map();
    this.goalsStore = new Map();
    this.tasksStore = new Map();
    this.appointmentsStore = new Map();
    this.notesStore = new Map();
    this.riskAssessmentsStore = new Map();
    
    this.userCurrentId = 1;
    this.serviceUserCurrentId = 1;
    this.carePlanCurrentId = 1;
    this.goalCurrentId = 1;
    this.taskCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.noteCurrentId = 1;
    this.riskAssessmentCurrentId = 1;
    
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
