type MemoryTurn = {
  role: "user" | "assistant";
  content: string;
  at: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __fintelInMemoryStore: Map<string, MemoryTurn[]> | undefined;
  // eslint-disable-next-line no-var
  var __fintelRedisClient: any;
  // eslint-disable-next-line no-var
  var __fintelRedisConnectPromise: Promise<any> | undefined;
}

function getInMemoryStore() {
  if (!globalThis.__fintelInMemoryStore) {
    globalThis.__fintelInMemoryStore = new Map<string, MemoryTurn[]>();
  }
  return globalThis.__fintelInMemoryStore;
}

function getRedisUrl() {
  return (process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL ?? "").trim();
}

async function getRedisClient() {
  if (globalThis.__fintelRedisClient) {
    return globalThis.__fintelRedisClient;
  }

  if (globalThis.__fintelRedisConnectPromise) {
    return globalThis.__fintelRedisConnectPromise;
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    return null;
  }

  globalThis.__fintelRedisConnectPromise = (async () => {
    try {
      const { createClient } = await import("redis");
      const client = createClient({ url: redisUrl });
      client.on("error", () => {
        globalThis.__fintelRedisClient = undefined;
      });
      await client.connect();
      globalThis.__fintelRedisClient = client;
      return client;
    } catch {
      return null;
    }
  })();

  const client = await globalThis.__fintelRedisConnectPromise;
  globalThis.__fintelRedisConnectPromise = undefined;
  return client;
}

function memoryKey(threadId: string) {
  return `fintel:chat:thread:${threadId}`;
}

function ttlSeconds() {
  const raw = Number(process.env.REDIS_MEMORY_TTL_SECONDS ?? "604800");
  return Number.isFinite(raw) && raw > 0 ? raw : 604800;
}

function maxTurns() {
  const raw = Number(process.env.REDIS_MEMORY_MAX_TURNS ?? "40");
  return Number.isFinite(raw) && raw >= 8 ? raw : 40;
}

export async function getRecentTurns(threadId: string, limit = 24): Promise<MemoryTurn[]> {
  const client = await getRedisClient();

  if (client) {
    try {
      const list = await client.lRange(memoryKey(threadId), -Math.max(limit, 1), -1);
      return (list as string[])
        .map((row: string) => {
          try {
            return JSON.parse(row) as MemoryTurn;
          } catch {
            return null;
          }
        })
        .filter((turn): turn is MemoryTurn => Boolean(turn));
    } catch {
      // fall through to in-memory fallback
    }
  }

  return getInMemoryStore().get(threadId) ?? [];
}

export async function appendTurn(threadId: string, turn: MemoryTurn): Promise<void> {
  const client = await getRedisClient();

  if (client) {
    try {
      const key = memoryKey(threadId);
      await client.rPush(key, JSON.stringify(turn));
      await client.lTrim(key, -maxTurns(), -1);
      await client.expire(key, ttlSeconds());
      return;
    } catch {
      // fall through to in-memory fallback
    }
  }

  const store = getInMemoryStore();
  const previous = store.get(threadId) ?? [];
  store.set(threadId, [...previous, turn].slice(-24));
}
