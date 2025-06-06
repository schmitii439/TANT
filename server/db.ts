import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a PostgreSQL client
const queryClient = postgres(process.env.DATABASE_URL!);

// Create a Drizzle instance
export const db = drizzle(queryClient, { schema });