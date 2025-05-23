/**
 * Threat Intelligence Service
 * 
 * This service integrates with external threat intelligence feeds to identify
 * potential threats and malicious activities targeting the application.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import securityMonitoringService from './security-monitoring-service';
import { db } from '../db';

// Types
interface ThreatFeed {
  id: string;
  name: string;
  url: string;
  type: 'ip' | 'domain' | 'hash' | 'vulnerability' | 'general';
  format: 'json' | 'csv' | 'txt';
  enabled: boolean;
  lastUpdated: Date | null;
  updateInterval: number; // in minutes
}

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'vulnerability' | 'general';
  value: string;
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  timestamp: Date;
  expiresAt: Date | null;
  tags: string[];
  metadata: Record<string, any>;
}

interface ThreatIntelligenceConfig {
  enabled: boolean;
  apiKeys: Record<string, string>;
  feeds: ThreatFeed[];
  updateInterval: number; // in minutes
  dataRetentionDays: number;
}

// Default configuration
const DEFAULT_CONFIG: ThreatIntelligenceConfig = {
  enabled: true,
  apiKeys: {
    abuseIPDB: process.env.ABUSEIPDB_API_KEY || '',
    virustotal: process.env.VIRUSTOTAL_API_KEY || '',
    otx: process.env.OTX_API_KEY || ''
  },
  feeds: [
    {
      id: 'abuseipdb',
      name: 'AbuseIPDB Blacklist',
      url: 'https://api.abuseipdb.com/api/v2/blacklist',
      type: 'ip',
      format: 'json',
      enabled: true,
      lastUpdated: null,
      updateInterval: 1440 // 24 hours
    },
    {
      id: 'otx-ip',
      name: 'AlienVault OTX IP Reputation',
      url: 'https://otx.alienvault.com/api/v1/indicators/export',
      type: 'ip',
      format: 'json',
      enabled: true,
      lastUpdated: null,
      updateInterval: 720 // 12 hours
    },
    {
      id: 'emerging-threats',
      name: 'Emerging Threats IP Blocklist',
      url: 'https://rules.emergingthreats.net/blockrules/compromised-ips.txt',
      type: 'ip',
      format: 'txt',
      enabled: true,
      lastUpdated: null,
      updateInterval: 360 // 6 hours
    },
    {
      id: 'cve-feed',
      name: 'NVD CVE Feed',
      url: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
      type: 'vulnerability',
      format: 'json',
      enabled: true,
      lastUpdated: null,
      updateInterval: 1440 // 24 hours
    }
  ],
  updateInterval: 360, // 6 hours
  dataRetentionDays: 90
};

// In-memory storage
let config: ThreatIntelligenceConfig = { ...DEFAULT_CONFIG };
let threatIndicators: ThreatIndicator[] = [];
let updateInterval: NodeJS.Timeout | null = null;

// Data file paths
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'threat-intel');
const INDICATORS_FILE = path.join(DATA_DIR, 'indicators.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

/**
 * Initialize the threat intelligence service
 * @param customConfig Custom configuration
 */
export function initThreatIntelligence(customConfig?: Partial<ThreatIntelligenceConfig>): void {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Load configuration from file if it exists
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      config = { ...DEFAULT_CONFIG, ...fileConfig, ...customConfig };
    } catch (error) {
      logger.error('Error loading threat intelligence configuration:', error);
      config = { ...DEFAULT_CONFIG, ...customConfig };
    }
  } else {
    config = { ...DEFAULT_CONFIG, ...customConfig };
    // Save default configuration
    saveConfig();
  }
  
  // Load indicators from file if it exists
  if (fs.existsSync(INDICATORS_FILE)) {
    try {
      const fileIndicators = JSON.parse(fs.readFileSync(INDICATORS_FILE, 'utf8'));
      threatIndicators = fileIndicators.map((indicator: any) => ({
        ...indicator,
        timestamp: new Date(indicator.timestamp),
        expiresAt: indicator.expiresAt ? new Date(indicator.expiresAt) : null
      }));
    } catch (error) {
      logger.error('Error loading threat indicators:', error);
      threatIndicators = [];
    }
  }
  
  // Start update interval if enabled
  if (config.enabled) {
    startUpdateInterval();
  }
  
  logger.info('Threat intelligence service initialized');
}

