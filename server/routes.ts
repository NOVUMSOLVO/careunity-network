import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { format } from "date-fns";
import { 
  insertServiceUserSchema, insertCarePlanSchema, insertGoalSchema, insertTaskSchema, 
  insertAppointmentSchema, insertNoteSchema, insertRiskAssessmentSchema,
  insertResourceLocationSchema, insertCommunityResourceSchema, insertResourceReferralSchema,
  insertResourceReviewSchema, insertResourceBookmarkSchema
} from "@shared/schema";

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
  
  // Let Vite handle the index.html
  app.get("/", (req, res, next) => {
    console.log("Request received at /");
    next();
  });
  
  app.get("/test", (req, res) => {
    console.log("Request received at /test");
    res.sendFile(testHtmlPath);
  });
  
  app.get("/test.html", (req, res) => {
    console.log("Request received at /test.html");
    res.sendFile(testHtmlPath);
  });
  
  // Add a static HTML page with minimal JS
  app.get("/static", (req, res) => {
    console.log("Request received at /static");
    res.sendFile(path.join(process.cwd(), "client/public/static.html"));
  });
  
  // Add a route for our simplified React version
  app.get("/react", (req, res) => {
    console.log("Request received at /react");
    res.sendFile(path.join(process.cwd(), "client/public/react-version.html"));
  });
  
  // Add a route for inline React version (no build process)
  app.get("/inline", (req, res) => {
    console.log("Request received at /inline");
    res.sendFile(path.join(process.cwd(), "client/public/inline-react.html"));
  });
  
  // Add a direct HTML response route
  app.get("/direct", (req, res) => {
    console.log("Request received at /direct");
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CareUnity Direct Response</title>
        <style>
          body {
            background-color: #8b5cf6;
            font-family: -apple-system, system-ui, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          }
          h1 { color: #4f46e5; }
          p { color: #4b5563; }
          .status { 
            background: #f3f4f6; 
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>CareUnity Direct Response</h1>
          <p>This HTML was sent directly from the server as a response, not from a file.</p>
          <p>If you can see this page, the server and Express routes are working correctly.</p>
          <div class="status">
            Server time: ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `);
  });
  
  // Setup authentication routes
  setupAuth(app);
  
  // Simple health check API route that doesn't require authentication
  app.get("/api/healthcheck", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "CareUnity API is working properly"
    });
  });

  // Seed initial data if none exists
  await storage.seedInitialData();
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server on a separate path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to CareUnity WebSocket server',
      timestamp: new Date().toISOString()
    }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
      console.log(`Received WebSocket message: ${message}`);
      try {
        // Echo the message back for now
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'echo',
            message: message.toString(),
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

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

  // Resource Location endpoints
  app.get("/api/resource-locations", ensureAuthenticated, async (req, res) => {
    try {
      const locations = await storage.getAllResourceLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource locations" });
    }
  });

  app.get("/api/resource-locations/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getResourceLocation(id);
      
      if (!location) {
        return res.status(404).json({ message: "Resource location not found" });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource location" });
    }
  });

  app.post("/api/resource-locations", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResourceLocationSchema.parse(req.body);
      const location = await storage.createResourceLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource location" });
    }
  });

  app.patch("/api/resource-locations/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingLocation = await storage.getResourceLocation(id);
      
      if (!existingLocation) {
        return res.status(404).json({ message: "Resource location not found" });
      }
      
      const validatedData = insertResourceLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateResourceLocation(id, validatedData);
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resource location" });
    }
  });

  // Community Resource endpoints
  app.get("/api/community-resources", ensureAuthenticated, async (req, res) => {
    try {
      let resources;
      const category = req.query.category as string;
      const searchQuery = req.query.q as string;
      const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
      
      if (searchQuery) {
        resources = await storage.searchCommunityResources(searchQuery);
      } else if (category) {
        resources = await storage.getCommunityResourcesByCategory(category);
      } else if (locationId) {
        resources = await storage.getCommunityResourcesByLocation(locationId);
      } else {
        resources = await storage.getAllCommunityResources();
      }
      
      // Enhance resources with location data
      const resourcesWithLocation = await Promise.all(
        resources.map(async (resource) => {
          if (resource.locationId) {
            const location = await storage.getResourceLocation(resource.locationId);
            return {
              ...resource,
              location
            };
          }
          return resource;
        })
      );
      
      res.json(resourcesWithLocation);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve community resources" });
    }
  });

  app.get("/api/community-resources/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getCommunityResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Community resource not found" });
      }
      
      // Enhance resource with location data
      if (resource.locationId) {
        const location = await storage.getResourceLocation(resource.locationId);
        if (location) {
          resource.location = location;
        }
      }
      
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve community resource" });
    }
  });

  app.post("/api/community-resources", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCommunityResourceSchema.parse({
        ...req.body,
        lastUpdated: format(new Date(), "yyyy-MM-dd")
      });
      const resource = await storage.createCommunityResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid community resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create community resource" });
    }
  });

  app.patch("/api/community-resources/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingResource = await storage.getCommunityResource(id);
      
      if (!existingResource) {
        return res.status(404).json({ message: "Community resource not found" });
      }
      
      const validatedData = insertCommunityResourceSchema.partial().parse({
        ...req.body,
        lastUpdated: format(new Date(), "yyyy-MM-dd")
      });
      const updatedResource = await storage.updateCommunityResource(id, validatedData);
      res.json(updatedResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid community resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update community resource" });
    }
  });

  // Resource Referral endpoints
  app.get("/api/resource-referrals", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUserId = req.query.serviceUserId ? parseInt(req.query.serviceUserId as string) : undefined;
      const resourceId = req.query.resourceId ? parseInt(req.query.resourceId as string) : undefined;
      
      const referrals = await storage.getReferrals(serviceUserId, resourceId);
      
      // Enhance referrals with resource and service user names
      const enhancedReferrals = await Promise.all(
        referrals.map(async (referral) => {
          const resourcePromise = storage.getCommunityResource(referral.resourceId);
          const serviceUserPromise = storage.getServiceUser(referral.serviceUserId);
          const referrerPromise = storage.getUser(referral.referrerId);
          
          const [resource, serviceUser, referrer] = await Promise.all([
            resourcePromise, serviceUserPromise, referrerPromise
          ]);
          
          return {
            ...referral,
            resourceName: resource?.name,
            serviceUserName: serviceUser?.fullName,
            referrerName: referrer?.fullName
          };
        })
      );
      
      res.json(enhancedReferrals);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource referrals" });
    }
  });

  app.get("/api/resource-referrals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const referral = await storage.getReferral(id);
      
      if (!referral) {
        return res.status(404).json({ message: "Resource referral not found" });
      }
      
      // Enhance referral with resource and service user names
      const resource = await storage.getCommunityResource(referral.resourceId);
      const serviceUser = await storage.getServiceUser(referral.serviceUserId);
      const referrer = await storage.getUser(referral.referrerId);
      
      const enhancedReferral = {
        ...referral,
        resourceName: resource?.name,
        serviceUserName: serviceUser?.fullName,
        referrerName: referrer?.fullName
      };
      
      res.json(enhancedReferral);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource referral" });
    }
  });

  app.post("/api/resource-referrals", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResourceReferralSchema.parse({
        ...req.body,
        referrerId: (req.user as any).id,
        status: 'pending' // Default status for new referrals
      });
      const referral = await storage.createReferral(validatedData);
      res.status(201).json(referral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource referral data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource referral" });
    }
  });

  app.patch("/api/resource-referrals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingReferral = await storage.getReferral(id);
      
      if (!existingReferral) {
        return res.status(404).json({ message: "Resource referral not found" });
      }
      
      const validatedData = insertResourceReferralSchema.partial().parse(req.body);
      const updatedReferral = await storage.updateReferral(id, validatedData);
      res.json(updatedReferral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource referral data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resource referral" });
    }
  });

  // Resource Review endpoints
  app.get("/api/resource-reviews", ensureAuthenticated, async (req, res) => {
    try {
      const resourceId = req.query.resourceId ? parseInt(req.query.resourceId as string) : undefined;
      
      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID is required" });
      }
      
      const reviews = await storage.getReviews(resourceId);
      
      // Enhance reviews with user info
      const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            userName: user?.fullName,
            userRole: user?.role
          };
        })
      );
      
      res.json(enhancedReviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource reviews" });
    }
  });

  app.post("/api/resource-reviews", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResourceReviewSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
        helpfulCount: 0 // Initialize helpful count
      });
      const review = await storage.createReview(validatedData);
      
      // Update the resource's average rating
      const resourceId = review.resourceId;
      const resource = await storage.getCommunityResource(resourceId);
      if (resource) {
        const reviews = await storage.getReviews(resourceId);
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await storage.updateCommunityResource(resourceId, {
          rating: averageRating,
          reviewCount: reviews.length
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource review" });
    }
  });

  app.patch("/api/resource-reviews/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingReview = await storage.getReview(id);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Resource review not found" });
      }
      
      const validatedData = insertResourceReviewSchema.partial().parse(req.body);
      const updatedReview = await storage.updateReview(id, validatedData);
      
      // Update the resource's average rating if the rating changed
      if (validatedData.rating && validatedData.rating !== existingReview.rating) {
        const resourceId = existingReview.resourceId;
        const resource = await storage.getCommunityResource(resourceId);
        if (resource) {
          const reviews = await storage.getReviews(resourceId);
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = totalRating / reviews.length;
          
          await storage.updateCommunityResource(resourceId, {
            rating: averageRating
          });
        }
      }
      
      res.json(updatedReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resource review" });
    }
  });

  // Resource Bookmark endpoints
  app.get("/api/resource-bookmarks", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource bookmarks" });
    }
  });

  app.post("/api/resource-bookmarks", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResourceBookmarkSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
        dateAdded: format(new Date(), "yyyy-MM-dd")
      });
      const bookmark = await storage.createBookmark(validatedData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource bookmark data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource bookmark" });
    }
  });

  app.delete("/api/resource-bookmarks/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookmark = await storage.getBookmark(id);
      
      if (!bookmark) {
        return res.status(404).json({ message: "Resource bookmark not found" });
      }
      
      // Only allow users to delete their own bookmarks
      if (bookmark.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Not authorized to delete this bookmark" });
      }
      
      const success = await storage.deleteBookmark(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete bookmark" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource bookmark" });
    }
  });

  return httpServer;
}