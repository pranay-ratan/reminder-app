import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    dueTime: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    completed: v.boolean(),
    category: v.optional(v.string()),
    reminderSent: v.optional(v.boolean()),
    calendarEventId: v.optional(v.string()),
  })
    .index("by_completed", ["completed"])
    .index("by_due_date", ["dueDate"]),

  googleTokens: defineTable({
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
    calendarId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  outlookTokens: defineTable({
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
    calendarId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
