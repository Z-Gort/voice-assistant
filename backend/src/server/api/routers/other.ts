import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import {
  openaiRealtimeSessionResponseSchema,
  createSessionRequestSchema,
  type OpenAIRealtimeSessionResponse,
} from "~/types/openaiRealtime";

export const otherRouter = createTRPCRouter({
  getRealtimeSession: publicProcedure
    .input(createSessionRequestSchema.optional())
    .query(async ({ input }): Promise<OpenAIRealtimeSessionResponse> => {
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
            ...input,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const rawData = (await response.json()) as unknown;

      // Validate the response against our schema
      const validatedData = openaiRealtimeSessionResponseSchema.parse(rawData);

      return validatedData;
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
