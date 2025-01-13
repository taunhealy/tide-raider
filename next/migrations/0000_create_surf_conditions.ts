import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const surfConditions = sqliteTable('surf_conditions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  windDirection: text('wind_direction').notNull(),
  windSpeed: integer('wind_speed').notNull(),
  swellHeight: integer('swell_height').notNull(),
  swellDirection: text('swell_direction').notNull(),
  swellPeriod: integer('swell_period').notNull(),
  timestamp: integer('timestamp').notNull(),
});

export async function up(db: any) {
  await db.run(sql`
    CREATE TABLE surf_conditions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      wind_direction TEXT NOT NULL,
      wind_speed INTEGER NOT NULL,
      swell_height INTEGER NOT NULL,
      swell_direction TEXT NOT NULL,
      swell_period INTEGER NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
}

export async function down(db: any) {
  await db.run(sql`DROP TABLE surf_conditions;`);
} 