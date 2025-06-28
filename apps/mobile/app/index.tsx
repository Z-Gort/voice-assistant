import { useConnectionDetails } from "@/hooks/useConnectionDetails";
import {
  AudioSession,
  BarVisualizer,
  LiveKitRoom,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipantTracks,
  useRoomContext,
  useTrackTranscription,
  useVoiceAssistant,
} from "@livekit/react-native";
import { Track } from "livekit-client";
import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  // Start the audio session first.
  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession(); //cleanup when component unmounts
    };
  }, []);

  const connectionDetails = useConnectionDetails();

  return (
    <SafeAreaView>
      <LiveKitRoom
        serverUrl={connectionDetails?.url}
        token={connectionDetails?.token}
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

  const localTracks = useParticipantTracks(
    [Track.Source.Microphone],
    localParticipant.identity
  );

  const { segments: userTranscriptions } = useTrackTranscription(
    localTracks[0]
  );

  const micImage = isMicrophoneEnabled
    ? require("../assets/images/baseline_mic_white_24dp.png")
    : require("../assets/images/baseline_mic_off_white_24dp.png");

  return (
    <View style={styles.container}>
      <SimpleVoiceAssistant localTrack={localTracks[0]} />
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
  );
};

const SimpleVoiceAssistant = ({ localTrack }: { localTrack?: any }) => {
  const { state } = useVoiceAssistant();
  console.log("Voice assistant state:", state);
  return (
    <BarVisualizer
      state={state}
      barCount={7}
      options={{
        minHeight: 0.5,
      }}
      trackRef={localTrack}
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
