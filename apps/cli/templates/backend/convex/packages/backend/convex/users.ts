import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getCurrentUserId } from "./lib/auth";

/**
 * Get the current authenticated user's profile
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.string(),
      emailVerified: v.optional(v.number()),
      image: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.string(),
      emailVerified: v.optional(v.number()),
      image: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const updates: { name?: string; image?: string } = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});

/**
 * Get a user by ID (internal function)
 */
export const getUserById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.string(),
      emailVerified: v.optional(v.number()),
      image: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * List all users (admin function - requires authentication)
 */
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.string(),
      emailVerified: v.optional(v.number()),
      image: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const limit = args.limit ?? 50;
    return await ctx.db.query("users").take(limit);
  },
});