/**
 * Save configuration to file
 */
function saveConfig(): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    logger.error('Error saving threat intelligence configuration:', error);
  }
}

/**
 * Save indicators to file
 */
function saveIndicators(): void {
  try {
    fs.writeFileSync(INDICATORS_FILE, JSON.stringify(threatIndicators, null, 2));
  } catch (error) {
    logger.error('Error saving threat indicators:', error);
  }
}

/**
 * Start the update interval
 */
function startUpdateInterval(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Update feeds immediately
  updateFeeds();
  
  // Set up interval for future updates
  updateInterval = setInterval(() => {
    updateFeeds();
  }, config.updateInterval * 60 * 1000);
}

/**
 * Stop the update interval
 */
function stopUpdateInterval(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Update all enabled feeds
 */
async function updateFeeds(): Promise<void> {
  if (!config.enabled) {
    return;
  }
  
  logger.info('Updating threat intelligence feeds');
  
  // Clean up expired indicators
  cleanupExpiredIndicators();
  
  // Update each enabled feed
  for (const feed of config.feeds) {
    if (feed.enabled) {
      try {
        // Check if feed needs to be updated
        const now = new Date();
        if (feed.lastUpdated && 
            (now.getTime() - feed.lastUpdated.getTime()) < (feed.updateInterval * 60 * 1000)) {
          logger.debug(`Skipping feed ${feed.name} - not due for update yet`);
          continue;
        }
        
        logger.info(`Updating feed: ${feed.name}`);
        
        // Update feed based on type
        switch (feed.id) {
          case 'abuseipdb':
            await updateAbuseIPDBFeed(feed);
            break;
          case 'otx-ip':
            await updateOTXFeed(feed);
            break;
          case 'emerging-threats':
            await updateEmergingThreatsFeed(feed);
            break;
          case 'cve-feed':
            await updateCVEFeed(feed);
            break;
          default:
            logger.warn(`Unknown feed type: ${feed.id}`);
        }
        
        // Update last updated timestamp
        feed.lastUpdated = new Date();
      } catch (error) {
        logger.error(`Error updating feed ${feed.name}:`, error);
      }
    }
  }
  
  // Save updated configuration and indicators
  saveConfig();
  saveIndicators();
  
  logger.info('Threat intelligence feeds updated');
}

/**
 * Update AbuseIPDB feed
 * @param feed Feed configuration
 */
async function updateAbuseIPDBFeed(feed: ThreatFeed): Promise<void> {
  try {
    const apiKey = config.apiKeys.abuseIPDB;
    
    if (!apiKey) {
      logger.warn('AbuseIPDB API key not configured');
      return;
    }
    
    const response = await axios.get(feed.url, {
      params: {
        confidenceMinimum: 90,
        limit: 1000
      },
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.data) {
      const newIndicators: ThreatIndicator[] = response.data.data.map((item: any) => ({
        id: `abuseipdb-${item.ipAddress}`,
        type: 'ip',
        value: item.ipAddress,
        confidence: item.abuseConfidenceScore,
        severity: item.abuseConfidenceScore > 90 ? 'high' : 
                 item.abuseConfidenceScore > 80 ? 'medium' : 'low',
        description: `Malicious IP address with abuse confidence score of ${item.abuseConfidenceScore}`,
        source: 'AbuseIPDB',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        tags: ['malicious', 'abuse'],
        metadata: {
          countryCode: item.countryCode,
          totalReports: item.totalReports,
          lastReportedAt: item.lastReportedAt
        }
      }));
      
      // Add new indicators
      addIndicators(newIndicators);
      
      logger.info(`Added ${newIndicators.length} indicators from AbuseIPDB`);
    }
  } catch (error) {
    logger.error('Error updating AbuseIPDB feed:', error);
    throw error;
  }
}

/**
 * Update OTX feed
 * @param feed Feed configuration
 */
async function updateOTXFeed(feed: ThreatFeed): Promise<void> {
  try {
    const apiKey = config.apiKeys.otx;
    
    if (!apiKey) {
      logger.warn('OTX API key not configured');
      return;
    }
    
    // This is a simplified example - the actual OTX API is more complex
    const response = await axios.get(feed.url, {
      params: {
        types: 'IPv4',
        limit: 1000
      },
      headers: {
        'X-OTX-API-KEY': apiKey
      }
    });
    
    if (response.data && response.data.results) {
      const newIndicators: ThreatIndicator[] = response.data.results.map((item: any) => ({
        id: `otx-${item.indicator}`,
        type: 'ip',
        value: item.indicator,
        confidence: 85,
        severity: item.pulse_info.count > 10 ? 'high' : 
                 item.pulse_info.count > 5 ? 'medium' : 'low',
        description: `Malicious IP address found in ${item.pulse_info.count} pulses`,
        source: 'AlienVault OTX',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        tags: ['malicious', 'otx'],
        metadata: {
          pulseCount: item.pulse_info.count,
          tags: item.pulse_info.tags
        }
      }));
      
      // Add new indicators
      addIndicators(newIndicators);
      
      logger.info(`Added ${newIndicators.length} indicators from OTX`);
    }
  } catch (error) {
    logger.error('Error updating OTX feed:', error);
    throw error;
  }
}

/**
 * Update Emerging Threats feed
 * @param feed Feed configuration
 */
async function updateEmergingThreatsFeed(feed: ThreatFeed): Promise<void> {
  try {
    const response = await axios.get(feed.url);
    
    if (response.data) {
      const ips = response.data
        .split('\n')
        .filter((line: string) => line.trim() && !line.startsWith('#'));
      
      const newIndicators: ThreatIndicator[] = ips.map((ip: string) => ({
        id: `et-${ip.trim()}`,
        type: 'ip',
        value: ip.trim(),
        confidence: 80,
        severity: 'medium',
        description: 'Compromised IP address from Emerging Threats',
        source: 'Emerging Threats',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        tags: ['compromised', 'emerging-threats'],
        metadata: {}
      }));
      
      // Add new indicators
      addIndicators(newIndicators);
      
      logger.info(`Added ${newIndicators.length} indicators from Emerging Threats`);
    }
  } catch (error) {
    logger.error('Error updating Emerging Threats feed:', error);
    throw error;
  }
}

/**
 * Update CVE feed
 * @param feed Feed configuration
 */
async function updateCVEFeed(feed: ThreatFeed): Promise<void> {
  try {
    // Get recent CVEs with high severity
    const response = await axios.get(feed.url, {
      params: {
        resultsPerPage: 100,
        cvssV3Severity: 'HIGH',
        pubStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    if (response.data && response.data.vulnerabilities) {
      const newIndicators: ThreatIndicator[] = response.data.vulnerabilities.map((item: any) => {
        const cve = item.cve;
        return {
          id: cve.id,
          type: 'vulnerability',
          value: cve.id,
          confidence: 90,
          severity: 'high',
          description: cve.descriptions.find((d: any) => d.lang === 'en')?.value || 'No description available',
          source: 'NVD',
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
          tags: ['cve', 'vulnerability'],
          metadata: {
            cvssScore: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
            cvssVector: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.vectorString || '',
            publishedDate: cve.published,
            lastModifiedDate: cve.lastModified,
            references: cve.references?.map((ref: any) => ref.url) || []
          }
        };
      });
      
      // Add new indicators
      addIndicators(newIndicators);
      
      logger.info(`Added ${newIndicators.length} indicators from NVD CVE feed`);
    }
  } catch (error) {
    logger.error('Error updating CVE feed:', error);
    throw error;
  }
}

/**
 * Add new indicators to the database
 * @param newIndicators New threat indicators
 */
function addIndicators(newIndicators: ThreatIndicator[]): void {
  // Filter out duplicates
  const existingIds = new Set(threatIndicators.map(i => i.id));
  const uniqueIndicators = newIndicators.filter(i => !existingIds.has(i.id));
  
  // Add new indicators
  threatIndicators = [...threatIndicators, ...uniqueIndicators];
  
  // Save indicators
  saveIndicators();
}

/**
 * Clean up expired indicators
 */
function cleanupExpiredIndicators(): void {
  const now = new Date();
  const retentionDate = new Date(now.getTime() - config.dataRetentionDays * 24 * 60 * 60 * 1000);
  
  // Remove expired indicators
  threatIndicators = threatIndicators.filter(indicator => {
    if (indicator.expiresAt && indicator.expiresAt < now) {
      return false;
    }
    
    if (indicator.timestamp < retentionDate) {
      return false;
    }
    
    return true;
  });
  
  // Save indicators
  saveIndicators();
}

/**
 * Check if an IP address is in the threat database
 * @param ip IP address to check
 * @returns Threat indicator if found, null otherwise
 */
export function checkIP(ip: string): ThreatIndicator | null {
  return threatIndicators.find(indicator => 
    indicator.type === 'ip' && indicator.value === ip
  ) || null;
}

/**
 * Check if a domain is in the threat database
 * @param domain Domain to check
 * @returns Threat indicator if found, null otherwise
 */
export function checkDomain(domain: string): ThreatIndicator | null {
  return threatIndicators.find(indicator => 
    indicator.type === 'domain' && indicator.value === domain
  ) || null;
}

/**
 * Check if a file hash is in the threat database
 * @param hash File hash to check
 * @returns Threat indicator if found, null otherwise
 */
export function checkHash(hash: string): ThreatIndicator | null {
  return threatIndicators.find(indicator => 
    indicator.type === 'hash' && indicator.value === hash
  ) || null;
}

/**
 * Check if a vulnerability affects the application
 * @param cveId CVE ID to check
 * @returns Threat indicator if found, null otherwise
 */
export function checkVulnerability(cveId: string): ThreatIndicator | null {
  return threatIndicators.find(indicator => 
    indicator.type === 'vulnerability' && indicator.value === cveId
  ) || null;
}

/**
 * Search for indicators
 * @param query Search query
 * @param type Indicator type
 * @param limit Maximum number of results
 * @returns Matching threat indicators
 */
export function searchIndicators(query: string, type?: string, limit: number = 100): ThreatIndicator[] {
  let results = threatIndicators;
  
  if (type) {
    results = results.filter(indicator => indicator.type === type);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(indicator => 
      indicator.value.toLowerCase().includes(lowerQuery) ||
      indicator.description.toLowerCase().includes(lowerQuery) ||
      indicator.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  return results.slice(0, limit);
}

/**
 * Get all indicators
 * @param limit Maximum number of results
 * @param offset Offset for pagination
 * @returns Threat indicators
 */
export function getIndicators(limit: number = 100, offset: number = 0): ThreatIndicator[] {
  return threatIndicators
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(offset, offset + limit);
}

/**
 * Get indicator by ID
 * @param id Indicator ID
 * @returns Threat indicator if found, null otherwise
 */
export function getIndicatorById(id: string): ThreatIndicator | null {
  return threatIndicators.find(indicator => indicator.id === id) || null;
}

/**
 * Get indicators by type
 * @param type Indicator type
 * @param limit Maximum number of results
 * @param offset Offset for pagination
 * @returns Threat indicators
 */
export function getIndicatorsByType(type: string, limit: number = 100, offset: number = 0): ThreatIndicator[] {
  return threatIndicators
    .filter(indicator => indicator.type === type)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(offset, offset + limit);
}

/**
 * Get indicators by severity
 * @param severity Indicator severity
 * @param limit Maximum number of results
 * @param offset Offset for pagination
 * @returns Threat indicators
 */
export function getIndicatorsBySeverity(severity: string, limit: number = 100, offset: number = 0): ThreatIndicator[] {
  return threatIndicators
    .filter(indicator => indicator.severity === severity)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(offset, offset + limit);
}

export default {
  initThreatIntelligence,
  checkIP,
  checkDomain,
  checkHash,
  checkVulnerability,
  searchIndicators,
  getIndicators,
  getIndicatorById,
  getIndicatorsByType,
  getIndicatorsBySeverity
};
