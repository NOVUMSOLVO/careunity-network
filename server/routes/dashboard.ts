import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/auth';
import { db } from '../db';
import { serviceUsers, visits, tasks, staff, incidents, qualityMetrics } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/v2/dashboard
 *
 * Returns dashboard data based on user role
 */
router.get('/api/v2/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get service user count
    const serviceUserCount = await db.select({ count: { value: serviceUsers.id, fn: 'count' } })
      .from(serviceUsers)
      .where(eq(serviceUsers.isActive, true));

    // Get today's visits
    const todayVisitsCount = await db.select({ count: { value: visits.id, fn: 'count' } })
      .from(visits)
      .where(
        and(
          gte(visits.startTime, today.toISOString()),
          lte(visits.startTime, tomorrow.toISOString())
        )
      );

    // Get today's schedule for the user if they're a caregiver
    let todaySchedule = [];
    if (user.role === 'caregiver') {
      todaySchedule = await db.select()
        .from(visits)
        .where(
          and(
            eq(visits.caregiverId, user.id),
            gte(visits.startTime, today.toISOString()),
            lte(visits.startTime, tomorrow.toISOString())
          )
        )
        .orderBy(visits.startTime);
    } else {
      // For other roles, get a sample of today's visits
      todaySchedule = await db.select()
        .from(visits)
        .where(
          and(
            gte(visits.startTime, today.toISOString()),
            lte(visits.startTime, tomorrow.toISOString())
          )
        )
        .orderBy(visits.startTime)
        .limit(5);
    }

    // Get task counts
    const completedTasksCount = await db.select({ count: { value: tasks.id, fn: 'count' } })
      .from(tasks)
      .where(eq(tasks.status, 'completed'));

    const pendingTasksCount = await db.select({ count: { value: tasks.id, fn: 'count' } })
      .from(tasks)
      .where(eq(tasks.status, 'pending'));

    // Get staff availability
    const staffCount = await db.select({ count: { value: staff.id, fn: 'count' } })
      .from(staff)
      .where(eq(staff.isActive, true));

    const availableStaffCount = await db.select({ count: { value: staff.id, fn: 'count' } })
      .from(staff)
      .where(
        and(
          eq(staff.isActive, true),
          eq(staff.isAvailable, true)
        )
      );

    const staffAvailability = staffCount[0].count.value > 0
      ? Math.round((availableStaffCount[0].count.value / staffCount[0].count.value) * 100)
      : 0;

    // Get incident count
    const incidentCount = await db.select({ count: { value: incidents.id, fn: 'count' } })
      .from(incidents)
      .where(
        and(
          gte(incidents.createdAt, new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Last 30 days
          eq(incidents.status, 'open')
        )
      );

    // Get quality metrics
    const metrics = await db.select()
      .from(qualityMetrics)
      .orderBy(qualityMetrics.category, qualityMetrics.name);

    // Mock recent activity data
    const recentActivity = [
      {
        id: '1',
        type: 'visit',
        title: 'Visit completed',
        description: 'Morning medication visit completed for John Smith',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        user: {
          id: '101',
          name: 'Sarah Johnson',
          avatar: '/avatars/sarah.jpg'
        },
        relatedTo: {
          id: '201',
          name: 'John Smith',
          type: 'service-user'
        },
        status: 'completed'
      },
      {
        id: '2',
        type: 'task',
        title: 'Task assigned',
        description: 'Weekly care plan review assigned to you',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        user: {
          id: '102',
          name: 'Michael Chen',
          avatar: '/avatars/michael.jpg'
        },
        relatedTo: {
          id: '202',
          name: 'Care Plan Review',
          type: 'task'
        },
        status: 'pending'
      },
      {
        id: '3',
        type: 'note',
        title: 'Note added',
        description: 'New care note added for Elizabeth Taylor',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        user: {
          id: '103',
          name: 'David Wilson',
          avatar: '/avatars/david.jpg'
        },
        relatedTo: {
          id: '203',
          name: 'Elizabeth Taylor',
          type: 'service-user'
        }
      },
      {
        id: '4',
        type: 'incident',
        title: 'Incident reported',
        description: 'Minor fall incident reported for Robert Johnson',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        user: {
          id: '104',
          name: 'Emma Davis',
          avatar: '/avatars/emma.jpg'
        },
        relatedTo: {
          id: '204',
          name: 'Robert Johnson',
          type: 'service-user'
        },
        status: 'in-progress'
      }
    ];

    // Prepare response based on user role
    const dashboardData = {
      metrics: {
        serviceUsers: serviceUserCount[0].count.value,
        todayVisits: todayVisitsCount[0].count.value,
        completedTasks: completedTasksCount[0].count.value,
        pendingTasks: pendingTasksCount[0].count.value,
        staffAvailability,
        incidents: incidentCount[0].count.value,
        careQualityScore: 8.5 // Mock value
      },
      todaySchedule,
      recentActivity,
      qualityMetrics: metrics
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
