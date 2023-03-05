import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOGIN_INFO = '@loginInfo'
export const GOOGLE_EMAIL = '@ggEmail'
export const GOOGLE_TOKEN = '@ggtoken'
export const APPLE_TOKEN = '@appletoken'
export const FB_TOKEN = '@fbToken'
export const OAUTH_TOKEN = '@oAuthToken'
export const LAST_NEW_VIDEO = '@last_new_video'
export const SETTINGS = '@settings'
export const PUSH_TOKEN = "@pushToken"
export const DAILY_NOTIFICATION_ID = '@notificationId'
export const NOTIFICATIONS = '@internalNotifications'

export const storeString = async (storageKey, value) => {
    try {
        await AsyncStorage.setItem(storageKey, value)
    } catch (e) {
        alert(e)
    }
}

export const storeJSON = async (storageKey, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(storageKey, jsonValue)
    } catch (e) {
        alert(e)
    }
}


export const getStorageData = async (storageKey) => {
    try {
        const value = await AsyncStorage.getItem(storageKey)
        return value;
    } catch (e) {
        alert(e)
    }
}

export const deleteStorageData = (storageKey) => {
    AsyncStorage.removeItem(storageKey)
}
