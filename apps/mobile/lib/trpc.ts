import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../backend/types";

export const api = createTRPCReact<AppRouter>();
