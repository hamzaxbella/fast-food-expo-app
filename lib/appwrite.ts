import { CreateUserParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.zyllux.fastfood",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseid: process.env.EXPO_PUBLIC_APPWRITEDBKEY!,
  userColectionid: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
};

export const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
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
    const session = await account.createEmailPasswordSession(email, password);
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
