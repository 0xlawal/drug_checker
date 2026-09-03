CREATE TABLE `registry_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`source` text DEFAULT 'NAFDAC_Greenbook' NOT NULL,
	`product_name` text,
	`strength` text,
	`form` text,
	`applicant` text,
	`status` text,
	`approval_date` text,
	`expiry_date` text,
	`category` text,
	`route` text,
	`raw_response` text,
	`source_timestamp` text,
	`adapter_version` text DEFAULT '1.0.0',
	`retrievedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`lastVerified` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`ttl_seconds` integer DEFAULT 86400
);
--> statement-breakpoint
CREATE TABLE `user_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`user_comment` text,
	`reportedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`lastSignedIn` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE TABLE `verification_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`result_state` text NOT NULL,
	`source` text NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`warnings` text,
	`cached` integer DEFAULT false,
	`cache_age_seconds` integer,
	`source_latency_ms` integer,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
