import { Stack } from "expo-router";
import { TRPCProvider } from "../lib/TrpcProvider";
import { registerGlobals } from "@livekit/react-native";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

registerGlobals();

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <TRPCProvider>
        <Stack />
      </TRPCProvider>
    </ClerkProvider>
  );
}
