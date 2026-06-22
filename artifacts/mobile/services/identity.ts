/**
 * Lightweight device identity for run chat — no login required.
 * A stable per-device userId + an editable display name, persisted in AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const ID_KEY = '@pace_chat_user_id';
const NAME_KEY = '@pace_chat_display_name';

export interface ChatIdentity {
  userId: string;
  displayName: string;
}

function generateId(): string {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getIdentity(defaultName: string): Promise<ChatIdentity> {
  let userId = await AsyncStorage.getItem(ID_KEY);
  if (!userId) {
    userId = generateId();
    await AsyncStorage.setItem(ID_KEY, userId);
  }
  let displayName = await AsyncStorage.getItem(NAME_KEY);
  if (!displayName) {
    displayName = defaultName;
    await AsyncStorage.setItem(NAME_KEY, displayName);
  }
  return { userId, displayName };
}

export async function setDisplayName(name: string): Promise<void> {
  await AsyncStorage.setItem(NAME_KEY, name.trim());
}
