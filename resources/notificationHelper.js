import * as Notifications from "expo-notifications";
import { DAILY_NOTIFICATION_ID, deleteStorageData, getStorageData, PUSH_TOKEN, storeString } from "../dao/internalStorage";
import { NotificationsStrings } from "./strings";
import { saveUserPushtoken } from "../dao/userDAO";
import { Platform } from "react-native";
import report from "../components/CrashReport";
import auth from '@react-native-firebase/auth'
import store from "../redux.store/configureStore";

const registerForNotifications = async () => {

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()        
        if (existingStatus !== 'granted') {
            const res = await Notifications.requestPermissionsAsync()
            if ((Platform.OS === 'android' && res.status !== 'granted') || (Platform.OS === 'ios' && res.ios.status !== Notifications.IosAuthorizationStatus.AUTHORIZED)) {
                deleteStorageData(PUSH_TOKEN)
                return;
            }
        }
        const token = (await Notifications.getExpoPushTokenAsync({ experienceId: '@gsjardim83/foodFreedomApp' })).data;
        report.log(`Saving push token ${token} for user ${auth().currentUser?.uid} - ${auth().currentUser?.displayName}`);
        storeString(PUSH_TOKEN, token)
        saveUserPushtoken(token);

    } catch (error) {
        report.recordError( error)
    }


}

const requestNotificationsPermissionsAndSavePushToken = async () => {
    const res = await Notifications.requestPermissionsAsync();
    if ((Platform.OS === 'android' && res.status !== 'granted') || (Platform.OS === 'ios' && res.ios.status !== Notifications.IosAuthorizationStatus.AUTHORIZED)) {
        deleteStorageData(PUSH_TOKEN)
        return false;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ experienceId: '@gsjardim83/foodFreedomApp' })).data;
    storeString(PUSH_TOKEN, token)
    saveUserPushtoken(token);
    return true;


}

const getNotificationsPermissionCurrentStatus = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    return existingStatus;
}

async function scheduleDailyReminder(trigger, id) {

    getStorageData(id)
        .then(ident => {
            ident && Notifications.cancelScheduledNotificationAsync(ident);
        })
        .then(() => {
            let firstName = store.getState().users.currentUser?.name.split(' ')[0];
            Notifications.scheduleNotificationAsync({
                
                content: {
                    title: 'Reminder',
                    body: id === DAILY_NOTIFICATION_ID ? NotificationsStrings.dailyReminder : `Hi ${firstName},\nThis is your friendly reminder to drink water!`,

                },

                trigger: {
                    hour: trigger.hour,
                    minute: trigger.minutes,
                    repeats: true,
                    channelId: 'Daily',
                },
                

            })
                .then(identifier => storeString(id, identifier));
        })




}

async function cancelReminder(id) {
    getStorageData(id)
        .then(ident => {
            ident && Notifications.cancelScheduledNotificationAsync(ident);
        })
}

export { scheduleDailyReminder, registerForNotifications, getNotificationsPermissionCurrentStatus, requestNotificationsPermissionsAndSavePushToken, cancelReminder }