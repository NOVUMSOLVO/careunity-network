import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { format } from "date-fns";
import { WebSocketService } from './services/websocket-service';
import {
  insertServiceUserSchema, insertCarePlanSchema, insertGoalSchema, insertTaskSchema,
  insertAppointmentSchema, insertNoteSchema, insertRiskAssessmentSchema,
  insertResourceLocationSchema, insertCommunityResourceSchema, insertResourceReferralSchema,
  insertResourceReviewSchema, insertResourceBookmarkSchema,
  updateUserSchema,
  idParamSchema,
  dateQuerySchema,
  communityResourceQuerySchema
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

  // Initialize the WebSocket service
  // We'll use the existing WebSocketService instance from index.ts

  // WebSocket service is already available globally from index.ts

  // Service User endpoints
  app.get("/api/service-users", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUsers = await storage.getAllServiceUsers();
      res.json(serviceUsers);
    } catch (error) {
      console.error("Failed to retrieve service users:", error);
      res.status(500).json({ message: "Failed to retrieve service users" });
    }
  });

  app.get("/api/service-users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const serviceUser = await storage.getServiceUser(params.id);

      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found" });
      }

      res.json(serviceUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user ID", errors: error.errors });
      }
      console.error("Failed to retrieve service user:", error);
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
      console.error("Failed to create service user:", error);
      res.status(500).json({ message: "Failed to create service user" });
    }
  });

  app.patch("/api/service-users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertServiceUserSchema.partial().parse(req.body);

      const existingServiceUser = await storage.getServiceUser(params.id);
      if (!existingServiceUser) {
        return res.status(404).json({ message: "Service user not found" });
      }

      const updatedServiceUser = await storage.updateServiceUser(params.id, validatedData);
      res.json(updatedServiceUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user data or ID", errors: error.errors });
      }
      console.error("Failed to update service user:", error);
      res.status(500).json({ message: "Failed to update service user" });
    }
  });

  // Care Plan endpoints
  app.get("/api/service-users/:id/care-plans", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const serviceUser = await storage.getServiceUser(params.id);

      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found" });
      }

      const carePlans = await storage.getCarePlans(params.id);
      res.json(carePlans);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user ID", errors: error.errors });
      }
      console.error("Failed to retrieve care plans:", error);
      res.status(500).json({ message: "Failed to retrieve care plans" });
    }
  });

  app.post("/api/care-plans", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCarePlanSchema.parse(req.body);
      const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
      if (!serviceUser) {
        return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
      }
      const carePlan = await storage.createCarePlan(validatedData);
      res.status(201).json(carePlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid care plan data", errors: error.errors });
      }
      console.error("Failed to create care plan:", error);
      res.status(500).json({ message: "Failed to create care plan" });
    }
  });

  app.get("/api/care-plans/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const carePlan = await storage.getCarePlan(params.id);

      if (!carePlan) {
        return res.status(404).json({ message: "Care plan not found" });
      }

      const goals = await storage.getGoals(params.id);
      const tasks = await storage.getTasks(params.id);

      res.json({
        ...carePlan,
        goals,
        tasks
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid care plan ID", errors: error.errors });
      }
      console.error("Failed to retrieve care plan:", error);
      res.status(500).json({ message: "Failed to retrieve care plan" });
    }
  });

  // Goal endpoints
  app.post("/api/goals", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const carePlan = await storage.getCarePlan(validatedData.carePlanId);
      if (!carePlan) {
        return res.status(400).json({ message: `Care plan with ID ${validatedData.carePlanId} not found.` });
      }
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      console.error("Failed to create goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertGoalSchema.partial().parse(req.body);

      const existingGoal = await storage.getGoal(params.id);
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      if (validatedData.carePlanId && validatedData.carePlanId !== existingGoal.carePlanId) {
        const carePlan = await storage.getCarePlan(validatedData.carePlanId);
        if (!carePlan) {
          return res.status(400).json({ message: `Care plan with ID ${validatedData.carePlanId} not found.` });
        }
      }

      const updatedGoal = await storage.updateGoal(params.id, validatedData);
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data or ID", errors: error.errors });
      }
      console.error("Failed to update goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Task endpoints
  app.post("/api/tasks", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const carePlan = await storage.getCarePlan(validatedData.carePlanId);
      if (!carePlan) {
        return res.status(400).json({ message: `Care plan with ID ${validatedData.carePlanId} not found.` });
      }
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Failed to create task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertTaskSchema.partial().parse(req.body);

      const existingTask = await storage.getTask(params.id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (validatedData.carePlanId && validatedData.carePlanId !== existingTask.carePlanId) {
        const carePlan = await storage.getCarePlan(validatedData.carePlanId);
        if (!carePlan) {
          return res.status(400).json({ message: `Care plan with ID ${validatedData.carePlanId} not found.` });
        }
      }

      const updatedTask = await storage.updateTask(params.id, validatedData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data or ID", errors: error.errors });
      }
      console.error("Failed to update task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Appointment endpoints
  app.get("/api/service-users/:id/appointments", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const query = dateQuerySchema.parse(req.query);

      const serviceUser = await storage.getServiceUser(params.id);
      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found." });
      }

      const appointments = await storage.getAppointments(params.id, query.date);
      res.json(appointments);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ID or query parameter", errors: error.errors });
      }
      console.error("Failed to retrieve appointments:", error);
      res.status(500).json({ message: "Failed to retrieve appointments" });
    }
  });

  app.get("/api/appointments/caregiver", ensureAuthenticated, async (req, res) => {
    try {
      const caregiverId = (req.user as any).id;
      const query = dateQuerySchema.parse(req.query);

      const appointments = await storage.getAppointmentsForCaregiver(caregiverId, query.date);
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query parameter", errors: error.errors });
      }
      console.error("Failed to retrieve caregiver appointments:", error);
      res.status(500).json({ message: "Failed to retrieve appointments" });
    }
  });

  app.post("/api/appointments", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
      if (!serviceUser) {
        return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
      }
      if (validatedData.caregiverId) {
        const caregiver = await storage.getUser(validatedData.caregiverId);
        if (!caregiver) {
          return res.status(400).json({ message: `Caregiver with ID ${validatedData.caregiverId} not found.` });
        }
      }
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("Failed to create appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertAppointmentSchema.partial().parse(req.body);

      const existingAppointment = await storage.getAppointment(params.id);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (validatedData.serviceUserId && validatedData.serviceUserId !== existingAppointment.serviceUserId) {
        const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
        if (!serviceUser) {
          return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
        }
      }
      if (validatedData.caregiverId && validatedData.caregiverId !== existingAppointment.caregiverId) {
        const caregiver = await storage.getUser(validatedData.caregiverId);
        if (!caregiver) {
          return res.status(400).json({ message: `Caregiver with ID ${validatedData.caregiverId} not found.` });
        }
      }

      const updatedAppointment = await storage.updateAppointment(params.id, validatedData);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data or ID", errors: error.errors });
      }
      console.error("Failed to update appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Note endpoints
  app.get("/api/service-users/:id/notes", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const serviceUser = await storage.getServiceUser(params.id);
      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found." });
      }
      const notes = await storage.getNotes(params.id);
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user ID", errors: error.errors });
      }
      console.error("Failed to retrieve notes:", error);
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
      const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
      if (!serviceUser) {
        return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
      }

      const note = await storage.createNote(validatedData);
      const author = await storage.getUser(note.createdBy);

      res.status(201).json({
        ...note,
        author: author ? { id: author.id, fullName: author.fullName } : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      console.error("Failed to create note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Risk Assessment endpoints
  app.get("/api/service-users/:id/risk-assessments", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const serviceUser = await storage.getServiceUser(params.id);
      if (!serviceUser) {
        return res.status(404).json({ message: "Service user not found." });
      }
      const riskAssessments = await storage.getRiskAssessments(params.id);
      res.json(riskAssessments);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service user ID", errors: error.errors });
      }
      console.error("Failed to retrieve risk assessments:", error);
      res.status(500).json({ message: "Failed to retrieve risk assessments" });
    }
  });

  app.post("/api/risk-assessments", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
      if (!serviceUser) {
        return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
      }
      const riskAssessment = await storage.createRiskAssessment(validatedData);
      res.status(201).json(riskAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid risk assessment data", errors: error.errors });
      }
      console.error("Failed to create risk assessment:", error);
      res.status(500).json({ message: "Failed to create risk assessment" });
    }
  });

  app.patch("/api/risk-assessments/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertRiskAssessmentSchema.partial().parse(req.body);

      const existingRiskAssessment = await storage.getRiskAssessment(params.id);
      if (!existingRiskAssessment) {
        return res.status(404).json({ message: "Risk assessment not found" });
      }

      if (validatedData.serviceUserId && validatedData.serviceUserId !== existingRiskAssessment.serviceUserId) {
        const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
        if (!serviceUser) {
          return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
        }
      }

      const updatedRiskAssessment = await storage.updateRiskAssessment(params.id, validatedData);
      res.json(updatedRiskAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid risk assessment data or ID", errors: error.errors });
      }
      console.error("Failed to update risk assessment:", error);
      res.status(500).json({ message: "Failed to update risk assessment" });
    }
  });

  // Resource Location endpoints
  app.get("/api/resource-locations", ensureAuthenticated, async (req, res) => {
    try {
      const locations = await storage.getAllResourceLocations();
      res.json(locations);
    } catch (error) {
      console.error("Failed to retrieve resource locations:", error);
      res.status(500).json({ message: "Failed to retrieve resource locations" });
    }
  });

  app.get("/api/resource-locations/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const location = await storage.getResourceLocation(params.id);

      if (!location) {
        return res.status(404).json({ message: "Resource location not found" });
      }

      res.json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource location ID", errors: error.errors });
      }
      console.error("Failed to retrieve resource location:", error);
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
      console.error("Failed to create resource location:", error);
      res.status(500).json({ message: "Failed to create resource location" });
    }
  });

  app.patch("/api/resource-locations/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertResourceLocationSchema.partial().parse(req.body);

      const existingLocation = await storage.getResourceLocation(params.id);
      if (!existingLocation) {
        return res.status(404).json({ message: "Resource location not found" });
      }

      const updatedLocation = await storage.updateResourceLocation(params.id, validatedData);
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource location data or ID", errors: error.errors });
      }
      console.error("Failed to update resource location:", error);
      res.status(500).json({ message: "Failed to update resource location" });
    }
  });

  // Community Resource endpoints
  app.get("/api/community-resources", ensureAuthenticated, async (req, res) => {
    try {
      const query = communityResourceQuerySchema.parse(req.query);
      let resources;

      if (query.q) {
        resources = await storage.searchCommunityResources(query.q);
      } else if (query.category) {
        resources = await storage.getCommunityResourcesByCategory(query.category);
      } else if (query.locationId) {
        resources = await storage.getCommunityResourcesByLocation(query.locationId);
      } else {
        resources = await storage.getAllCommunityResources();
      }

      const resourcesWithLocation = await Promise.all(
        resources.map(async (resource) => {
          let fetchedLocation = null;
          if (resource.locationId) {
            fetchedLocation = await storage.getResourceLocation(resource.locationId);
          }
          return {
            ...resource,
            location: fetchedLocation // Ensure location property is always present
          };
        })
      );

      res.json(resourcesWithLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query parameters", errors: error.errors });
      }
      console.error("Failed to retrieve community resources:", error);
      res.status(500).json({ message: "Failed to retrieve community resources" });
    }
  });

  app.get("/api/community-resources/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const resourceData = await storage.getCommunityResource(params.id);

      if (!resourceData) {
        return res.status(404).json({ message: "Community resource not found" });
      }

      let location = null;
      if (resourceData.locationId) {
        location = await storage.getResourceLocation(resourceData.locationId);
      }

      const responseResource = {
        ...resourceData,
        location: location
      };

      res.json(responseResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid community resource ID", errors: error.errors });
      }
      console.error("Failed to retrieve community resource:", error);
      res.status(500).json({ message: "Failed to retrieve community resource" });
    }
  });

  app.post("/api/community-resources", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCommunityResourceSchema.parse({
        ...req.body,
        lastUpdated: format(new Date(), "yyyy-MM-dd")
      });
      if (validatedData.locationId) {
        const location = await storage.getResourceLocation(validatedData.locationId);
        if (!location) {
          return res.status(400).json({ message: `Resource location with ID ${validatedData.locationId} not found.` });
        }
      }
      const resource = await storage.createCommunityResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid community resource data", errors: error.errors });
      }
      console.error("Failed to create community resource:", error);
      res.status(500).json({ message: "Failed to create community resource" });
    }
  });

  app.patch("/api/community-resources/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertCommunityResourceSchema.partial().parse({
        ...req.body,
        lastUpdated: format(new Date(), "yyyy-MM-dd")
      });

      const existingResource = await storage.getCommunityResource(params.id);
      if (!existingResource) {
        return res.status(404).json({ message: "Community resource not found" });
      }

      if (validatedData.locationId && validatedData.locationId !== existingResource.locationId) {
        const location = await storage.getResourceLocation(validatedData.locationId);
        if (!location) {
          return res.status(400).json({ message: `Resource location with ID ${validatedData.locationId} not found.` });
        }
      }

      const updatedResource = await storage.updateCommunityResource(params.id, validatedData);
      res.json(updatedResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid community resource data or ID", errors: error.errors });
      }
      console.error("Failed to update community resource:", error);
      res.status(500).json({ message: "Failed to update community resource" });
    }
  });

  // Resource Referral endpoints
  app.get("/api/resource-referrals", ensureAuthenticated, async (req, res) => {
    try {
      const serviceUserId = req.query.serviceUserId ? parseInt(req.query.serviceUserId as string) : undefined;
      const resourceId = req.query.resourceId ? parseInt(req.query.resourceId as string) : undefined;

      if (serviceUserId !== undefined && (isNaN(serviceUserId) || serviceUserId <= 0)) {
        return res.status(400).json({ message: "Invalid service user ID in query." });
      }
      if (resourceId !== undefined && (isNaN(resourceId) || resourceId <= 0)) {
        return res.status(400).json({ message: "Invalid resource ID in query." });
      }

      const referrals = await storage.getReferrals(serviceUserId, resourceId);
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
      console.error("Failed to retrieve resource referrals:", error);
      res.status(500).json({ message: "Failed to retrieve resource referrals" });
    }
  });

  app.get("/api/resource-referrals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const referral = await storage.getReferral(params.id);

      if (!referral) {
        return res.status(404).json({ message: "Resource referral not found" });
      }

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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource referral ID", errors: error.errors });
      }
      console.error("Failed to retrieve resource referral:", error);
      res.status(500).json({ message: "Failed to retrieve resource referral" });
    }
  });

  app.post("/api/resource-referrals", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResourceReferralSchema.parse({
        ...req.body,
        referrerId: (req.user as any).id,
        status: 'pending'
      });
      const resource = await storage.getCommunityResource(validatedData.resourceId);
      if (!resource) {
        return res.status(400).json({ message: `Community resource with ID ${validatedData.resourceId} not found.` });
      }
      const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
      if (!serviceUser) {
        return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
      }

      const referral = await storage.createReferral(validatedData);
      res.status(201).json(referral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource referral data", errors: error.errors });
      }
      console.error("Failed to create resource referral:", error);
      res.status(500).json({ message: "Failed to create resource referral" });
    }
  });

  app.patch("/api/resource-referrals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertResourceReferralSchema.partial().parse(req.body);

      const existingReferral = await storage.getReferral(params.id);
      if (!existingReferral) {
        return res.status(404).json({ message: "Resource referral not found" });
      }

      if (validatedData.resourceId && validatedData.resourceId !== existingReferral.resourceId) {
        const resource = await storage.getCommunityResource(validatedData.resourceId);
        if (!resource) {
          return res.status(400).json({ message: `Community resource with ID ${validatedData.resourceId} not found.` });
        }
      }
      if (validatedData.serviceUserId && validatedData.serviceUserId !== existingReferral.serviceUserId) {
        const serviceUser = await storage.getServiceUser(validatedData.serviceUserId);
        if (!serviceUser) {
          return res.status(400).json({ message: `Service user with ID ${validatedData.serviceUserId} not found.` });
        }
      }
      if (validatedData.referrerId && validatedData.referrerId !== existingReferral.referrerId) {
        const referrer = await storage.getUser(validatedData.referrerId);
        if (!referrer) {
          return res.status(400).json({ message: `Referrer with ID ${validatedData.referrerId} not found.` });
        }
      }

      const updatedReferral = await storage.updateReferral(params.id, validatedData);
      res.json(updatedReferral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource referral data or ID", errors: error.errors });
      }
      console.error("Failed to update resource referral:", error);
      res.status(500).json({ message: "Failed to update resource referral" });
    }
  });

  // Resource Review endpoints
  app.get("/api/resource-reviews", ensureAuthenticated, async (req, res) => {
    try {
      const resourceIdString = req.query.resourceId as string;
      if (!resourceIdString) {
        return res.status(400).json({ message: "Resource ID is required" });
      }
      const resourceId = parseInt(resourceIdString);
      if (isNaN(resourceId) || resourceId <= 0) {
        return res.status(400).json({ message: "Invalid Resource ID format" });
      }

      const reviews = await storage.getReviews(resourceId);
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
      console.error("Failed to retrieve resource reviews:", error);
      res.status(500).json({ message: "Failed to retrieve resource reviews" });
    }
  });

  app.post("/api/resource-reviews", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertResourceReviewSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
        helpfulCount: 0
      });
      const resource = await storage.getCommunityResource(validatedData.resourceId);
      if (!resource) {
        return res.status(400).json({ message: `Community resource with ID ${validatedData.resourceId} not found.` });
      }

      const review = await storage.createReview(validatedData);
      const resourceId = review.resourceId;
      const resourceToUpdate = await storage.getCommunityResource(resourceId);
      if (resourceToUpdate) {
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
      console.error("Failed to create resource review:", error);
      res.status(500).json({ message: "Failed to create resource review" });
    }
  });

  app.patch("/api/resource-reviews/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const validatedData = insertResourceReviewSchema.partial().parse(req.body);

      const existingReview = await storage.getReview(params.id);
      if (!existingReview) {
        return res.status(404).json({ message: "Resource review not found" });
      }

      if (existingReview.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Not authorized to update this review" });
      }

      if (validatedData.resourceId && validatedData.resourceId !== existingReview.resourceId) {
        const resource = await storage.getCommunityResource(validatedData.resourceId);
        if (!resource) {
          return res.status(400).json({ message: `Community resource with ID ${validatedData.resourceId} not found.` });
        }
      }
      if (validatedData.userId && validatedData.userId !== existingReview.userId) {
        return res.status(400).json({ message: "Cannot change the author of the review." });
      }

      const updatedReview = await storage.updateReview(params.id, validatedData);
      if (validatedData.rating && validatedData.rating !== existingReview.rating) {
        const resourceId = existingReview.resourceId;
        const resourceToUpdate = await storage.getCommunityResource(resourceId);
        if (resourceToUpdate) {
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
        return res.status(400).json({ message: "Invalid resource review data or ID", errors: error.errors });
      }
      console.error("Failed to update resource review:", error);
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
      console.error("Failed to retrieve resource bookmarks:", error);
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
      const resource = await storage.getCommunityResource(validatedData.resourceId);
      if (!resource) {
        return res.status(400).json({ message: `Community resource with ID ${validatedData.resourceId} not found.` });
      }

      const bookmark = await storage.createBookmark(validatedData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource bookmark data", errors: error.errors });
      }
      console.error("Failed to create resource bookmark:", error);
      res.status(500).json({ message: "Failed to create resource bookmark" });
    }
  });

  app.delete("/api/resource-bookmarks/:id", ensureAuthenticated, async (req, res) => {
    try {
      const params = idParamSchema.parse(req.params);
      const bookmark = await storage.getBookmark(params.id);

      if (!bookmark) {
        return res.status(404).json({ message: "Resource bookmark not found" });
      }

      if (bookmark.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Not authorized to delete this bookmark" });
      }

      const success = await storage.deleteBookmark(params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete bookmark" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource bookmark ID", errors: error.errors });
      }
      console.error("Failed to delete resource bookmark:", error);
      res.status(500).json({ message: "Failed to delete resource bookmark" });
    }
  });

  return httpServer;
}