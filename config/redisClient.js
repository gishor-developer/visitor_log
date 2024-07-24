const redis = require('redis');

const REDIS_URI = process.env.REDIS_URI;

const connectRedis = async () => {
    const redisClient = redis.createClient({
        url: REDIS_URI
    });

    // Connect to Redis
    redisClient.connect().catch(console.error);

    redisClient.on('connect', () => {
        console.log('Client connected to redis...');
    });

    redisClient.on('error', (err) => {
        console.log('Redis connection error:', err);
    });

    return redisClient;
};

module.exports = connectRedis;