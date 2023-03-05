import MyNotification from "../models/NotificationModel";
import { deleteStorageData, getStorageData, NOTIFICATIONS, storeJSON } from "./internalStorage";

async function saveNotification(notification) {
    const value = await getStorageData(NOTIFICATIONS);
    console.log('Save notifications current value - ' + value)
    let notificationArray;
    if (value == null ) {
        notificationArray = new Array();
    }
    else notificationArray = JSON.parse(JSON.parse(value))?.data;
    
    notificationArray.push(notification);
    let obj = {
        data: notificationArray
    }

    storeJSON(NOTIFICATIONS, JSON.stringify(obj));
}

async function getLocalNotifications() {
    return JSON.parse(JSON.parse(await getStorageData(NOTIFICATIONS)))?.data;
}

async function saveNotificationsArray(notifications){
    let obj = {
        data: notifications
    }
    storeJSON(NOTIFICATIONS, JSON.stringify(obj));
}

export { saveNotification, getLocalNotifications, saveNotificationsArray }