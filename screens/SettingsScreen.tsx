import React from 'react'
import { useEffect, useState } from "react";
import { Image, View, Text, StyleSheet, Platform, Switch } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CustomButton } from "../components/CustomButton";
import { Colors } from '../resources/colors';
import { DefaultPadding, DEFAULT_TIMER, FontFamilies, FontSizes, ToastDuration } from "../resources/constants";
import { minusButton, plusButton } from "../resources/imageObj";
import PhoneDimensions from "../resources/layout";
import { SettingsScreenStrings } from "../resources/strings";
import DateTimePicker from '@react-native-community/datetimepicker';
import { get12hourFormatTime, getFormattedDate, stringToTime } from "../resources/common";
import { DAILY_NOTIFICATION_ID, EVENING_NOTIFICATION_ID, getStorageData, MORNING_NOTIFICATION_ID, SETTINGS, storeJSON } from "../dao/internalStorage";
import ActivityIndicatorOverlay from "../components/OverlayActivityIndicator";
import { cancelReminder, scheduleDailyReminder } from "../resources/notificationHelper";
import EmptyDialog from '../components/EmptyDialog';
import report from '../components/CrashReport';
import { useToast } from "react-native-fast-toast";


export interface WaterReminder {
    morning: {
        time: Date,
        enabled: boolean
    },
    evening: {
        time: Date,
        enabled: boolean
    }
}

const DAILY = 'daily';
const MORNING = 'morning';
const EVENING = 'evening';

