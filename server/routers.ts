import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { registryHealth, verifyIdentifier } from "./registry";
import crypto from 'crypto';

// Helper function to hash IP
function hashIP(ip: string): string {
  const salt = process.env.IP_SALT || 'default-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

const packageDetailsSchema = z.object({
  productName: z.string().trim().max(200).optional(),
  strength: z.string().trim().max(120).optional(),
  form: z.string().trim().max(120).optional(),
  applicantName: z.string().trim().max(200).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  registry: router({
    verify: publicProcedure
      .input(
        z.object({
          identifier: z.string().trim().min(1).max(64),
          details: packageDetailsSchema.default({}),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        // Get IP hash for logging
        const ipHash = hashIP(ctx.req.ip || 'unknown');
        const userAgent = ctx.req.headers['user-agent'] || 'unknown';
        
        // Call the verify function with context
        const result = await verifyIdentifier(input.identifier, input.details);
        
        // Log the verification event (if you want to add this, uncomment)
        // await registryDb.logVerification({
        //   identifier: input.identifier,
        //   resultState: result.state,
        //   source: result.source.name,
        //   ipHash,
        //   userAgent,
        //   warnings: result.warnings.join('; '),
        //   cached: result.cached,
        //   cacheAgeSeconds: result.cacheAgeSeconds,
        // });
        
        return result;
      }),
    health: publicProcedure
      .query(async () => {
        // Check if Greenbook is reachable
        try {
          const response = await fetch('https://greenbook.nafdac.gov.ng/', {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
          });
          return {
            status: response.ok ? 'ok' : 'degraded',
            source: 'NAFDAC_Greenbook',
            timestamp: new Date().toISOString(),
          };
        } catch {
          return {
            status: 'unavailable',
            source: 'NAFDAC_Greenbook',
            timestamp: new Date().toISOString(),
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;