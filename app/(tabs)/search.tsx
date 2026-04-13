import MenuCart from "@/components/MenuCart";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { Category, MenuItem } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const search = () => {
  const { category: initialCategory, query: initialQuery } =
    useLocalSearchParams<{
      query: string;
      category: string;
    }>();

  const [activeCategory, setActiveCategory] = useState(initialCategory || "");
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");

  const { data, refetch, loading } = useAppwrite({
    fn: getMenu,
    params: {
      category: activeCategory,
      query: searchQuery,
    },
  });

  const { data: categories } = useAppwrite({ fn: getCategories });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      refetch({ category: activeCategory, query: searchQuery });
    }, 500);
    return () => clearTimeout(handler);
  }, [activeCategory, searchQuery]);

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 == 0;
          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-10" : "mt-0",
              )}
            >
              <MenuCart item={item as unknown as MenuItem} />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start w-full">
                <Text className="small-bold uppercase text-primary mb-2">
                  Search
                </Text>
                <Text className="paragraph-semibold text-dark-100 mb-4">
                  Find your favorite Food
                </Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-dark-50 rounded-full px-4 py-3 mb-6 w-full">
                  <Ionicons name="search-outline" size={20} color="#888" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search for food..."
                    className="flex-1 ml-2 text-base text-dark-100"
                    placeholderTextColor="#888"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Categories Horizontal List */}
                <View className="w-full">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    <TouchableOpacity
                      onPress={() => setActiveCategory("")}
                      className={cn(
                        "px-5 py-2.5 rounded-full mr-3",
                        activeCategory === "" ? "bg-primary" : "bg-dark-50",
                      )}
                    >
                      <Text
                        className={cn(
                          "font-bold",
                          activeCategory === ""
                            ? "text-white"
                            : "text-dark-100",
                        )}
                      >
                        All
                      </Text>
                    </TouchableOpacity>

                    {categories?.map((cat) => {
                      const category = cat as unknown as Category;
                      const isSelected = activeCategory === category.$id;
                      return (
                        <TouchableOpacity
                          key={category.$id}
                          onPress={() =>
                            setActiveCategory(isSelected ? "" : category.$id)
                          }
                          className={cn(
                            "px-5 py-2.5 rounded-full mr-3",
                            isSelected ? "bg-primary" : "bg-dark-50",
                          )}
                        >
                          <Text
                            className={cn(
                              "font-bold",
                              isSelected ? "text-white" : "text-dark-100",
                            )}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>

            {loading && (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color="#FF6C44" />
              </View>
            )}

            {!loading && (!data || data.length === 0) && (
              <View className="items-center justify-center py-10">
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text className="text-gray-400 mt-4 text-center">
                  No menus found matching your search.
                </Text>
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default search;
