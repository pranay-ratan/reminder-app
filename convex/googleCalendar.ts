import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Store Google OAuth tokens
export const storeGoogleTokens = mutation({
  args: {
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
    calendarId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Store or update Google tokens for the user
    await ctx.db.insert("googleTokens", {
      userId: identity.subject,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAt: args.expiresAt,
      calendarId: args.calendarId,
      createdAt: Date.now(),
    });
  },
});

// Get stored Google tokens
export const getGoogleTokens = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const tokens = await ctx.runQuery(api.googleCalendar.getGoogleTokens);

    return tokens;
  },
});

// Exchange authorization code for tokens
export const exchangeCodeForTokens = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const tokenEndpoint = "https://oauth2.googleapis.com/token";

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: args.code,
        grant_type: "authorization_code",
        redirect_uri: args.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  },
});

// Refresh access token
export const refreshAccessToken = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tokens = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();

    // Update stored tokens
    await ctx.runMutation("googleCalendar:storeGoogleTokens", {
      accessToken: data.access_token,
      refreshToken: tokens.refreshToken, // Keep the same refresh token
      expiresAt: Date.now() + (data.expires_in * 1000),
      calendarId: tokens.calendarId,
    });

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  },
});

// Sync task to Google Calendar
export const syncTaskToCalendar = action({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get task details
    const task = await ctx.runQuery("tasks:getTask", { id: args.taskId });
    if (!task) {
      throw new Error("Task not found");
    }

    // Get Google tokens
    const tokens = await ctx.runQuery("googleCalendar:getGoogleTokens");
    if (!tokens) {
      throw new Error("Google Calendar not connected");
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokens.accessToken;
    if (Date.now() >= tokens.expiresAt) {
      const newTokens = await ctx.runAction("googleCalendar:refreshAccessToken");
      accessToken = newTokens.accessToken;
    }

    // Create calendar event
    const eventData = {
      summary: `📝 ${task.title}`,
      description: task.description || "Task from Bebu's Reminder App",
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(task.dueDate + 3600000).toISOString(), // 1 hour duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "popup", minutes: 0 },
        ],
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${tokens.calendarId}/events`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`);
    }

    const event = await response.json();

    // Store the calendar event ID with the task
    await ctx.runMutation("tasks:updateTask", {
      id: args.taskId,
      calendarEventId: event.id,
    });

    return event;
  },
});

// Remove task from Google Calendar
export const removeTaskFromCalendar = action({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get task details
    const task = await ctx.runQuery("tasks:getTask", { id: args.taskId });
    if (!task?.calendarEventId) {
      return; // No calendar event to remove
    }

    // Get Google tokens
    const tokens = await ctx.runQuery("googleCalendar:getGoogleTokens");
    if (!tokens) {
      return; // Not connected to calendar
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokens.accessToken;
    if (Date.now() >= tokens.expiresAt) {
      const newTokens = await ctx.runAction("googleCalendar:refreshAccessToken");
      accessToken = newTokens.accessToken;
    }

    // Delete calendar event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${tokens.calendarId}/events/${task.calendarEventId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 410) { // 410 = already deleted
      throw new Error(`Failed to delete calendar event: ${response.statusText}`);
    }

    // Remove calendar event ID from task
    await ctx.db.patch(args.taskId, {
      calendarEventId: undefined,
    });
  },
});
