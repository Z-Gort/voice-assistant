import * as React from "react";
import { View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/trpc";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const createUser = api.other.createUser.useMutation();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Clear previous errors
    setError("");

    console.log(emailAddress, password);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err: any) {
      // Display user-friendly error messages
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("An error occurred during sign-up. Please try again.");
      }
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    // Clear previous errors
    setError("");

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        // Create user in database
        await createUser.mutateAsync({ email: emailAddress });

        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      // Display user-friendly error messages
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("An error occurred during verification. Please try again.");
      }
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center px-6 bg-background">
        <View className="w-full max-w-sm mx-auto space-y-12 mb-20">
          <View className="items-center mb-6">
            <Text className="text-5xl font-semibold italic tracking-tight text-foreground text-center">
              AI Agent
            </Text>
            <Text className="text-md text-muted-foreground mt-2">
              create your account
            </Text>
          </View>

          <View className="space-y-8">
            <View className="space-y-6">
              <Text className="text-center text-muted-foreground">
                We sent a verification code to {emailAddress}
              </Text>
              <Input
                value={code}
                placeholder="Verification Code"
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                className="w-full"
              />
            </View>

            {error && (
              <View className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            )}

            <Button
              onPress={onVerifyPress}
              disabled={!isLoaded}
              className="w-full mt-4"
            >
              <Text>Verify</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-background">
      <View className="w-full max-w-sm mx-auto space-y-12 mb-20">
        <View className="items-center mb-1">
          <Text className="text-5xl font-semibold italic tracking-tight text-foreground text-center">
            AI Agent
          </Text>
          <Text className="text-lg text-muted-foreground mt-4 mb-1">
            Create an account
          </Text>
        </View>

        <View className="space-y-8">
          <View className="space-y-6">
            <Input
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoComplete="email"
              className="w-full"
            />

            <View className="space-y-4 mt-2">
              <Input
                value={password}
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={setPassword}
                autoComplete="off"
                className="w-full"
              />
            </View>
          </View>

          {error && (
            <View className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
              <Text className="text-destructive text-sm">{error}</Text>
            </View>
          )}

          <Button
            onPress={onSignUpPress}
            disabled={!isLoaded}
            className="w-full mt-4"
          >
            <Text>Continue</Text>
          </Button>
        </View>

        <View className="flex-row justify-center items-center space-x-1 mt-3">
          <Text className="text-md text-muted-foreground">
            Already have an account?
          </Text>
          <Link href="/SignIn" className="ml-1">
            <Text className="text-md text-primary font-medium">Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
