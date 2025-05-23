import { db } from './index';
import { qualityMetrics } from '@shared/schema';

/**
 * Seed quality metrics data
 */
export async function seedQualityMetrics() {
  try {
    // Check if quality metrics already exist
    const existingMetrics = await db.select().from(qualityMetrics);
    
    if (existingMetrics.length > 0) {
      console.log('Quality metrics already seeded, skipping...');
      return;
    }
    
    console.log('Seeding quality metrics...');
    
    // Care quality metrics
    await db.insert(qualityMetrics).values([
      {
        name: 'Care Plan Compliance',
        value: 92.5,
        target: 100,
        trend: 'up',
        category: 'care',
        description: 'Percentage of care plans that are up to date and fully compliant'
      },
      {
        name: 'Medication Administration Accuracy',
        value: 99.8,
        target: 100,
        trend: 'stable',
        category: 'care',
        description: 'Percentage of medications administered correctly and on time'
      },
      {
        name: 'Care Visit Completion Rate',
        value: 97.2,
        target: 98,
        trend: 'up',
        category: 'care',
        description: 'Percentage of scheduled care visits completed successfully'
      },
      {
        name: 'Care Plan Review Timeliness',
        value: 85.3,
        target: 95,
        trend: 'down',
        category: 'care',
        description: 'Percentage of care plans reviewed within the scheduled timeframe'
      }
    ]);
    
    // Staff performance metrics
    await db.insert(qualityMetrics).values([
      {
        name: 'Staff Attendance',
        value: 94.7,
        target: 98,
        trend: 'stable',
        category: 'staff',
        description: 'Percentage of shifts attended as scheduled'
      },
      {
        name: 'Staff Training Compliance',
        value: 88.5,
        target: 100,
        trend: 'up',
        category: 'staff',
        description: 'Percentage of staff with up-to-date required training'
      },
      {
        name: 'Staff Retention Rate',
        value: 76.2,
        target: 85,
        trend: 'up',
        category: 'staff',
        description: 'Percentage of staff retained over the past 12 months'
      },
      {
        name: 'Staff Satisfaction Score',
        value: 7.8,
        target: 9,
        trend: 'stable',
        category: 'staff',
        description: 'Average staff satisfaction score out of 10'
      }
    ]);
    
    // Compliance metrics
    await db.insert(qualityMetrics).values([
      {
        name: 'CQC Compliance Score',
        value: 92.0,
        target: 100,
        trend: 'up',
        category: 'compliance',
        description: 'Overall compliance score with CQC standards'
      },
      {
        name: 'Incident Reporting Timeliness',
        value: 95.5,
        target: 100,
        trend: 'up',
        category: 'compliance',
        description: 'Percentage of incidents reported within required timeframe'
      },
      {
        name: 'Risk Assessment Completion',
        value: 89.3,
        target: 100,
        trend: 'stable',
        category: 'compliance',
        description: 'Percentage of required risk assessments completed and up to date'
      },
      {
        name: 'Documentation Compliance',
        value: 87.6,
        target: 95,
        trend: 'up',
        category: 'compliance',
        description: 'Percentage of documentation that meets compliance standards'
      }
    ]);
    
    // Satisfaction metrics
    await db.insert(qualityMetrics).values([
      {
        name: 'Service User Satisfaction',
        value: 8.7,
        target: 9.5,
        trend: 'up',
        category: 'satisfaction',
        description: 'Average service user satisfaction score out of 10'
      },
      {
        name: 'Family Satisfaction',
        value: 8.2,
        target: 9,
        trend: 'stable',
        category: 'satisfaction',
        description: 'Average family satisfaction score out of 10'
      },
      {
        name: 'Complaint Resolution Rate',
        value: 94.8,
        target: 100,
        trend: 'up',
        category: 'satisfaction',
        description: 'Percentage of complaints resolved within target timeframe'
      },
      {
        name: 'Net Promoter Score',
        value: 42,
        target: 50,
        trend: 'up',
        category: 'satisfaction',
        description: 'Net Promoter Score measuring likelihood to recommend services'
      }
    ]);
    
    console.log('Quality metrics seeded successfully');
  } catch (error) {
    console.error('Error seeding quality metrics:', error);
    throw error;
  }
}
