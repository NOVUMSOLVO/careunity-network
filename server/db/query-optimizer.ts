/**
 * Query Optimizer Service
 * 
 * This service provides utilities for optimizing database queries in the CareUnity application.
 * It includes functions for query analysis, index recommendations, and query transformation.
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

// Types
interface QueryMetrics {
  queryId: string;
  sql: string;
  executionTime: number;
  rowsReturned: number;
  timestamp: Date;
  indexes: string[];
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

interface QueryPlan {
  plan: any;
  estimatedCost: number;
  estimatedRows: number;
}

// In-memory storage for query metrics
const queryMetricsStore: QueryMetrics[] = [];

/**
 * Record query metrics for analysis
 */
export const recordQueryMetrics = (
  queryId: string,
  sqlQuery: string,
  executionTime: number,
  rowsReturned: number,
  indexes: string[] = []
): void => {
  queryMetricsStore.push({
    queryId,
    sql: sqlQuery,
    executionTime,
    rowsReturned,
    timestamp: new Date(),
    indexes
  });

  // Keep only the last 1000 queries
  if (queryMetricsStore.length > 1000) {
    queryMetricsStore.shift();
  }

  // Log slow queries
  if (executionTime > 500) {
    logger.warn(`Slow query detected (${executionTime}ms): ${sqlQuery.substring(0, 100)}...`);
  }
};

/**
 * Get query metrics for analysis
 */
export const getQueryMetrics = (limit: number = 100): QueryMetrics[] => {
  return queryMetricsStore
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

/**
 * Get slow queries for analysis
 */
export const getSlowQueries = (threshold: number = 500, limit: number = 20): QueryMetrics[] => {
  return queryMetricsStore
    .filter(q => q.executionTime > threshold)
    .sort((a, b) => b.executionTime - a.executionTime)
    .slice(0, limit);
};

/**
 * Analyze query patterns and recommend indexes
 */
export const analyzeAndRecommendIndexes = async (): Promise<IndexRecommendation[]> => {
  const recommendations: IndexRecommendation[] = [];
  
  // Group queries by table
  const tableQueries: Record<string, QueryMetrics[]> = {};
  
  for (const metric of queryMetricsStore) {
    // Simple table extraction - in a real implementation, use a proper SQL parser
    const tableMatch = metric.sql.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
    if (tableMatch && tableMatch[1]) {
      const table = tableMatch[1];
      if (!tableQueries[table]) {
        tableQueries[table] = [];
      }
      tableQueries[table].push(metric);
    }
  }
  
  // Analyze each table's queries
  for (const [table, queries] of Object.entries(tableQueries)) {
    // Find slow queries
    const slowQueries = queries.filter(q => q.executionTime > 300);
    
    if (slowQueries.length > 0) {
      // Extract potential columns for indexing
      // This is a simplified approach - in a real implementation, use a proper SQL parser
      const whereColumns = new Set<string>();
      const joinColumns = new Set<string>();
      
      for (const query of slowQueries) {
        // Extract WHERE conditions
        const whereMatches = query.sql.matchAll(/WHERE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gi);
        for (const match of whereMatches) {
          if (match[1]) whereColumns.add(match[1]);
        }
        
        // Extract JOIN conditions
        const joinMatches = query.sql.matchAll(/JOIN\s+[a-zA-Z_][a-zA-Z0-9_]*\s+ON\s+[a-zA-Z_][a-zA-Z0-9_]*\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gi);
        for (const match of joinMatches) {
          if (match[1]) joinColumns.add(match[1]);
        }
      }
      
      // Recommend indexes for WHERE conditions
      if (whereColumns.size > 0) {
        recommendations.push({
          table,
          columns: Array.from(whereColumns),
          impact: 'high',
          reason: `Frequently used in WHERE clauses across ${slowQueries.length} slow queries`
        });
      }
      
      // Recommend indexes for JOIN conditions
      if (joinColumns.size > 0) {
        recommendations.push({
          table,
          columns: Array.from(joinColumns),
          impact: 'medium',
          reason: `Used in JOIN conditions which may benefit from indexing`
        });
      }
    }
  }
  
  return recommendations;
};

/**
 * Optimize a query by adding hints or transforming it
 */
export const optimizeQuery = (sqlQuery: string): string => {
  // This is a placeholder for query transformation logic
  // In a real implementation, this would analyze the query and apply optimizations
  
  // Example: Add index hints for specific patterns
  if (sqlQuery.includes('ORDER BY') && !sqlQuery.includes('LIMIT')) {
    return sqlQuery + ' LIMIT 1000';
  }
  
  return sqlQuery;
};

/**
 * Middleware to wrap database queries with timing and metrics
 */
export const withQueryMetrics = async <T>(
  queryId: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await queryFn();
    const executionTime = performance.now() - start;
    
    // Extract row count (this is a simplified approach)
    const rowsReturned = Array.isArray(result) ? result.length : 1;
    
    // Record metrics
    recordQueryMetrics(
      queryId,
      'Query details not available in this middleware',
      executionTime,
      rowsReturned
    );
    
    return result;
  } catch (error) {
    const executionTime = performance.now() - start;
    logger.error(`Query error (${executionTime}ms): ${error}`);
    throw error;
  }
};

export default {
  recordQueryMetrics,
  getQueryMetrics,
  getSlowQueries,
  analyzeAndRecommendIndexes,
  optimizeQuery,
  withQueryMetrics
};
