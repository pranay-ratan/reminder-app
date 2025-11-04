import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store Outlook OAuth tokens
export const storeOutlookTokens = mutation({
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

    // Store or update Outlook tokens for the user
    await ctx.db.insert("outlookTokens", {
      userId: identity.subject,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAt: args.expiresAt,
      calendarId: args.calendarId,
      createdAt: Date.now(),
    });
  },
});

// Get stored Outlook tokens
export const getOutlookTokens = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const tokens = await ctx.db
      .query("outlookTokens")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return tokens;
  },
});

// Exchange authorization code for Outlook tokens
export const exchangeOutlookCodeForTokens = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Outlook OAuth credentials not configured");
    }

    const tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

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
        scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access",
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

// Refresh Outlook access token
export const refreshOutlookAccessToken = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tokens = await ctx.runQuery("outlookCalendar:getOutlookTokens");
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Outlook OAuth credentials not configured");
    }

    const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refreshToken,
        grant_type: "refresh_token",
        scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();

    // Update stored tokens
    await ctx.runMutation("outlookCalendar:storeOutlookTokens", {
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

// Sync task to Outlook Calendar
export const syncTaskToOutlookCalendar = action({
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

    // Get Outlook tokens
    const tokens = await ctx.runQuery("outlookCalendar:getOutlookTokens");
    if (!tokens) {
      throw new Error("Outlook Calendar not connected");
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokens.accessToken;
    if (Date.now() >= tokens.expiresAt) {
      const newTokens = await ctx.runAction("outlookCalendar:refreshOutlookAccessToken");
      accessToken = newTokens.accessToken;
    }

    // Create Outlook calendar event
    const eventData = {
      subject: `📝 ${task.title}`,
      body: {
        contentType: "text",
        content: task.description || "Task from Bebu's Reminder App",
      },
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(task.dueDate + 3600000).toISOString(), // 1 hour duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminderMinutesBeforeStart: 30,
      isReminderOn: true,
    };

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${tokens.calendarId}/events`,
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

// Remove task from Outlook Calendar
export const removeTaskFromOutlookCalendar = action({
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

    // Get Outlook tokens
    const tokens = await ctx.runQuery("outlookCalendar:getOutlookTokens");
    if (!tokens) {
      return; // Not connected to calendar
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokens.accessToken;
    if (Date.now() >= tokens.expiresAt) {
      const newTokens = await ctx.runAction("outlookCalendar:refreshOutlookAccessToken");
      accessToken = newTokens.accessToken;
    }

    // Delete calendar event
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${tokens.calendarId}/events/${task.calendarEventId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) { // 404 = already deleted
      throw new Error(`Failed to delete calendar event: ${response.statusText}`);
    }

    // Remove calendar event ID from task
    await ctx.runMutation("tasks:updateTask", {
      id: args.taskId,
      calendarEventId: undefined,
    });
  },
});
