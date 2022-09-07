import NodeCache from 'node-cache';

// to-do extend NodeCache to limit 'key' value
export const myCache = new NodeCache({ stdTTL: 5, checkperiod: 10, deleteOnExpire: false });
