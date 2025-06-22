import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../lib/trpc";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";

export default function Index() {
  const { data, error, isLoading } = api.other.getRealtimeSession.useQuery();
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  console.log("getRealtimeSession response:", { data, error, isLoading });

  useEffect(() => {
    if (data?.client_secret?.value && !session && !isConnecting) {
      const connectSession = async () => {
        setIsConnecting(true);
        setConnectionError(null);

        try {
          const agent = new RealtimeAgent({
            name: "Assistant",
            instructions: "You are a pirate.",
          });

          const newSession = new RealtimeSession(agent, {
            model: "gpt-4o-realtime-preview-2025-06-03",
          });

          await newSession.connect({ apiKey: data.client_secret.value });
          setSession(newSession);
        } catch (err) {
          setConnectionError(
            err instanceof Error ? err.message : "Failed to connect session"
          );
        } finally {
          setIsConnecting(false);
        }
      };

      connectSession();
    }
  }, [data?.client_secret?.value, session, isConnecting]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      {isLoading && <Text>Loading session...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {data && <Text>Session ID: {data.id}</Text>}
      {isConnecting && <Text>Connecting to realtime session...</Text>}
      {connectionError && <Text>Connection Error: {connectionError}</Text>}
      {session && <Text>✅ Connected to realtime session!</Text>}
    </View>
  );
}
