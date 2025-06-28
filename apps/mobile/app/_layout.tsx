import { Stack } from "expo-router";
import { TRPCProvider } from "../lib/TrpcProvider";
import { registerGlobals } from '@livekit/react-native';

registerGlobals();

export default function RootLayout() {
  return (
    <TRPCProvider>
      <Stack />
    </TRPCProvider>
  );
}