export const SettingsScreen = ({ navigation }: any) => {

    let initialTime = DEFAULT_TIMER;
    let initialReminder = new Date();
    let morningDateObj = new Date();
    let eveningDateObj = new Date();
    initialReminder.setHours(20);
    initialReminder.setMinutes(0);
    morningDateObj.setHours(10);
    morningDateObj.setMinutes(0);
    eveningDateObj.setHours(15);
    eveningDateObj.setMinutes(0);
    let initialWaterReminder: WaterReminder = {
        morning: { time: morningDateObj, enabled: true },
        evening: { time: eveningDateObj, enabled: true }
    }

    const [mealReminderTimer, setMealReminderTimer] = useState(initialTime);
    const [dailyReminderTimer, setDailyReminderTimer] = useState(initialReminder);
    const [isPickerShow, setIsPickerShow] = useState(false);
    // const [editButtonLabel, setEditButtonLabel] = useState('Edit');
    const [isScreenReady, setIsScreenReady] = useState(false);
    const [waterReminder, setWaterReminder] = useState<WaterReminder>(initialWaterReminder);
    const [datePickerTarget, setDatePickerTarget] = useState('');

    //Toast config
    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }


    useEffect(() => {
        getStorageData(SETTINGS)
            .then(value => {
                if (value != null) {
                    let settings = JSON.parse(value);
                    initialTime = parseInt(settings.mealReminder);
                    initialReminder = stringToTime(settings.dailyReminder);
                    setMealReminderTimer(initialTime);
                    setDailyReminderTimer(initialReminder);
                    setWaterReminder({
                        morning: { time: stringToTime(settings.waterReminder.morning.time), enabled: settings.waterReminder.morning.enabled },
                        evening: { time: stringToTime(settings.waterReminder.evening.time), enabled: settings.waterReminder.evening.enabled }
                    })

                }
            })
            .catch(_error => {
                report.log('Settings screen - get settings storage data failed: ' + _error)
            })
            .finally(() => setIsScreenReady(true))
    }, [])

    const toggleTimePicker = (target: string) => {
        setIsPickerShow(!isPickerShow);
        setDatePickerTarget(target);
        // if (isPickerShow) {
        //     setEditButtonLabel('Edit')
        // }
        // else {
        //     setEditButtonLabel('Set')
        // }

    }

    const onChange = (event: any, date?: any) => {
        if (date != null && event.type === 'set') {
            if (datePickerTarget === DAILY) setDailyReminderTimer(date);
            else if (datePickerTarget === MORNING) setWaterReminder({ ...waterReminder, morning: { time: date, enabled: waterReminder.morning.enabled } })
            else if (datePickerTarget === EVENING) setWaterReminder({ ...waterReminder, evening: { time: date, enabled: waterReminder.evening.enabled } })
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
        if (mealReminderTimer != initialTime || dailyReminderTimer != initialReminder || waterReminder != initialWaterReminder) {
            //Save settings
            try {
                let settings = {
                    mealReminder: mealReminderTimer,
                    dailyReminder: get12hourFormatTime(dailyReminderTimer),
                    waterReminder: {
                        morning: { time: get12hourFormatTime(waterReminder.morning.time), enabled: waterReminder.morning.enabled },
                        evening: { time: get12hourFormatTime(waterReminder.evening.time), enabled: waterReminder.evening.enabled },
                    }
                }
                storeJSON(SETTINGS, settings);
                const trigger = { hour: dailyReminderTimer.getHours(), minutes: dailyReminderTimer.getMinutes() };
                scheduleDailyReminder(trigger, DAILY_NOTIFICATION_ID);
                const morningTrigger = { hour: waterReminder.morning.time.getHours(), minutes: waterReminder.morning.time.getMinutes() };
                if (waterReminder.morning.enabled) scheduleDailyReminder(morningTrigger, MORNING_NOTIFICATION_ID)
                else cancelReminder(MORNING_NOTIFICATION_ID)
                const eveningTrigger = { hour: waterReminder.evening.time.getHours(), minutes: waterReminder.evening.time.getMinutes() };
                if (waterReminder.evening.enabled) scheduleDailyReminder(eveningTrigger, EVENING_NOTIFICATION_ID)
                else cancelReminder(EVENING_NOTIFICATION_ID)

                showToast(SettingsScreenStrings.saveConfirmation)
            }
            catch (error) {
                report.recordError(error)
            }

        }

        navigation.goBack()
    }

    const getButtonLabel = (target: string) => {
        if (Platform.OS === 'ios' && isPickerShow && datePickerTarget === target)
            return 'Set';
        return 'Edit';
    }

    const DATE_PICKER = <DateTimePicker
        testID="dateTimePickerSettings"
        value={datePickerTarget === DAILY ? dailyReminderTimer : datePickerTarget === MORNING ? waterReminder.morning.time : waterReminder.evening.time}
        mode={'time'}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        is24Hour={false}
        onChange={onChange}
        style={{ backgroundColor: '#fff', width: PhoneDimensions.window.width * 0.9 }}
        textColor={Colors.fontColor}
        locale="en-CAN"
    />

    if (!isScreenReady) return (<ActivityIndicatorOverlay showModal={!isScreenReady} />)
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
                        onPress={() => toggleTimePicker(DAILY)}
                        style={styles.editTimerButton}>
                        <Text style={styles.reminderTimeText}>{getButtonLabel(DAILY)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 2 }} />

            <View style={styles.waterReminderView}>
                <Text style={styles.generalTitleText}>
                    {SettingsScreenStrings.waterReminder}
                </Text>
                <View style={styles.setWaterReminderView}>

                    <Text style={[styles.reminderTimeText, { color: waterReminder.morning.enabled ? Colors.fontColor : Colors.mediumGray }]} >{get12hourFormatTime(waterReminder.morning.time)}</Text>
                    <TouchableOpacity
                        disabled={!waterReminder.morning.enabled}
                        onPress={() => toggleTimePicker(MORNING)}
                        style={[styles.editTimerButton, { borderColor: waterReminder.morning.enabled ? Colors.primaryColor : Colors.mediumGray }]}>
                        <Text style={[styles.reminderTimeText, { color: waterReminder.morning.enabled ? Colors.fontColor : Colors.mediumGray }]}>{getButtonLabel(MORNING)}</Text>
                    </TouchableOpacity>
                    <Switch
                        trackColor={{ false: Colors.lightGray, true: Colors.lightGreen }}
                        thumbColor={waterReminder.morning.enabled ? Colors.primaryColor : Colors.darkGray}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(value) => setWaterReminder({ ...waterReminder, morning: { time: waterReminder.morning.time, enabled: value } })}
                        value={waterReminder.morning.enabled}
                        style={styles.switch}
                    />
                </View>

                <View style={[styles.setWaterReminderView, { marginTop: 15 }]}>

                    <Text style={[styles.reminderTimeText, { color: waterReminder.evening.enabled ? Colors.fontColor : Colors.mediumGray }]} >{get12hourFormatTime(waterReminder.evening.time)}</Text>
                    <TouchableOpacity
                        disabled={!waterReminder.evening.enabled}
                        onPress={() => toggleTimePicker(EVENING)}
                        style={[styles.editTimerButton, { borderColor: waterReminder.evening.enabled ? Colors.primaryColor : Colors.mediumGray }]}>
                        <Text style={[styles.reminderTimeText, { color: waterReminder.evening.enabled ? Colors.fontColor : Colors.mediumGray }]}>{getButtonLabel(EVENING)}</Text>
                    </TouchableOpacity>
                    <Switch
                        trackColor={{ false: Colors.lightGray, true: Colors.lightGreen }}
                        thumbColor={waterReminder.evening.enabled ? Colors.primaryColor : Colors.darkGray}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(value) => setWaterReminder({ ...waterReminder, evening: { time: waterReminder.evening.time, enabled: value } })}
                        value={waterReminder.evening.enabled}
                        style={styles.switch}
                    />
                </View>
            </View>

            {isPickerShow && (
                Platform.OS === 'android' ? DATE_PICKER
                    :
                    <EmptyDialog
                        content={
                            <View>
                                {DATE_PICKER}
                                <View style={{ alignSelf: 'center' }}>
                                    <CustomButton
                                        label={'Done'}
                                        onPress={() => toggleTimePicker(datePickerTarget)}
                                        roundCorners={true}
                                        width={100}
                                    />
                                </View>
                            </View>
                        }
                        dialogWidth='90%'
                        showModal={isPickerShow}
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

    waterReminderView: {
        alignItems: 'center',
    },

    setWaterReminderView: {
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

    switch: {
        marginLeft: PhoneDimensions.window.width * 0.06,
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
