import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";
const signIn = () => {
  return (
    <View>
      <Text>signIn</Text>
      <Button title="Sign Up" onPress={() => router.push("/signUp")} />
    </View>
  );
};

export default signIn;
