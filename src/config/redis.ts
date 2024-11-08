import Redis from 'ioredis';

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

export class RedisService {
    constructor(private readonly redisClient = redis) { }

    public async clearEvaluationListings() {
        try {
            const keys = await this.redisClient.keys('evaluations:*');
            if (keys.length > 0) {
                await this.redisClient.del(...keys);
                console.log(`Deleted ${keys.length} evaluation listings from cache.`);
            } else {
                console.log('No evaluation listings found to delete.');
            }
        } catch (error) {
            console.log('Error deleting evaluation listings from cache:', error);
        }
    }
}

export const service = new RedisService();
export default redis;
