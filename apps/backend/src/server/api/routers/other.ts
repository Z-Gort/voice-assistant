import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { AccessToken } from "livekit-server-sdk";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type NotionTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export const otherRouter = createTRPCRouter({
  getLiveKitToken: protectedProcedure.query(async ({ ctx }) => {
    try {
      // First, check if user has a refresh token
      const [user] = await db
        .select({ refreshToken: users.refreshToken })
        .from(users)
        .where(eq(users.clerkId, ctx.auth.userId))
        .limit(1);

      if (!user?.refreshToken) {
        return { needsOAuth: true };
      }

      // Exchange refresh token for access token
      const tokenResponse = await fetch("https://mcp.notion.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: env.NOTION_CLIENT_ID,
          refresh_token: user.refreshToken,
          resource: "https://mcp.notion.com",
        }),
      });

      const tokenData = (await tokenResponse.json()) as NotionTokenResponse;

      // Create LiveKit token with access token in metadata
      const randomString = Math.random().toString(36).substring(2, 8);
      const participantName = ctx.auth.userId;
      const roomName = `${participantName}-${randomString}`;

      const isDev = env.NODE_ENV === "development";
      console.log("isDev", isDev);

      const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: participantName,
        ttl: "10m",
        metadata: JSON.stringify({
          accessToken: tokenData.access_token,
          dev: isDev,
        }),
      });
      at.addGrant({ roomJoin: true, room: roomName });

      const token = await at.toJwt();
      return { needsOAuth: false, liveKitToken: token };
    } catch (error) {
      console.error("getLiveKitToken error", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get LiveKit token",
        cause: error,
      });
    }
  }),
  exchangeOAuthCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        codeVerifier: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const tokenResponse = await fetch("https://mcp.notion.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: env.NOTION_CLIENT_ID,
            code: input.code,
            code_verifier: input.codeVerifier,
            redirect_uri: "myapp://oauth-callback",
            resource: "https://mcp.notion.com",
          }),
        });

        const tokenData = (await tokenResponse.json()) as NotionTokenResponse;

        // Save refresh token to database
        await db
          .update(users)
          .set({
            refreshToken: tokenData.refresh_token,
          })
          .where(eq(users.clerkId, ctx.auth.userId));

        return { success: true };
      } catch (error) {
        console.error("exchangeOAuthCode error", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to exchange OAuth code",
        });
      }
    }),
  createUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [user] = await db
          .insert(users)
          .values({
            email: input.email,
            clerkId: ctx.auth.userId,
          })
          .returning();

        return user;
      } catch (error) {
        console.error("createUser error", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),
});
