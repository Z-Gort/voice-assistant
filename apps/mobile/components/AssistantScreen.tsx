import { Image, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
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
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVER_URL = "wss://gmailai-v1szfdc6.livekit.cloud";

export default function AssistantScreen() {
  // Start the audio session first.
  // TODO: should manually join room because if user just disconnected for 15secs
  //  room still thinks they're there and won't let same user rejoin automatically (manual join workaround might help)
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
    data: liveKitToken,
    isLoading,
    isError,
    error,
  } = api.other.createLiveKitToken.useQuery();

  if (isLoading) {
    return (
      <View>
        <Text>Requesting token</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View>
        <Text>Could not get token</Text>
      </View>
    );
  }

  if (!liveKitToken) {
    return (
      <View>
        <Text>No token received</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <LiveKitRoom
        serverUrl={SERVER_URL}
        token={liveKitToken}
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
    <View className="flex-1 justify-between items-center px-4 pb-8 pt-8">
      {/* Top-half */}
      <SimpleVoiceAssistant />

      {/* Bottom-half */}
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
  );
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <View className="items-center">
      <Text className="text-foreground text-lg mb-4">
        Voice Assistant State: {state}
      </Text>
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
  );
};
