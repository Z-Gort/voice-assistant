import { Stack } from "expo-router";
import { TRPCProvider } from "../lib/TrpcProvider";

export default function RootLayout() {
  return (
    <TRPCProvider>
      <Stack />
    </TRPCProvider>
  );
}