import { View, Text, Button } from "react-native";
import { api } from "@/lib/trpc";

export function TRPCTest() {
  const helloQuery = api.posts.hello.useQuery({ text: "from mobile!" });
  const createMutation = api.posts.create.useMutation({
    onSuccess: () => {
      helloQuery.refetch();
    },
  });

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        tRPC Test Component
      </Text>

      {helloQuery.isLoading && <Text>Loading...</Text>}
      {helloQuery.error && <Text>Error: {helloQuery.error.message}</Text>}
      {helloQuery.data && (
        <Text style={{ marginBottom: 10 }}>
          Response: {helloQuery.data.greeting}
        </Text>
      )}

      <Button
        title="Create Post"
        onPress={() => createMutation.mutate({ name: "Test Post" })}
        disabled={createMutation.isPending}
      />

      {createMutation.isPending && <Text>Creating...</Text>}
      {createMutation.error && (
        <Text>Error: {createMutation.error.message}</Text>
      )}
    </View>
  );
}
