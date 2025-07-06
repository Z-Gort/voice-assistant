import { Image, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/SignOutButton";
import { api } from "@/lib/trpc";
import {
  AudioSession,
  BarVisualizer,
  LiveKitRoom,
  useIOSAudioManagement,
  useLocalParticipant,
  useRoomContext,
  useVoiceAssistant,
} from "@livekit/react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVER_URL = "wss://gmailai-v1szfdc6.livekit.cloud";
const NOTION_CLIENT_ID = "qc3xHeGjXGGEMUNI";
const REDIRECT_URI = "myapp://oauth-callback";

export default function AssistantScreen() {
  const [isExecutingOAuth, setIsExecutingOAuth] = useState(false);

  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const {
    data: tokenData,
    isSuccess: tokenSuccess,
    refetch: refetchToken,
  } = api.other.getLiveKitToken.useQuery();

  const exchangeCodeMutation = api.other.exchangeOAuthCode.useMutation();

  // Execute OAuth flow if needed
  useEffect(() => {
    const startOAuthFlow = async () => {
      setIsExecutingOAuth(true);
      try {
        // Generate PKCE challenge
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Build the OAuth URL
        const params = new URLSearchParams({
          response_type: "code",
          client_id: NOTION_CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          state: Math.random().toString(36).substring(2, 15),
        });

        const authUrl = `https://mcp.notion.com/authorize?${params.toString()}`;

        // Open browser for OAuth
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          REDIRECT_URI
        );

        // Handle the OAuth callback
        if (result.type === "success") {
          const url = new URL(result.url);
          const code = url.searchParams.get("code");

          if (code) {
            await exchangeCodeMutation.mutateAsync({
              code: decodeURIComponent(code),
              codeVerifier,
            });
            // Refetch token after successful OAuth
            await refetchToken();
          }
        }
      } catch (error) {
        console.error("OAuth flow error:", error);
      } finally {
        setIsExecutingOAuth(false);
      }
    };

    // Start OAuth if we need it and aren't already executing it
    if (tokenSuccess && tokenData?.needsOAuth && !isExecutingOAuth) {
      startOAuthFlow();
    }
  }, [
    tokenData,
    tokenSuccess,
    exchangeCodeMutation,
    isExecutingOAuth,
    refetchToken,
  ]);

  const isLoading = !tokenSuccess || isExecutingOAuth;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-foreground text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <LiveKitRoom
        serverUrl={SERVER_URL}
        token={tokenData?.liveKitToken}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomView />
      </LiveKitRoom>
    </SafeAreaView>
  );
}

const RoomView = () => {
  const room = useRoomContext();
  useIOSAudioManagement(room, true);

  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const micImage = isMicrophoneEnabled
    ? require("../assets/images/baseline_mic_white_24dp.png")
    : require("../assets/images/baseline_mic_off_white_24dp.png");

  return (
    <View className="flex-1">
      {/* Top Section - Sign Out Button */}
      <View className="w-full items-start mt-4 mx-4 mb-4">
        <SignOutButton />
      </View>

      {/* Center Section - Voice Assistant */}
      <View className="flex-1 justify-start items-center pt-16">
        <SimpleVoiceAssistant />
      </View>

      {/* Bottom Section - Microphone Button */}
      <View className="items-center">
        <Button
          variant="default"
          className="w-15 h-15 rounded-full bg-blue-600 active:bg-blue-700 p-2.5"
          onPress={() =>
            localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
          }
        >
          <Image source={micImage} className="w-10 h-10" />
        </Button>
      </View>
    </View>
  );
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <View className="items-center w-full">
      <View className="w-full items-center">
        <BarVisualizer
          state={state}
          barCount={7}
          options={{
            minHeight: 0.5,
          }}
          trackRef={audioTrack}
          style={{
            width: "100%",
            height: 100,
          }}
        />
      </View>
    </View>
  );
};
