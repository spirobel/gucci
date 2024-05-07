CREATE TABLE `session_cookies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cookie` text,
	`address` text,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP)
);
