import { z } from "zod";

export const inputAudioNoiseReductionSchema = z
  .object({
    // Add specific properties when needed
  })
  .nullable();

export const inputAudioTranscriptionSchema = z
  .object({
    model: z.string().optional(),
    language: z.string().optional(),
    prompt: z.string().optional(),
  })
  .nullable();

export const turnDetectionSchema = z
  .object({
    // Add specific properties when needed
  })
  .nullable();

export const tracingSchema = z
  .union([
    z.literal("auto"),
    z.object({
      // Add specific properties when needed
    }),
  ])
  .nullable();

export const toolSchema = z.object({
  // Add specific properties when needed
});

export const clientSecretConfigSchema = z.object({
  input_audio_format: z.enum(["pcm16", "g711_ulaw", "g711_alaw"]).optional(),
  input_audio_noise_reduction: inputAudioNoiseReductionSchema.optional(),
  input_audio_transcription: inputAudioTranscriptionSchema.optional(),
  instructions: z.string().optional(),
  max_response_output_tokens: z
    .union([z.number().int().min(1).max(4096), z.literal("inf")])
    .optional(),
  modalities: z.array(z.enum(["audio", "text"])).optional(),
  model: z.string().optional(),
  output_audio_format: z.enum(["pcm16", "g711_ulaw", "g711_alaw"]).optional(),
  speed: z.number().min(0.25).max(1.5).optional(),
  temperature: z.number().min(0.6).max(1.2).optional(),
  tool_choice: z.enum(["auto", "none", "required"]).optional(),
  tools: z.array(toolSchema).optional(),
  tracing: tracingSchema.optional(),
  turn_detection: turnDetectionSchema.optional(),
  voice: z
    .enum([
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "fable",
      "onyx",
      "nova",
      "sage",
      "shimmer",
      "verse",
    ])
    .optional(),
});

export const clientSecretResponseSchema = z.object({
  value: z.string(),
  expires_at: z.number(),
});

// OpenAI Realtime Session Response
export const openaiRealtimeSessionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("realtime.session"),
  model: z.string(),
  modalities: z.array(z.enum(["audio", "text"])),
  instructions: z.string().optional(),
  voice: z.string(),
  input_audio_format: z.string(),
  output_audio_format: z.string(),
  input_audio_transcription: inputAudioTranscriptionSchema,
  turn_detection: turnDetectionSchema,
  tools: z.array(toolSchema),
  tool_choice: z.string(),
  temperature: z.number(),
  max_response_output_tokens: z.union([z.number(), z.literal("inf")]),
  speed: z.number(),
  tracing: tracingSchema,
  client_secret: clientSecretResponseSchema,
});

export const createSessionRequestSchema = clientSecretConfigSchema;

export type OpenAIRealtimeSessionResponse = z.infer<
  typeof openaiRealtimeSessionResponseSchema
>;
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type ClientSecretResponse = z.infer<typeof clientSecretResponseSchema>;
