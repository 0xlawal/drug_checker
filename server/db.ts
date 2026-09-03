import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../drizzle/schema';

const sqlite = new Database('./sqlite.db');
export const db = drizzle(sqlite, { schema });

export const registryDb = {
  async getCachedRecord(identifier: string, source: string = 'NAFDAC_Greenbook') {
    const record = await db.query.registryRecords.findFirst({
      where: (fields, { eq, and, gt }) =>
        and(
          eq(fields.identifier, identifier),
          eq(fields.source, source)
        ),
    });
    return record;
  },

  async upsertRecord(data: {
    identifier: string;
    source: string;
    productName?: string;
    strength?: string;
    form?: string;
    applicant?: string;
    status?: string;
    approvalDate?: string;
    expiryDate?: string;
    category?: string;
    route?: string;
    rawResponse?: string;
    sourceTimestamp?: string;
    adapterVersion?: string;
    ttlSeconds?: number;
  }) {
    const existing = await db.query.registryRecords.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.identifier, data.identifier), eq(fields.source, data.source)),
    });

    if (existing) {
      await db
        .update(schema.registryRecords)
        .set({
          productName: data.productName,
          strength: data.strength,
          form: data.form,
          applicant: data.applicant,
          status: data.status,
          approvalDate: data.approvalDate,
          expiryDate: data.expiryDate,
          category: data.category,
          route: data.route,
          rawResponse: data.rawResponse,
          sourceTimestamp: data.sourceTimestamp,
          adapterVersion: data.adapterVersion || '1.0.0',
          ttlSeconds: data.ttlSeconds || 86400,
          lastVerified: new Date(),
        })
        .where(
          (fields, { eq, and }) =>
            and(eq(fields.identifier, data.identifier), eq(fields.source, data.source))
        );
      return existing.id;
    } else {
      const result = await db
        .insert(schema.registryRecords)
        .values({
          identifier: data.identifier,
          source: data.source,
          productName: data.productName,
          strength: data.strength,
          form: data.form,
          applicant: data.applicant,
          status: data.status,
          approvalDate: data.approvalDate,
          expiryDate: data.expiryDate,
          category: data.category,
          route: data.route,
          rawResponse: data.rawResponse,
          sourceTimestamp: data.sourceTimestamp,
          adapterVersion: data.adapterVersion || '1.0.0',
          ttlSeconds: data.ttlSeconds || 86400,
        });
      return result.lastInsertRowid;
    }
  },

  async logVerification(data: {
    identifier: string;
    resultState: string;
    source: string;
    ipHash?: string;
    userAgent?: string;
    warnings?: string;
    cached?: boolean;
    cacheAgeSeconds?: number;
    sourceLatencyMs?: number;
  }) {
    const result = await db.insert(schema.verificationEvents).values({
      identifier: data.identifier,
      resultState: data.resultState,
      source: data.source,
      ipHash: data.ipHash,
      userAgent: data.userAgent,
      warnings: data.warnings,
      cached: data.cached || false,
      cacheAgeSeconds: data.cacheAgeSeconds,
      sourceLatencyMs: data.sourceLatencyMs,
    });
    return result.lastInsertRowid;
  },

  async cleanupOldEvents(retentionDays: number = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    await db
      .delete(schema.verificationEvents)
      .where((fields, { lt }) => lt(fields.createdAt, cutoff.getTime()));
  },
};

export default db;