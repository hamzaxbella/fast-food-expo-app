// ✅ FIX: Use the legacy import for downloadAsync support in Expo SDK 52+
import * as FileSystem from "expo-file-system/legacy";
import { ID, Permission } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseid,
    collectionId,
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(
        appwriteConfig.databaseid,
        collectionId,
        doc.$id,
      ),
    ),
  );
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketiD);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketiD, file.$id),
    ),
  );
}

async function uploadImageToStorage(imageUrl: string) {
  try {
    // 1. Define a temporary local path
    const filename = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;
    const localUri = FileSystem.documentDirectory + filename;
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "gif"
            ? "image/gif"
            : "image/jpeg";

    // 2. Download remote image (Using legacy API)
    const downloadRes = await FileSystem.downloadAsync(imageUrl, localUri);

    // 3. Create file object for Appwrite
    const fileObj = {
      name: filename,
      type: mimeType,
      size: 0, // Appwrite infers size from URI
      uri: downloadRes.uri,
    };

    // 4. Upload with public read permissions for both authenticated and unauthenticated users
    const file = await storage.createFile(
      appwriteConfig.bucketiD,
      ID.unique(),
      fileObj,
      [Permission.read("any"), Permission.read("users")],
    );

    // 5. Cleanup
    await FileSystem.deleteAsync(localUri, { idempotent: true });

    // 6. Construct proper URL string
    const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketiD}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
    console.log("Generated image URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading image:", imageUrl, error);
    throw error;
  }
}

async function seed(): Promise<void> {
  try {
    console.log("🌱 Starting seed...");

    // 1. Clear old data
    await clearAll(appwriteConfig.categoriesCollectionid);
    await clearAll(appwriteConfig.customizationsCollectionid);
    await clearAll(appwriteConfig.menuCollectionid);
    await clearAll(appwriteConfig.menucustomizationsCollectionid);
    await clearStorage();

    console.log("🧹 Cleanup complete.");

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseid,
        appwriteConfig.categoriesCollectionid,
        ID.unique(),
        cat,
      );
      categoryMap[cat.name] = doc.$id;
    }
    console.log("✅ Categories created.");

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseid,
        appwriteConfig.customizationsCollectionid,
        ID.unique(),
        {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        },
      );
      customizationMap[cus.name] = doc.$id;
    }
    console.log("✅ Customizations created.");

    // 4. Create Menu Items
    for (const item of data.menu) {
      console.log(`Uploading image for ${item.name}...`);
      const uploadedImage = await uploadImageToStorage(item.image_url);

      const doc = await databases.createDocument(
        appwriteConfig.databaseid,
        appwriteConfig.menuCollectionid,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: uploadedImage,
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        },
      );

      // 5. Link customizations
      for (const cusName of item.customizations) {
        if (customizationMap[cusName]) {
          await databases.createDocument(
            appwriteConfig.databaseid,
            appwriteConfig.menucustomizationsCollectionid,
            ID.unique(),
            {
              menu: doc.$id,
              customizations: customizationMap[cusName],
            },
          );
        }
      }
    }

    console.log("✅ Seeding complete.");
  } catch (e) {
    console.error("❌ Failed to seed database", e);
    // Log explicit details if available
    if (e instanceof Error) {
      console.error("Error message:", e.message);
    }
    throw e;
  }
}

export default seed;
