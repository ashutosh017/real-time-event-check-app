// App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter } from "expo-router";
import SignUp from "./signup";
import { Button, View } from "react-native";


export default function App() {
  const router = useRouter();
  return (
     <View>
      <Button
        onPress={() => router.navigate("/signin")}
        title="Take me to signin page"
      ></Button>
      <Button
        onPress={() => router.navigate("/signup")}
        title="Take me to signup page"
      ></Button>
    </View>
  );
}
