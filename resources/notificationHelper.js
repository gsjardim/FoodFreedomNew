import * as Notifications from "expo-notifications";
import { DAILY_NOTIFICATION_ID, getStorageData, storeString } from "../dao/internalStorage";
import { NotificationsStrings } from "./strings";

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

export { scheduleDailyReminder }