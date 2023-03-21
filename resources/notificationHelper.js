import * as Notifications from "expo-notifications";
import { DAILY_NOTIFICATION_ID, deleteStorageData, getStorageData, PUSH_TOKEN, storeString } from "../dao/internalStorage";
import {  NotificationsStrings } from "./strings";
import { saveUserPushtoken } from "../dao/userDAO";
import { Platform } from "react-native";

const registerForNotifications = async () => {

    const existingStatus = await getNotificationsPermissionCurrentStatus()
    console.log('Register for notifications function - existing status: ' + existingStatus)
    //if (existingStatus !== 'granted') {
        return await requestNotificationsPermissionsAndSavePushToken()
    //}

}

const requestNotificationsPermissionsAndSavePushToken = async () => {
    const res = await Notifications.requestPermissionsAsync();
    console.log('Permission status: ' + res.status);
    console.log('IOS permission status: ' + res.ios.status);
    if ((Platform.OS === 'android' && res.status !== 'granted') || (Platform.OS === 'ios' && res.ios.status !== Notifications.IosAuthorizationStatus.AUTHORIZED)) {
        deleteStorageData(PUSH_TOKEN)
        return false;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ experienceId: '@gsjardim83/foodFreedomApp' })).data;
    console.log('Saving push token');
    storeString(PUSH_TOKEN, token)
    saveUserPushtoken(token);
    return true;


}

const getNotificationsPermissionCurrentStatus = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    return existingStatus;
}

async function scheduleDailyReminder(trigger) {

    console.log('Notification helper: ScheduleDailyReminder called. Trigger ' + JSON.stringify(trigger))
    getStorageData(DAILY_NOTIFICATION_ID)
        .then(ident => {
            ident && Notifications.cancelScheduledNotificationAsync(ident);
        })
        .then(() => {
            Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Reminder',
                    body: NotificationsStrings.dailyReminder,
                },

                trigger: {
                    hour: trigger.hour,
                    minute: trigger.minutes,
                    repeats: true,
                    channelId: 'Daily',
                }
            })
                .then(identifier => storeString(DAILY_NOTIFICATION_ID, identifier));
        })




}

export { scheduleDailyReminder, registerForNotifications, getNotificationsPermissionCurrentStatus, requestNotificationsPermissionsAndSavePushToken }