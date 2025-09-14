const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes default TTL
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false
    });
  }

  // Get value from cache
  get(key) {
    return this.cache.get(key);
  }

  // Set value in cache
  set(key, value, ttl = null) {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  // Delete value from cache
  del(key) {
    return this.cache.del(key);
  }

  // Clear all cache
  flush() {
    return this.cache.flushAll();
  }

  // Get cache statistics
  getStats() {
    return this.cache.getStats();
  }

  // Cache keys for different entities
  getRFPKey(id) {
    return `rfp:${id}`;
  }

  getRFPsKey(filters = {}) {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `rfps:${filterString}`;
  }

  getResponseKey(id) {
    return `response:${id}`;
  }

  getResponsesKey(filters = {}) {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `responses:${filterString}`;
  }

  getUserKey(id) {
    return `user:${id}`;
  }

  getSearchKey(query, type) {
    return `search:${type}:${query}`;
  }

  // Cache invalidation patterns
  invalidateRFP(id) {
    // Delete RFP cache
    this.del(this.getRFPKey(id));
    
    // Delete all RFP lists (they might contain this RFP)
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.startsWith('rfps:')) {
        this.del(key);
      }
    });
  }

  invalidateResponse(id) {
    // Delete response cache
    this.del(this.getResponseKey(id));
    
    // Delete all response lists
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.startsWith('responses:')) {
        this.del(key);
      }
    });
  }

  invalidateUser(id) {
    // Delete user cache
    this.del(this.getUserKey(id));
  }

  invalidateSearch() {
    // Delete all search results
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.startsWith('search:')) {
        this.del(key);
      }
    });
  }

  // Cache middleware for Express routes
  cacheMiddleware(ttl = 600) {
    return (req, res, next) => {
      const key = this.generateCacheKey(req);
      
      // Try to get from cache
      const cached = this.get(key);
      if (cached) {
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        cacheService.set(key, data, ttl);
        
        // Call original res.json
        originalJson.call(this, data);
      };

      next();
    };
  }

  generateCacheKey(req) {
    const { method, originalUrl, query } = req;
    const queryString = Object.keys(query)
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');
    
    return `${method}:${originalUrl}:${queryString}`;
  }

  // Preload frequently accessed data
  async preloadData() {
    try {
      // This could be called on startup to preload common data
      console.log('Cache preload completed');
    } catch (error) {
      console.error('Cache preload error:', error);
    }
  }

  // Health check
  isHealthy() {
    try {
      const stats = this.getStats();
      return {
        healthy: true,
        stats: {
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0
        }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = new CacheService();

