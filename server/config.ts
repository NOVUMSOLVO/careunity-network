/**
 * Application Configuration
 */

export const config = {
  // JWT configuration
  jwtSecret: process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret',
  jwtExpiresIn: '7d',

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'sqlite:./dev.db',
    pool: {
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
      statementTimeoutMillis: parseInt(process.env.DB_STATEMENT_TIMEOUT || '10000', 10),
      maxUses: parseInt(process.env.DB_MAX_USES || '7500', 10)
    }
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_ENABLED === 'true',
    defaultTtl: parseInt(process.env.REDIS_DEFAULT_TTL || '300', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'careunity:',
    enableCompression: process.env.REDIS_ENABLE_COMPRESSION !== 'false',
    compressionThreshold: parseInt(process.env.REDIS_COMPRESSION_THRESHOLD || '1024', 10)
  },

  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    store: {
      type: process.env.SESSION_STORE_TYPE || 'memory', // 'memory', 'redis'
      options: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        ttl: parseInt(process.env.SESSION_TTL || '86400', 10), // 24 hours
        prefix: process.env.SESSION_PREFIX || 'careunity:session:'
      }
    }
  },

  // ML model configuration
  ml: {
    modelStoragePath: process.env.MODEL_STORAGE_PATH || './ml-models',
    useRealImplementation: process.env.USE_REAL_IMPLEMENTATION === 'true',
  },

  // Cache configuration
  cache: {
    type: process.env.CACHE_TYPE || 'memory', // 'memory', 'redis'
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5 minutes
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10), // 10 minutes
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000', 10)
  },

  // CDN configuration
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true',
    url: process.env.CDN_URL || '',
    bucket: process.env.CDN_BUCKET || '',
    region: process.env.CDN_REGION || 'us-east-1',
    accessKey: process.env.CDN_ACCESS_KEY || '',
    secretKey: process.env.CDN_SECRET_KEY || ''
  }
};
