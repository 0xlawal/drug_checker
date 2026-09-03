import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ----------------------------------------------------------------------
// Registry Records Table (for persistent cache)
// ----------------------------------------------------------------------
export const registryRecords = sqliteTable(
  "registry_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    identifier: text("identifier").notNull(),
    source: text("source").notNull().default("NAFDAC_Greenbook"),
    productName: text("product_name"),
    strength: text("strength"),
    form: text("form"),
    applicant: text("applicant"),
    status: text("status"),
    approvalDate: text("approval_date"),
    expiryDate: text("expiry_date"),
    category: text("category"),
    route: text("route"),
    rawResponse: text("raw_response"),
    sourceTimestamp: text("source_timestamp"),
    adapterVersion: text("adapter_version").default("1.0.0"),
    retrievedAt: integer("retrievedAt", { mode: "timestamp" }).defaultNow(),
    lastVerified: integer("lastVerified", { mode: "timestamp" }).defaultNow(),
    ttlSeconds: integer("ttl_seconds").default(86400),
  }
);

// ----------------------------------------------------------------------
// Verification Events Table (for telemetry + audit)
// ----------------------------------------------------------------------
export const verificationEvents = sqliteTable(
  "verification_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    identifier: text("identifier").notNull(),
    resultState: text("result_state").notNull(),
    source: text("source").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    warnings: text("warnings"),
    cached: integer("cached", { mode: "boolean" }).default(false),
    cacheAgeSeconds: integer("cache_age_seconds"),
    sourceLatencyMs: integer("source_latency_ms"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
  }
);

// ----------------------------------------------------------------------
// User Reports Table (optional feedback)
// ----------------------------------------------------------------------
export const userReports = sqliteTable(
  "user_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    identifier: text("identifier").notNull(),
    userComment: text("user_comment"),
    reportedAt: integer("reportedAt", { mode: "timestamp" }).defaultNow(),
  }
);