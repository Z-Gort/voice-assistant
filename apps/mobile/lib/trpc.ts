import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@backend/api";

export const api = createTRPCReact<AppRouter>();
