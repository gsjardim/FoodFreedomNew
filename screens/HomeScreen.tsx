import { useEffect, useRef, useState } from "react";
import React from 'react'
import { Image, View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Alert, Platform } from "react-native";
import { DAILY_NOTIFICATION_ID, deleteStorageData, getStorageData, LAST_NEW_VIDEO, PUSH_TOKEN, SETTINGS, storeString } from "../dao/internalStorage";
import store from "../redux.store/configureStore";
import { Colors } from '../resources/colors';
import { compareDates, dateToKeyDate, getFormattedDate, keyDateToDate, stringToTime } from "../resources/common";
import { Activities, DEFAULT_DAILY_REMINDER, FontFamilies, } from "../resources/constants";
import { exerciseJournal, foodMoodJournal, sleepJournal, waterJournal } from "../resources/imageObj";
import PhoneDimensions from "../resources/layout";
import { AlertDialogStrings, ButtonStrings, HomeScreenStrings, NotificationsStrings } from "../resources/strings";
import * as Notifications from "expo-notifications";
import { scheduleDailyReminder } from "../resources/notificationHelper";
import { saveUserPushtoken } from "../dao/userDAO";


const dateSelectorViewSize = PhoneDimensions.window.width / 10;

const ActivityTile = (props: any) => {
    return (
        <TouchableOpacity
            style={styles.tileWrapper}
            onPress={() => props.onPressActivity(props.screen)}
        >
            <Image source={props.activityImg} style={[styles.tileImage, { width: props.screen == 'ExerciseScreen' ? '68%' : '50%' }]} />
            <View style={styles.tileTextView}>
                <Text style={styles.tileText}>{props.activityLabel}</Text>
            </View>
        </TouchableOpacity>
    )
}

const DateSelectorCircle = (props: any) => {

    let selectedDate = props.selectedDate
    let date = props.date
    let isFocused = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth()
    return (
        <TouchableOpacity
            style={[styles.dateSelectorView, { backgroundColor: isFocused ? Colors.primaryColor : Colors.white }]}
            onPress={() => {
                props.onSelect(date);
            }}
        >
            <Text style={styles.dateSelectorText}>{date.getDate().toString()}</Text>
        </TouchableOpacity>
    )
}

