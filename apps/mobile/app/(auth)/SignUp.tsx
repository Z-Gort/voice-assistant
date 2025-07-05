import * as React from "react";
import { View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/label";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

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
      console.error(JSON.stringify(err, null, 2));
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
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      // Display user-friendly error messages
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("An error occurred during verification. Please try again.");
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center px-6 bg-background">
        <View className="w-full max-w-sm mx-auto space-y-8">
          <View className="text-center">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              Verify your email
            </Text>
            <Text className="text-sm text-muted-foreground mb-3">
              We sent a verification code to {emailAddress}
            </Text>
          </View>

          <View className="space-y-6">
            <View className="space-y-2">
              <Label nativeID="code-label" className="text-sm font-medium">
                Verification Code
              </Label>
              <Input
                value={code}
                placeholder="Enter your verification code"
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                aria-labelledby="code-label"
                className="w-full"
              />
            </View>

            {error && (
              <View className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            )}

            <Button
              onPress={onVerifyPress}
              disabled={!isLoaded}
              className="w-full mt-2"
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
      <View className="w-full max-w-sm mx-auto space-y-8">
        <View className="text-center">
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Create an account
          </Text>
          <Text className="text-sm text-muted-foreground mb-3">
            Enter your details to get started
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
              onChangeText={setPassword}
              autoComplete="new-password"
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
            onPress={onSignUpPress}
            disabled={!isLoaded}
            className="w-full mt-2"
          >
            <Text>Continue</Text>
          </Button>
        </View>

        <View className="flex-row justify-center items-center space-x-1">
          <Text className="text-sm text-muted-foreground">
            Already have an account?
          </Text>
          <Link href="/sign-in" className="ml-1">
            <Text className="text-sm text-primary font-medium">Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
