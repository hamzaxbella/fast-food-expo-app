import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

function getEnv(key: string, required = true): string {
  const raw = process.env[key as keyof NodeJS.ProcessEnv] as string | undefined;
  if (!raw || raw.trim() === "") {
    if (required) throw new Error(`Missing env var ${key}`);
    return "";
  }
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

export const appwriteConfig = {
  endpoint: getEnv("EXPO_PUBLIC_APPWRITE_ENDPOINT"),
  platform: "com.zyllux.fastfood",
  projectId: getEnv("EXPO_PUBLIC_APPWRITE_PROJECT_ID"),
  databaseid: getEnv("EXPO_PUBLIC_APPWRITEDBKEY"),
  bucketiD: getEnv("EXPO_PUBLIC_APPWRITEBUCKETID"),
  userColectionid: getEnv("EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID"),
  categoriesCollectionid: "categories",
  menuCollectionid: "menu",
  customizationsCollectionid: "customisations",
  menucustomizationsCollectionid: "menu_customizations",
};

const APPWRITE_STORAGE_PATH =
  /\/storage\/buckets\/([^/]+)\/files\/([^/?#]+)\/(?:view|preview)/;

export const getOptimizedStorageImageUrl = (
  imageUrl: string,
  width = 320,
  quality = 70,
) => {
  if (!imageUrl.includes("/storage/buckets/")) {
    return imageUrl;
  }

  const match = imageUrl.match(APPWRITE_STORAGE_PATH);

  if (!match) {
    return imageUrl;
  }

  const bucketId = match[1];
  const fileId = match[2];

  return `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${appwriteConfig.projectId}&width=${width}&quality=${quality}`;
};

export const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

// Helpful runtime debug when seeding from device/emulator
console.log("Appwrite endpoint:", appwriteConfig.endpoint);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createuser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw Error;

    await signInf({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseid,
      appwriteConfig.userColectionid,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl },
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signInf = async ({ email, password }: SignInParams) => {
  try {
    const currentSession = await account
      .getSession("current")
      .catch(() => null);

    if (currentSession) {
      await account.deleteSession("current");
    }

    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseid,
      appwriteConfig.userColectionid,
      [Query.equal("accountId", currentAccount.$id)],
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseid,
      appwriteConfig.menuCollectionid,
      queries,
    );

    return menus.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseid,
      appwriteConfig.categoriesCollectionid,
    );

    return categories.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};
