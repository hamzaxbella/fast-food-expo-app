import seed from "@/lib/seed";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const profile = () => {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      console.log("Starting seed...");
      await seed();
      Alert.alert("Success", "Database seeded successfully!");
      console.log("Seed completed");
    } catch (error) {
      console.error("Seed error:", error);
      Alert.alert(
        "Error",
        "Failed to seed database. Check console for details.",
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-5">
        <Text className="text-2xl font-bold mb-5">Profile</Text>

        <TouchableOpacity
          onPress={handleSeed}
          disabled={seeding}
          className="bg-primary p-4 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">
            {seeding ? "Seeding Database..." : "Reseed Database"}
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 mt-2 text-center">
          This will clear and repopulate all categories, menu items, and images
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default profile;
