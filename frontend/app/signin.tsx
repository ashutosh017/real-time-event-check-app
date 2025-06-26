// app/signin.tsx
import { SIGN_IN } from "@/lib/mutations";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import request from "graphql-request";
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signinMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: any) => {
      const res: any = await request("http://localhost:4000", SIGN_IN, {
        email,
        password,
      });
      return res.data;
    },
  });
  const handleSignIn = async () => {
    try {
        await signinMutation.mutateAsync({email,password})
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title={"Sign In"} onPress={handleSignIn} />
      <Text style={styles.link} onPress={() => router.navigate("/signup")}>
        Don't have an account? Sign Up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, marginVertical: 8, padding: 10, borderRadius: 5 },
  error: { color: "red", marginTop: 10 },
  link: {
    marginTop: 20,
    color: "blue",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
