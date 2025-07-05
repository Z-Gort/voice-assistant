import { z } from "zod";

import { AccessToken } from "livekit-server-sdk";
import { env } from "~/env";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  createSessionRequestSchema,
  openaiRealtimeSessionResponseSchema,
} from "~/types/openaiRealtime";
import { db } from "~/server/db";

export const otherRouter = createTRPCRouter({
  getRealtimeSession: protectedProcedure
    .input(createSessionRequestSchema.optional())
    .query(async ({ input }) => {
      const response = await fetch(
        "https://api.openai.com/v1/realtime/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-realtime-preview-2025-06-03",
            voice: "verse",
            ...input, //not really correct--model and voice might be defined twice
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const rawData = (await response.json()) as unknown;
      const validatedData = openaiRealtimeSessionResponseSchema.parse(rawData);

      return validatedData;
    }),
  createLiveKitToken: protectedProcedure.query(async () => {
    try {
      const roomName = `test-room`;
      const participantName = "userZ";

      const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: participantName,
        ttl: "10m",
      });
      at.addGrant({ roomJoin: true, room: "8-room" }); //ranodomly generate a new room every time

      return await at.toJwt();
    } catch (error) {
      console.error("Error creating LiveKit token:", error);
      throw error;
    }
  }),
  testMutation: publicProcedure
    .input(
      z.object({
        testData: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Add functionality here
        // This is a test mutation with blank functionality
        console.log("ctx", ctx);
        return {
          success: true,
          message: "Test mutation executed",
          receivedData: input.testData,
        };
      } catch (error) {
        console.error("Error in testMutation:", error);
        throw error;
      }
    }),
});
