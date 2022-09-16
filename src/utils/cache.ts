import NodeCache from 'node-cache';
import { CacheType } from '../types/Cache';

class MyCache extends NodeCache {
	public constructor(options = {}) {
		super(options);
	}
	public myGet<Key extends keyof CacheType>(key: Key): CacheType[Key] | undefined {
		return super.get(key);
	}

	public mySet<Key extends keyof CacheType>(key: Key, value: CacheType[Key], ttl?: number): boolean {
        if (typeof ttl === 'undefined') {
            return super.set(key, value);
        }
		return super.set(key, value, ttl);
	}
}

export const myCache = new MyCache({ stdTTL: 5, checkperiod: 10, deleteOnExpire: false });
