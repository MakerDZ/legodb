import { RateLimitError } from './errors';
import { getIp } from '@/lib/get-ip';

const PRUNE_INTERVAL = 60 * 1000; // 1 minute

const trackers: Record<
    string,
    {
        count: number;
        expiresAt: number;
    }
> = {};

function pruneTrackers() {
    const now = Date.now();

    for (const key in trackers) {
        if (trackers[key].expiresAt < now) {
            delete trackers[key];
        }
    }
}

setInterval(pruneTrackers, PRUNE_INTERVAL);

// Updated rateLimitByIp to allow for a higher limit and longer window for post editing or creation
export async function rateLimitByIp({
    key = 'global',
    limit = 10, // Increased limit to 10
    window = 60000, // Increased window to 1 minute (60,000 ms)
}: {
    key?: string;
    limit?: number;
    window?: number;
}) {
    const ip = getIp();

    if (!ip) {
        throw new RateLimitError();
    }

    await rateLimitByKey({
        key: `${ip}-${key}`,
        limit,
        window,
    });
}

// Updated rateLimitByKey to allow higher limits
export async function rateLimitByKey({
    key = 'global',
    limit = 10, // Increased limit to 10
    window = 60000, // Increased window to 1 minute (60,000 ms)
}: {
    key?: string;
    limit?: number;
    window?: number;
}) {
    const tracker = trackers[key] || { count: 0, expiresAt: 0 };

    if (!trackers[key]) {
        trackers[key] = tracker;
    }

    if (tracker.expiresAt < Date.now()) {
        tracker.count = 0;
        tracker.expiresAt = Date.now() + window;
    }

    tracker.count++;

    if (tracker.count > limit) {
        throw new RateLimitError();
    }
}
