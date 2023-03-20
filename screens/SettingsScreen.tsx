import React from 'react'
import { useEffect, useState } from "react";
import { Image, View, Text, StyleSheet, Platform } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CustomButton } from "../components/CustomButton";
import { Colors } from '../resources/colors';
import { DefaultPadding, DEFAULT_TIMER, FontFamilies, FontSizes } from "../resources/constants";
import { minusButton, plusButton } from "../resources/imageObj";
import PhoneDimensions from "../resources/layout";
import { SettingsScreenStrings } from "../resources/strings";
import DateTimePicker from '@react-native-community/datetimepicker';
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { get12hourFormatTime, getFormattedDate, stringToTime } from "../resources/common";
import { getStorageData, SETTINGS, storeJSON } from "../dao/internalStorage";
import ActivityIndicatorOverlay from "../components/OverlayActivityIndicator";
import { getNotificationsPermissionCurrentStatus, scheduleDailyReminder } from "../resources/notificationHelper";



export const SettingsScreen = ({ navigation }: any) => {

    let initialTime = DEFAULT_TIMER;
    let initialReminder = new Date();

    const [mealReminderTimer, setMealReminderTimer] = useState(initialTime);
    const [dailyReminderTimer, setDailyReminderTimer] = useState(initialReminder);
    const [isPickerShow, setIsPickerShow] = useState(false);
    const [editButtonLabel, setEditButtonLabel] = useState('Edit');
    const [isScreenReady, setIsScreenReady] = useState(false);

    useEffect(() => {
        getStorageData(SETTINGS)
            .then(value => {
                if (value != null) {
                    let settings = JSON.parse(value);
                    initialTime = parseInt(settings.mealReminder);
                    initialReminder = stringToTime(settings.dailyReminder);
                    setMealReminderTimer(initialTime);
                    setDailyReminderTimer(initialReminder);

                }
            })
            .catch(_error => {
                console.log('Settings screen - get settings storage data failed: ' + _error)
            })
            .finally(() => setIsScreenReady(true))
    }, [])

    const toggleTimePicker = () => {
        setIsPickerShow(!isPickerShow)
        if (isPickerShow) {
            setEditButtonLabel('Edit')
        }
        else {
            setEditButtonLabel('Set')
        }

    }

    const onChange = (event: any, date?: any) => {

        if (date != null) {
            setDailyReminderTimer(date);
        }
        if (Platform.OS === 'android') {
            setIsPickerShow(false);
        }
    };

    const adjustMealReminderTimer = (mode: string) => {
        let timer: number = 0;
        if (mode === 'add') {
            timer = mealReminderTimer + 1;

        }
        else {
            if (mealReminderTimer > 0)
                timer = mealReminderTimer - 1;
        }
        setMealReminderTimer(timer)
    }

    const onSave = async () => {
        if (mealReminderTimer != initialTime || dailyReminderTimer != initialReminder) {
            //Save settings
            let settings = {
                mealReminder: mealReminderTimer,
                dailyReminder: get12hourFormatTime(dailyReminderTimer),
            }
            storeJSON(SETTINGS, settings);
            const trigger = {hour: dailyReminderTimer.getHours(), minutes: dailyReminderTimer.getMinutes()};
            scheduleDailyReminder(trigger)
            
        }

        navigation.goBack()
    }

    if(!isScreenReady) return ( <ActivityIndicatorOverlay showModal={!isScreenReady}/>)
    return (

        <View style={styles.container}>



            <Text style={[styles.generalTitleText, styles.titleText]}>
                {SettingsScreenStrings.title}
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={styles.adviceText}>
                {SettingsScreenStrings.turnOffSettings}
            </Text>

            <View style={{ flex: 2 }} />

            <View style={styles.dailyReminderView}>
                <Text style={styles.generalTitleText}>
                    {SettingsScreenStrings.dailyReminder}
                </Text>
                <View style={styles.setDailyReminderView}>

                    <Text style={styles.reminderTimeText} >{get12hourFormatTime(dailyReminderTimer)}</Text>
                    <TouchableOpacity
                        onPress={() => toggleTimePicker()}
                        style={styles.editTimerButton}>
                        <Text style={styles.reminderTimeText}>{Platform.OS === 'android' ? 'Edit' : editButtonLabel}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isPickerShow && (
                <DateTimePicker
                    testID="dateTimePickerSettings"
                    value={dailyReminderTimer}
                    mode={'time'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={onChange}
                    style={{ backgroundColor: '#fff', width: PhoneDimensions.window.width * 0.9 }}
                    textColor={Colors.fontColor}
                    locale="en-CAN"
                />
            )}

            <View style={{ flex: 2 }} />

            <View style={styles.mealReminderView}>
                <Text style={styles.generalTitleText}>
                    {SettingsScreenStrings.mealReminder}
                </Text>
                <View style={styles.setMealReminderView}>
                    <TouchableOpacity
                        onPress={() => adjustMealReminderTimer('minus')}
                    >
                        <Image source={minusButton} style={styles.setTimerButton} />
                    </TouchableOpacity>
                    <Text style={[styles.reminderTimeText, { marginHorizontal: PhoneDimensions.window.width * 0.05 }]}>
                        {`${mealReminderTimer} minutes`}
                    </Text>
                    <TouchableOpacity
                        onPress={() => adjustMealReminderTimer('add')}
                    >
                        <Image source={plusButton} style={styles.setTimerButton} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 3 }} />

            <CustomButton
                roundCorners={true}
                label={SettingsScreenStrings.saveClose}
                onPress={onSave}
            />

            <View style={{ flex: 10 }} />



        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: PhoneDimensions.window.height * 0.05,
        paddingHorizontal: DefaultPadding,
        backgroundColor: Colors.white,
    },

    generalTitleText: {
        fontFamily: FontFamilies.Verdana,
        color: Colors.primaryColor,
        fontSize: FontSizes.small_2,
        marginBottom: 15,
        textAlign: 'center',
    },

    titleText: {
        fontSize: FontSizes.medium_2,
    },

    adviceText: {
        fontFamily: FontFamilies.Verdana,
        color: Colors.fontColor,
        fontSize: FontSizes.small_1 * 1.2,
    },

    dailyReminderView: {
        alignItems: 'center',
    },

    setDailyReminderView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },

    editTimerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderColor: Colors.primaryColor,
        borderWidth: 2,
        borderRadius: 12,
        marginLeft: PhoneDimensions.window.width * 0.06
    },

    reminderTimeText: {
        fontFamily: FontFamilies.Verdana,
        color: Colors.fontColor,
        fontSize: FontSizes.small_2,
    },

    mealReminderView: {
        alignItems: 'center',
    },

    setMealReminderView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

    setTimerButton: {
        height: PhoneDimensions.window.width * 0.1,
        resizeMode: 'contain',
    },

})
