import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import { format } from "date-fns";
import { insertServiceUserSchema, insertCarePlanSchema, insertGoalSchema, insertTaskSchema, insertAppointmentSchema, insertNoteSchema, insertRiskAssessmentSchema } from "@shared/schema";

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Seed initial data if none exists
  await seedInitialData();

  // Service User endpoints
  app.get("/api/service-users", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUsers = await storage.getAllServiceUsers();
      res.json(serviceUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve service users" });
    }
  });

  app.get("/api/service-users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceUser = await storage.getServiceUser(id);
      
      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found" });
      }
      
      res.json(serviceUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve service user" });
    }
  });

  app.post("/api/service-users", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceUserSchema.parse(req.body);
      const serviceUser = await storage.createServiceUser(validatedData);
      res.status(201).json(serviceUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service user" });
    }
  });

  app.patch("/api/service-users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingServiceUser = await storage.getServiceUser(id);
      
      if (!existingServiceUser) {
        return res.status(404).json({ message: "Service user not found" });
      }
      
      const validatedData = insertServiceUserSchema.partial().parse(req.body);
      const updatedServiceUser = await storage.updateServiceUser(id, validatedData);
      res.json(updatedServiceUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service user" });
    }
  });

  // Care Plan endpoints
  app.get("/api/service-users/:id/care-plans", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUserId = parseInt(req.params.id);
      const serviceUser = await storage.getServiceUser(serviceUserId);
      
      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found" });
      }
      
      const carePlans = await storage.getCarePlans(serviceUserId);
      res.json(carePlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve care plans" });
    }
  });

  app.post("/api/care-plans", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCarePlanSchema.parse(req.body);
      const carePlan = await storage.createCarePlan(validatedData);
      res.status(201).json(carePlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid care plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create care plan" });
    }
  });

  app.get("/api/care-plans/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const carePlan = await storage.getCarePlan(id);
      
      if (!carePlan) {
        return res.status(404).json({ message: "Care plan not found" });
      }
      
      // Get goals and tasks for this care plan
      const goals = await storage.getGoals(id);
      const tasks = await storage.getTasks(id);
      
      res.json({
        ...carePlan,
        goals,
        tasks
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve care plan" });
    }
  });

  // Goal endpoints
  app.post("/api/goals", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingGoal = await storage.getGoal(id);
      
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(id, validatedData);
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Task endpoints
  app.post("/api/tasks", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTask = await storage.getTask(id);
      
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, validatedData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Appointment endpoints
  app.get("/api/service-users/:id/appointments", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUserId = parseInt(req.params.id);
      const date = req.query.date as string | undefined;
      
      const appointments = await storage.getAppointments(serviceUserId, date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve appointments" });
    }
  });

  app.get("/api/appointments/caregiver", ensureAuthenticated, async (req, res) => {
    try {
      const caregiverId = (req.user as any).id;
      const date = req.query.date as string | undefined;
      
      const appointments = await storage.getAppointmentsForCaregiver(caregiverId, date);
      
      // Get service user details for each appointment
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (appointment) => {
          const serviceUser = await storage.getServiceUser(appointment.serviceUserId);
          return {
            ...appointment,
            serviceUser
          };
        })
      );
      
      res.json(appointmentsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve appointments" });
    }
  });

  app.post("/api/appointments", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingAppointment = await storage.getAppointment(id);
      
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const updatedAppointment = await storage.updateAppointment(id, validatedData);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Note endpoints
  app.get("/api/service-users/:id/notes", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUserId = parseInt(req.params.id);
      const notes = await storage.getNotes(serviceUserId);
      
      // Get author details for each note
      const notesWithAuthor = await Promise.all(
        notes.map(async (note) => {
          const author = await storage.getUser(note.createdBy);
          return {
            ...note,
            author: author ? { id: author.id, fullName: author.fullName } : undefined
          };
        })
      );
      
      res.json(notesWithAuthor);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve notes" });
    }
  });

  app.post("/api/notes", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse({
        ...req.body,
        createdBy: (req.user as any).id,
        timestamp: format(new Date(), "yyyy-MM-dd HH:mm")
      });
      
      const note = await storage.createNote(validatedData);
      
      // Get author details
      const author = await storage.getUser(note.createdBy);
      
      res.status(201).json({
        ...note,
        author: author ? { id: author.id, fullName: author.fullName } : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Risk Assessment endpoints
  app.get("/api/service-users/:id/risk-assessments", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUserId = parseInt(req.params.id);
      const riskAssessments = await storage.getRiskAssessments(serviceUserId);
      res.json(riskAssessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve risk assessments" });
    }
  });

  app.post("/api/risk-assessments", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const riskAssessment = await storage.createRiskAssessment(validatedData);
      res.status(201).json(riskAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid risk assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create risk assessment" });
    }
  });

  app.patch("/api/risk-assessments/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingRiskAssessment = await storage.getRiskAssessment(id);
      
      if (!existingRiskAssessment) {
        return res.status(404).json({ message: "Risk assessment not found" });
      }
      
      const validatedData = insertRiskAssessmentSchema.partial().parse(req.body);
      const updatedRiskAssessment = await storage.updateRiskAssessment(id, validatedData);
      res.json(updatedRiskAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid risk assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update risk assessment" });
    }
  });

  // API endpoint for dashboard stats
  app.get("/api/dashboard/stats", ensureAuthenticated, async (req, res) => {
    try {
      const caregiverId = (req.user as any).id;
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Get appointments for today
      const todayAppointments = await storage.getAppointmentsForCaregiver(caregiverId, today);
      
      // Calculate care hours for the week
      const todayTimestamp = new Date();
      const weekStart = new Date(todayTimestamp);
      weekStart.setDate(todayTimestamp.getDate() - todayTimestamp.getDay());
      
      let weeklyAppointments = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const formattedDate = format(date, "yyyy-MM-dd");
        
        const dayAppointments = await storage.getAppointmentsForCaregiver(caregiverId, formattedDate);
        weeklyAppointments = [...weeklyAppointments, ...dayAppointments];
      }
      
      // Calculate care hours from appointments
      let careHours = 0;
      const serviceUserIds = new Set<number>();
      
      weeklyAppointments.forEach(appointment => {
        const startHour = parseInt(appointment.startTime.split(":")[0]);
        const startMinute = parseInt(appointment.startTime.split(":")[1]);
        
        const endHour = parseInt(appointment.endTime.split(":")[0]);
        const endMinute = parseInt(appointment.endTime.split(":")[1]);
        
        const duration = (endHour - startHour) + (endMinute - startMinute) / 60;
        careHours += duration;
        
        serviceUserIds.add(appointment.serviceUserId);
      });
      
      // Get pending tasks
      const pendingTasks = [];
      for (const appointment of todayAppointments) {
        const serviceUser = await storage.getServiceUser(appointment.serviceUserId);
        if (serviceUser) {
          pendingTasks.push({
            id: appointment.id,
            type: 'appointment',
            title: `Complete Care Notes - ${serviceUser.fullName}`,
            description: `From visit on ${today}, ${appointment.startTime}`,
            serviceUserId: serviceUser.id,
            serviceUserName: serviceUser.fullName
          });
        }
      }
      
      res.json({
        todayAppointmentsCount: todayAppointments.length,
        careHours: careHours.toFixed(1),
        serviceUsersCount: serviceUserIds.size,
        pendingTasks,
        carePlanCompliance: "98%" // Demo value - in production would be calculated
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Seed initial data for demo
async function seedInitialData() {
  // Check if we already have users
  const existingUsers = await storage.getUserByUsername("sarah.johnson");
  if (existingUsers) {
    return; // Already seeded
  }

  // Create demo users
  const sampleCaregiver = await storage.createUser({
    username: "sarah.johnson",
    password: await hashPassword("password123"),
    fullName: "Sarah Johnson",
    email: "sarah.johnson@careunity.com",
    role: "caregiver",
    phoneNumber: "+44 7700 900123",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
  });

  const sampleAdmin = await storage.createUser({
    username: "admin",
    password: await hashPassword("admin123"),
    fullName: "Admin User",
    email: "admin@careunity.com",
    role: "admin",
    phoneNumber: "+44 7700 900456",
    profileImage: ""
  });

  // Create service users
  const jamesWilson = await storage.createServiceUser({
    uniqueId: "SU-2023-001",
    fullName: "James Wilson",
    dateOfBirth: "1945-03-22",
    address: "24 Oak Street, London",
    phoneNumber: "+44 7700 900123",
    emergencyContact: "David Wilson (Son) +44 7700 900124",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=160&q=80",
    preferences: JSON.stringify({
      likes: ["Classical music (especially Mozart)", "Historical novels", "Gardening", "Tea with one sugar", "Morning shower"],
      dislikes: ["Coffee", "Loud environments", "Reality TV shows", "Being rushed during meals"]
    }),
    needs: JSON.stringify({
      mobility: "Uses walking stick occasionally",
      personalCare: "Independent with some assistance for bathing",
      medication: "Needs reminders for medication",
      nutrition: "No dietary restrictions"
    }),
    lifeStory: "James worked as a teacher for 35 years before retiring. He has been widowed for 5 years and has two children who live abroad. He enjoys classical music, reading historical novels, and gardening."
  });

  const emilyParker = await storage.createServiceUser({
    uniqueId: "SU-2023-002",
    fullName: "Emily Parker",
    dateOfBirth: "1938-11-05",
    address: "5 Maple Avenue, London",
    phoneNumber: "+44 7700 900456",
    emergencyContact: "Jennifer Parker (Daughter) +44 7700 900457",
    profileImage: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=160&q=80",
    preferences: JSON.stringify({
      likes: ["Knitting", "Television dramas", "Shortbread biscuits", "Afternoon tea", "Warm baths"],
      dislikes: ["Spicy food", "Cold weather", "Being alone at night"]
    }),
    needs: JSON.stringify({
      mobility: "Uses walker for support",
      personalCare: "Needs assistance with bathing and dressing",
      medication: "Requires medication administration",
      nutrition: "Low salt diet"
    }),
    lifeStory: "Emily was a nurse for 40 years. She has three children and five grandchildren. She enjoys knitting and watching period dramas on television."
  });

  const robertThompson = await storage.createServiceUser({
    uniqueId: "SU-2023-003",
    fullName: "Robert Thompson",
    dateOfBirth: "1951-07-18",
    address: "17 Pine Road, London",
    phoneNumber: "+44 7700 900789",
    emergencyContact: "Susan Thompson (Wife) +44 7700 900790",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=160&q=80",
    preferences: JSON.stringify({
      likes: ["Jazz music", "Chess", "Documentaries", "Coffee with milk", "Reading newspapers"],
      dislikes: ["Processed food", "Pop music", "Technological devices"]
    }),
    needs: JSON.stringify({
      mobility: "Independent",
      personalCare: "Independent",
      medication: "Self-administered",
      nutrition: "Prefers home-cooked meals"
    }),
    lifeStory: "Robert was an accountant who retired early due to health issues. He lives with his wife Susan and enjoys chess and jazz music."
  });

  // Create care plans
  const jamesCarePlan = await storage.createCarePlan({
    serviceUserId: jamesWilson.id,
    title: "James Wilson Care Plan",
    summary: "Focus on maintaining independence while providing necessary support",
    startDate: "2023-05-01",
    reviewDate: "2023-11-01",
    status: "active"
  });

  // Create goals
  await storage.createGoal({
    carePlanId: jamesCarePlan.id,
    title: "Maintain independence with personal care",
    description: "James wants to maintain his ability to wash and dress himself with minimal assistance.",
    startDate: "2023-05-10",
    targetDate: "2023-12-10",
    status: "on track",
    progressPercentage: 75
  });

  await storage.createGoal({
    carePlanId: jamesCarePlan.id,
    title: "Join community garden project",
    description: "James would like to join the local community garden to pursue his interest in gardening and meet new people.",
    startDate: "2023-06-05",
    targetDate: "2023-09-05",
    status: "in progress",
    progressPercentage: 40
  });

  await storage.createGoal({
    carePlanId: jamesCarePlan.id,
    title: "Regular video calls with family abroad",
    description: "James wants to have regular video calls with his children who live abroad.",
    startDate: "2023-04-15",
    targetDate: "2023-10-15",
    status: "on track",
    progressPercentage: 90
  });

  // Create tasks
  await storage.createTask({
    carePlanId: jamesCarePlan.id,
    title: "Personal Care",
    description: "Support with morning shower, encourage independence but assist with hard-to-reach areas. Observe skin condition and report any concerns.",
    category: "personal care",
    timeOfDay: "morning",
    completed: false
  });

  await storage.createTask({
    carePlanId: jamesCarePlan.id,
    title: "Medication",
    description: "Prompt to take morning medication with breakfast (see medication chart). Observe and document.",
    category: "medication",
    timeOfDay: "morning",
    completed: false
  });

  await storage.createTask({
    carePlanId: jamesCarePlan.id,
    title: "Breakfast",
    description: "Prepare breakfast of choice. James prefers toast with marmalade and tea with one sugar. Monitor food intake.",
    category: "nutrition",
    timeOfDay: "morning",
    completed: false
  });

  await storage.createTask({
    carePlanId: jamesCarePlan.id,
    title: "Medication",
    description: "Prompt to take evening medication after dinner (see medication chart). Observe and document.",
    category: "medication",
    timeOfDay: "evening",
    completed: false
  });

  await storage.createTask({
    carePlanId: jamesCarePlan.id,
    title: "Evening Routine",
    description: "Support with preparing for bed. Ensure glasses and emergency alarm are within reach. Check house is secure.",
    category: "personal care",
    timeOfDay: "evening",
    completed: false
  });

  // Create risk assessments
  await storage.createRiskAssessment({
    serviceUserId: jamesWilson.id,
    category: "falls",
    riskLevel: "medium",
    description: "History of occasional unsteadiness, especially in the bathroom.",
    mitigations: JSON.stringify([
      "Non-slip mats in bathroom",
      "Walking aid accessible",
      "Clear pathways in home"
    ]),
    reviewDate: "2023-11-01"
  });

  await storage.createRiskAssessment({
    serviceUserId: jamesWilson.id,
    category: "medication",
    riskLevel: "low",
    description: "Good compliance with medication regime when prompted.",
    mitigations: JSON.stringify([
      "Medication prompts",
      "Weekly dosette box",
      "Regular medication review"
    ]),
    reviewDate: "2023-11-01"
  });

  await storage.createRiskAssessment({
    serviceUserId: jamesWilson.id,
    category: "nutrition",
    riskLevel: "low",
    description: "Good appetite but occasional forgetfulness about meals.",
    mitigations: JSON.stringify([
      "Regular meal prompts",
      "Easily accessible snacks",
      "Monitoring of food intake"
    ]),
    reviewDate: "2023-11-01"
  });

  // Create appointments
  const currentDate = format(new Date(), "yyyy-MM-dd");

  await storage.createAppointment({
    serviceUserId: jamesWilson.id,
    caregiverId: sampleCaregiver.id,
    title: "Morning Care Visit",
    description: "Personal care, medication, breakfast",
    date: currentDate,
    startTime: "09:00",
    endTime: "10:30",
    status: "scheduled",
    location: "24 Oak Street, London",
    visitType: "personal care"
  });

  await storage.createAppointment({
    serviceUserId: emilyParker.id,
    caregiverId: sampleCaregiver.id,
    title: "Medication Visit",
    description: "Medication administration",
    date: currentDate,
    startTime: "12:00",
    endTime: "12:30",
    status: "scheduled",
    location: "5 Maple Avenue, London",
    visitType: "medication"
  });

  await storage.createAppointment({
    serviceUserId: robertThompson.id,
    caregiverId: sampleCaregiver.id,
    title: "Social Support Visit",
    description: "Social activity and meal preparation",
    date: currentDate,
    startTime: "14:00",
    endTime: "15:30",
    status: "scheduled",
    location: "17 Pine Road, London",
    visitType: "social support"
  });

  // Create notes
  await storage.createNote({
    serviceUserId: jamesWilson.id,
    createdBy: sampleCaregiver.id,
    content: "James was in good spirits today. We discussed his gardening plans for the spring. He took all medications as prescribed and ate a good breakfast.",
    timestamp: format(new Date(Date.now() - 86400000), "yyyy-MM-dd HH:mm"), // Yesterday
    category: "general",
    isVoiceRecorded: false
  });

  await storage.createNote({
    serviceUserId: emilyParker.id,
    createdBy: sampleCaregiver.id,
    content: "Emily complained of slight joint pain today. Applied prescribed cream to affected areas. Will monitor and inform GP if pain persists.",
    timestamp: format(new Date(Date.now() - 172800000), "yyyy-MM-dd HH:mm"), // 2 days ago
    category: "health",
    isVoiceRecorded: false
  });
}
