import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";

import { api } from "./trpc";
import { useAuth } from "@clerk/clerk-expo";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          async headers() {
            const authToken = await getToken();
            return {
              Authorization: authToken ? `Bearer ${authToken}` : undefined,
            };
          },
          url:
            process.env.APP_VARIANT === "development"
              ? "http://localhost:3000/api/trpc"
              : "https://gmail-ai-backend.vercel.app/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
