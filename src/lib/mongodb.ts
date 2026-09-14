import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  // Read at call time, not module load: a missing var must fail the request,
  // not the build (route modules are imported while Vercel compiles).
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in environment");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // Serverless: many short-lived instances, so keep pools small and
        // fail fast instead of hanging until the function times out.
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
