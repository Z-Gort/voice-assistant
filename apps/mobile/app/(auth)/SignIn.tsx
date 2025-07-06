import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { View } from "react-native";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/label";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Clear previous errors
    setError("");

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err: any) {
      // Display user-friendly error messages
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("An error occurred during sign-in. Please try again.");
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-background">
      <View className="w-full max-w-sm mx-auto space-y-8">
        <View className="text-center">
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back!
          </Text>
          <Text className="text-sm text-muted-foreground mb-3">
            Sign in to continue
          </Text>
        </View>

        <View className="space-y-6">
          <View className="space-y-2">
            <Label nativeID="email-label" className="text-sm font-medium">
              Email
            </Label>
            <Input
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter your email"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoComplete="email"
              aria-labelledby="email-label"
              className="w-full"
            />
          </View>

          <View className="space-y-4">
            <Label nativeID="password-label" className="text-sm font-medium">
              Password
            </Label>
            <Input
              value={password}
              placeholder="Enter your password"
              secureTextEntry={true}
              onChangeText={setPassword}
              autoComplete="off"
              aria-labelledby="password-label"
              className="w-full"
            />
          </View>

          {error && (
            <View className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
              <Text className="text-destructive text-sm">{error}</Text>
            </View>
          )}

          <Button
            onPress={onSignInPress}
            disabled={!isLoaded}
            className="w-full mt-2"
          >
            <Text>Continue</Text>
          </Button>
        </View>

        <View className="flex-row justify-center items-center space-x-1">
          <Text className="text-sm text-muted-foreground">
            Don&apos;t have an account?
          </Text>
          <Link href="/SignUp" className="ml-1">
            <Text className="text-sm text-primary font-medium">Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
