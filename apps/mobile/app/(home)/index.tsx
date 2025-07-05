import AssistantScreen from "@/components/AssistantScreen";
import { SignOutButton } from "@/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Page() {
  const { user } = useUser();

  return (
    <View className="flex-1">
      <SignedIn>
        {/* <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton /> */}
        <AssistantScreen />
      </SignedIn>
      <SignedOut>
        <Redirect href={"/sign-in"} />
      </SignedOut>
    </View>
  );
}
