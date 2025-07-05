import AssistantScreen from "@/components/AssistantScreen";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Page() {
  const { user } = useUser();

  return (
    <View className="flex-1">
      <SignedIn>
        <AssistantScreen />
      </SignedIn>
      <SignedOut>
        <Redirect href={"/SignIn"} />
      </SignedOut>
    </View>
  );
}
