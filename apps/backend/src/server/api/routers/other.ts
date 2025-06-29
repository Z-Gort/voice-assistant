import { z } from "zod";

import { AccessToken } from "livekit-server-sdk";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  createSessionRequestSchema,
  openaiRealtimeSessionResponseSchema,
} from "~/types/openaiRealtime";

export const otherRouter = createTRPCRouter({
  getRealtimeSession: publicProcedure
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
  createLiveKitToken: publicProcedure
    .query(async () => {
      try {
      const roomName = `userX-room`;
      const participantName = 'userX'; //fetch from db

      const at = new AccessToken(
        env.LIVEKIT_API_KEY,
        env.LIVEKIT_API_SECRET,
        {
          identity: participantName,
          ttl: "10m",
        },
      );
      at.addGrant({ roomJoin: true, room: roomName });

      return await at.toJwt();
    } catch (error) {
      console.error("Error creating LiveKit token:", error);
      throw error;
    }
    }),

  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ input }) => {
  //     const post: Post = {
  //       id: posts.length + 1,
  //       name: input.name,
  //     };
  //     posts.push(post);
  //     return post;
  //   }),

  // getLatest: publicProcedure.query(() => {
  //   return posts.at(-1) ?? null;
  // }),
});
