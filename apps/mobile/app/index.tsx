import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";

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
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVER_URL = "wss://gmailai-v1szfdc6.livekit.cloud";

export default function AssistantScreen() {
  // Start the audio session first.
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
    return <View><Text>Requesting token</Text></View>;
  }
  if (isError) {
    console.error("Token error:", error);
    return (
      <View>
        <Text>Could not get token</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
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
  const router = useRouter();

  const room = useRoomContext();
  useIOSAudioManagement(room, true);

  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  const { microphoneTrack } = useLocalParticipant();
  console.log("microphoneTrack:", microphoneTrack?.trackInfo);

  // Controls
  const micImage = isMicrophoneEnabled
    ? require("../assets/images/baseline_mic_white_24dp.png")
    : require("../assets/images/baseline_mic_off_white_24dp.png");

  return (
    <View style={styles.container}>
      <SimpleVoiceAssistant />
      <ScrollView style={styles.logContainer}></ScrollView>

      <View style={styles.controlsContainer}>
        <Pressable
          style={({ pressed }) => [
            { backgroundColor: pressed ? "rgb(210, 230, 255)" : "#007DFF" },
            styles.button,
          ]}
          onPress={() => {
            localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
          }}
        >
          <Image style={styles.icon} source={micImage} />
        </Pressable>
      </View>
    </View>
  );
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <BarVisualizer
      state={state}
      barCount={7}
      options={{
        minHeight: 0.5,
      }}
      trackRef={audioTrack} //won't work for some reason
      style={styles.voiceAssistant}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  voiceAssistant: {
    width: "100%",
    height: 100,
  },
  logContainer: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
  },
  controlsContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  button: {
    width: 60,
    height: 60,
    padding: 10,
    margin: 12,
    borderRadius: 30,
  },
  icon: {
    width: 40,
    height: 40,
  },
  userTranscriptionContainer: {
    width: "100%",
    alignContent: "flex-end",
  },
  userTranscription: {
    width: "auto",
    fontSize: 18,
    alignSelf: "flex-end",
    borderRadius: 6,
    padding: 8,
    margin: 16,
  },
  userTranscriptionLight: {
    backgroundColor: "#B0B0B0",
  },
  userTranscriptionDark: {
    backgroundColor: "#404040",
  },

  agentTranscription: {
    fontSize: 20,
    textAlign: "left",
    margin: 16,
  },
  lightThemeText: {
    color: "#000000",
  },
  darkThemeText: {
    color: "#FFFFFF",
  },
});
