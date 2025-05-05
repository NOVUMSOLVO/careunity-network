import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./auth";
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
  // Add diagnostic routes for testing server connection
  app.get("/api/healthcheck", (req, res) => {
    res.json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
  });
  
  // Add routes to serve test.html directly
  const testHtmlPath = path.join(process.cwd(), "client/public/test.html");
  console.log(`Test HTML path: ${testHtmlPath}`);
  
  // Serve test.html at multiple paths to ensure it can be accessed
  app.get("/", (req, res) => {
    console.log("Request received at /");
    res.sendFile(testHtmlPath);
  });
  
  app.get("/test", (req, res) => {
    console.log("Request received at /test");
    res.sendFile(testHtmlPath);
  });
  
  app.get("/test.html", (req, res) => {
    console.log("Request received at /test.html");
    res.sendFile(testHtmlPath);
  });
  
  // Setup authentication routes
  setupAuth(app);

  // Seed initial data if none exists
  await storage.seedInitialData();

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
      
      let weeklyAppointments: any[] = [];
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