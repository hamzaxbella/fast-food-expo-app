import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createuser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
const signUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password)
      return Alert.alert(
        "Error",
        "Please enter valid email address & password",
      );

    setIsSubmitting(true);

    try {
      await createuser({ email, password, name });

      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your Fullname"
        onChangeText={(text) => {
          setForm((prev) => ({ ...prev, name: text }));
        }}
        label="fullname"
      />
      <CustomInput
        placeholder="Enter your email"
        onChangeText={(text) => {
          setForm((prev) => ({ ...prev, email: text }));
        }}
        label="email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => {
          setForm((prev) => ({ ...prev, password: text }));
        }}
        label="password"
        secureTextEntry={true}
      />
      <CustomButton title="Sign Up" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link href={"/signIn"} className="base-bold text-primary">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default signUp;
