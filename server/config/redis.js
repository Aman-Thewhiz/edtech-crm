import Redis from 'ioredis';
import { env } from './env.js';

const memoryStore = new Map();
let useMemoryRedis = false;

const redisClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redisClient.on('error', (error) => {
  console.error('Redis error:', error.message);
});

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt && entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

function memorySet(key, value, mode, ttlSeconds) {
  const expiresAt = mode === 'EX' && ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryStore.set(key, { value: String(value), expiresAt });
  cleanupMemoryStore();
  return 'OK';
}

function memoryGet(key) {
  cleanupMemoryStore();
  return memoryStore.get(key)?.value ?? null;
}

function memoryDel(key) {
  return memoryStore.delete(key) ? 1 : 0;
}

export const redis = {
  get status() {
    return useMemoryRedis ? 'ready' : redisClient.status;
  },
  async connect() {
    if (useMemoryRedis) {
      return this;
    }
    await redisClient.connect();
    return this;
  },
  async ping() {
    if (useMemoryRedis) {
      return 'PONG';
    }
    return redisClient.ping();
  },
  async get(key) {
    if (useMemoryRedis) {
      return memoryGet(key);
    }
    return redisClient.get(key);
  },
  async set(key, value, mode, ttlSeconds) {
    if (useMemoryRedis) {
      return memorySet(key, value, mode, ttlSeconds);
    }
    return redisClient.set(key, value, mode, ttlSeconds);
  },
  async del(key) {
    if (useMemoryRedis) {
      return memoryDel(key);
    }
    return redisClient.del(key);
  },
  async incr(key) {
    if (useMemoryRedis) {
      const current = Number(memoryGet(key) || 0) + 1;
      memorySet(key, String(current));
      return current;
    }
    return redisClient.incr(key);
  },
};

export async function connectRedis() {
  try {
    if (redis.status === 'wait') {
      await redis.connect();
    }
    await redis.ping();
    return redis;
  } catch (error) {
    useMemoryRedis = true;
    redisClient.disconnect();
    redisClient.removeAllListeners('error');
    console.warn('Redis unavailable, using in-memory fallback');
    return redis;
  }
}