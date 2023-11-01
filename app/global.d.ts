import { Database as db } from '@/lib/database.types';

declare global {
    type Database = db;
}