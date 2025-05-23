import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { userRoleValues } from "../types/user-roles";

// User roles enum
export const userRoleEnum = pgEnum('user_role', userRoleValues);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("fullName").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default('care_worker'),
  phoneNumber: text("phone_number"),
  profileImage: text("profile_image"),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false),
  backupCodes: text("backup_codes").array(),
  lastPasswordChange: timestamp("last_password_change"),
  passwordResetRequired: boolean("password_reset_required").default(false),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
