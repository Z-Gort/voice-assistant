import { useClerk } from "@clerk/clerk-expo";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      // No manual redirect needed - Clerk auth state change will handle it
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onPress={handleSignOut}
      className="bg-background border-border"
    >
      <Text className="text-foreground">Sign out</Text>
    </Button>
  );
};

// Add default export for expo-router
export default SignOutButton;