export const HomeScreen = ({ navigation }: any) => {

   

    const startActivity = (activity: string) => {
        if (compareDates(selectedDate, new Date()) < 0) {
            Alert.alert('Past date alert', 'You are creating/editing a record for a past date. Continue?', [
                {
                    text: 'Yes',
                    onPress: () => navigation.navigate(activity, { currentDate: dateToKeyDate(selectedDate) }),
                    style: 'default'
                },
                {
                    text: 'No',
                    style: 'default'
                }
            ])
        }
        else {
            navigation.navigate(activity, { currentDate: dateToKeyDate(selectedDate) })
        }

    }

    let dates: Array<any> = [];
    let ind = 30;
    while (ind >= 0) {
        let dateObj = new Date()
        dateObj.setDate(dateObj.getDate() - ind--)
        dates.push({ index: ind.toString(), date: dateObj });
    }

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [userName, setUserName] = useState(store.getState().users.currentUser != null ? store.getState().users.currentUser.name : "")
    let displayName;
    if (userName.includes(" ")) displayName = userName.split(" ")[0];
    else displayName = userName;

    useEffect(() => {

        getStorageData(DAILY_NOTIFICATION_ID)
            .then(value => {
                if (value == null) {// This will only run the first time the app is open
                    console.log('Homescreen: scheduling daily reminders.')
                    scheduleDailyReminder(DEFAULT_DAILY_REMINDER)
                }
            })

        function areThereNewVideos() {
            let latestVideoDate = '';
            for (let v of store.getState().general.videosArray) {
                if (v.isNew && (latestVideoDate === '' || compareDates(keyDateToDate(latestVideoDate), keyDateToDate(v.dateCreated)) < 0)) {
                    latestVideoDate = v.dateCreated;
                }
            }
            if (latestVideoDate !== '') {
                alert(AlertDialogStrings.newVideosDialog);
                storeString(LAST_NEW_VIDEO, latestVideoDate)
            }
        }

        areThereNewVideos()

        const unsubscribe = store.subscribe(() => {
            if (store.getState().users.currentUser != null)
                setUserName(store.getState().users.currentUser.name)
        })
        return unsubscribe;
    }, [])


    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.screenHeaderView}>
                <Text style={styles.screenHeaderText}>{`${displayName}'s Journal - ${getFormattedDate(selectedDate)}`}</Text>
            </View>

            <FlatList
                style={styles.flatListStyle}
                contentContainerStyle={{ paddingVertical: 10 }}
                data={dates}
                horizontal={true}
                keyExtractor={(item) => item.index}
                renderItem={(value) => <DateSelectorCircle date={value.item.date} onSelect={setSelectedDate} selectedDate={selectedDate} />}
                getItemLayout={(_data, index) => ({
                    length: (dateSelectorViewSize + dateSelectorViewSize / 3),
                    offset: (dateSelectorViewSize + dateSelectorViewSize / 3) * index,
                    index
                })}
                initialScrollIndex={30}
                showsHorizontalScrollIndicator={false}

            />
            <View style={styles.tilesArea}>
                <View style={styles.tilesHorizontalView}>
                    <ActivityTile
                        activityImg={foodMoodJournal}
                        activityLabel={HomeScreenStrings.foodMoodJournal}
                        onPressActivity={startActivity}
                        screen={Activities.food}
                    />
                    <ActivityTile
                        activityImg={waterJournal}
                        activityLabel={HomeScreenStrings.waterTracker}
                        onPressActivity={startActivity}
                        screen={Activities.water}
                    />
                </View>
                <View style={styles.tilesHorizontalView}>
                    <ActivityTile
                        activityImg={exerciseJournal}
                        activityLabel={HomeScreenStrings.exerciseTracker}
                        onPressActivity={startActivity}
                        screen={Activities.exercise}
                    />
                    <ActivityTile
                        activityImg={sleepJournal}
                        activityLabel={HomeScreenStrings.sleepTracker}
                        screen={Activities.sleep}
                        onPressActivity={startActivity}
                    />
                </View>

            </View>
        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    //Screen
    container: {
        flex: 1,
    },

    screenHeaderView: {
        width: '100%',
        backgroundColor: Colors.opaqueWhite,
        paddingVertical: PhoneDimensions.window.height * 0.02,
        justifyContent: 'center',
        alignItems: 'center',
    },

    screenHeaderText: {
        color: Colors.fontColor,
        fontSize: PhoneDimensions.window.width / 24,
        fontFamily: FontFamilies.Verdana,
        fontWeight: 'bold',
    },

    flatListStyle: {
        flexDirection: 'row',
        flexGrow: 0,
        backgroundColor: Colors.white,
        borderTopColor: Colors.lightGray,
        borderTopWidth: 1,
    },

    tilesArea: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: Colors.lightGray,
        paddingHorizontal: 3,
        paddingVertical: 2
    },

    //Activity tiles
    tilesHorizontalView: {
        flex: 1,
        flexDirection: 'row',
    },

    tileWrapper: {
        //width: '100%',
        //marginVertical: 4,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: '3%',
        paddingVertical: '6%',
        backgroundColor: '#fff',
        borderColor: Colors.lightGray,
        borderWidth: 1,
        flex: 1,

    },

    tileImage: {
        width: '50%',
        resizeMode: 'contain',
        //flex: 1,
        maxHeight: '85%'
    },

    tileTextView: {
        marginTop: 15
    },

    tileText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: PhoneDimensions.window.height / 40,
        textAlign: 'center',
        color: Colors.fontColor
    },

    //Date selector
    dateSelectorView: {
        // backgroundColor: Colors.primaryColor,
        marginHorizontal: dateSelectorViewSize / 6,
        padding: 6,
        width: dateSelectorViewSize,
        height: dateSelectorViewSize,
        borderRadius: dateSelectorViewSize / 2,
        justifyContent: 'center',
        alignItems: 'center',

    },

    dateSelectorText: {
        color: Colors.fontColor,
        fontSize: dateSelectorViewSize * 0.5
    }

})