import { getOptimizedStorageImageUrl } from "@/lib/appwrite";
import { MenuItem } from "@/type";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function MenuCart({
  item,
  onAddToCart,
}: {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
}) {
  const { image_url, name, price } = item;
  const imageUrl = getOptimizedStorageImageUrl(image_url);
  const [failed, setFailed] = useState(false);

  return (
    <View className="w-36 mr-4">
      <View className="w-32 h-32 rounded-2xl bg-dark-50 overflow-hidden items-center justify-center">
        {failed ? (
          <Text className="text-dark-100 text-xs font-medium text-center px-3">
            Image unavailable
          </Text>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="disk"
            transition={150}
            onError={() => setFailed(true)}
          />
        )}
      </View>

      <Text
        className="text-center base-bold text-dark-100 mb-1"
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text className="text-center text-dark-100 mb-3">${price}</Text>

      <TouchableOpacity
        onPress={() => onAddToCart?.(item)}
        className="bg-primary rounded-full py-2 px-4"
      >
        <Text className="text-center text-white font-bold">Add to cart</Text>
      </TouchableOpacity>
    </View>
  );
}

export default MenuCart;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});
